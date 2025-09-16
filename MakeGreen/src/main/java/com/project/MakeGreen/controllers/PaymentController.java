package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.dtos.responses.PaymentResponse;
import com.project.MakeGreen.models.DonThue;
import com.project.MakeGreen.models.DongXe;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.repositories.DonThueRepository;
import com.project.MakeGreen.repositories.XeRepository;
import com.project.MakeGreen.repositories.DongXeRepository;
import com.project.MakeGreen.services.VNPayService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.NonUniqueResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/pay")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private static final String FRONTEND_RETURN_URL = "http://localhost:3000/booking";

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private DonThueRepository donThueRepository;

    @Autowired
    private XeRepository xeRepository;

    @Autowired
    private DongXeRepository dongXeRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping("/vnpay/initiate")
    public ResponseEntity<?> initiateVNPayPayment(
            @RequestParam UUID donThueId,
            @RequestParam(required = false) Boolean test,
            @RequestHeader(value = "X-Test-Mode", required = false) String testMode,
            HttpServletRequest request) {
        boolean isTestMode = test != null && test || "true".equals(testMode);
        logger.info("Initiating VNPay payment for donThueId: {}, testMode: {}, headers: {}", 
                    donThueId, isTestMode, request.getHeader("Authorization"));
        
        try {
            DonThue donThue = donThueRepository.findById(donThueId)
                    .orElseThrow(() -> new IllegalArgumentException("DonThue not found: " + donThueId));

            if (!isTestMode) {
                if (!SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
                    logger.warn("Unauthorized request for donThueId: {}", donThueId);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new ErrorResponse("Authentication required", HttpStatus.UNAUTHORIZED.value()));
                }
                String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
                logger.info("Current user ID: {}, donThue nguoi_dung_id: {}", currentUserId, donThue.getNguoiDungId());
                if (!donThue.getNguoiDungId().toString().equals(currentUserId)) {
                    logger.warn("User {} does not have permission for donThueId: {}", currentUserId, donThueId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new ErrorResponse("You do not have permission to initiate payment for this don_thue", HttpStatus.FORBIDDEN.value()));
                }
            }

            if (!"PENDING".equals(donThue.getTrangThai())) {
                logger.warn("DonThue {} status: {}", donThueId, donThue.getTrangThai());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("DonThue is not in PENDING status", HttpStatus.BAD_REQUEST.value()));
            }

            String ipAddress = request.getRemoteAddr();
            String paymentUrl = vnPayService.createPaymentUrl(donThue, ipAddress);
            logger.info("Generated payment URL: {}", paymentUrl);
            return ResponseEntity.ok(new PaymentResponse(donThueId, paymentUrl));
        } catch (IllegalArgumentException e) {
            logger.warn("Error initiating payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            logger.error("System error initiating payment for donThueId: {}", donThueId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("System error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<?> handleVNPayCallback(@RequestParam Map<String, String> params) {
        logger.info("Received VNPay callback with params: {}", params);
        try {
            String donThueId = params.get("vnp_TxnRef");
            String responseCode = params.get("vnp_ResponseCode");
            String status = "FAILED";
            String message = "System error";

            // Verify payment signature
            if (!vnPayService.verifyPaymentResponse(params)) {
                logger.warn("Invalid payment signature for params: {}", params);
                message = "Invalid payment signature";
                return buildRedirectResponse(donThueId, status, message);
            }

            // Process payment callback
            vnPayService.processPaymentCallback(params);
            logger.info("Callback response code: {} for don_thue: {}", responseCode, donThueId);

            // Map response code to status
            status = "00".equals(responseCode) ? "SUCCESS" :
                    responseCode.equals("07") ? "INVALID_FORMAT" :
                    responseCode.equals("11") ? "TIMEOUT" :
                    responseCode.equals("24") ? "CANCELED" : "FAILED";
            message = getVNPayErrorMessage(responseCode);

            return buildRedirectResponse(donThueId, status, message);

        } catch (Exception e) {
            logger.error("Error processing callback: {}", e.getMessage(), e);
            String message = e instanceof IllegalArgumentException ? e.getMessage() : "System error";
            String donThueId = params.get("vnp_TxnRef");
            return buildRedirectResponse(donThueId, "FAILED", message);
        }
    }

    private ResponseEntity<?> buildRedirectResponse(String donThueId, String status, String message) {
        try {
            // Lấy vehicleSlug từ don_thue
            String vehicleSlug = getVehicleSlugFromDonThue(donThueId);
            if (vehicleSlug == null || vehicleSlug.isEmpty()) {
                logger.warn("Cannot find vehicleSlug for donThueId: {}", donThueId);
                vehicleSlug = "";
            }

            // Lấy total từ don_thue
            long total = 0;
            try {
                UUID uuid = UUID.fromString(donThueId);
                String jpqlTotal = "SELECT d.chiPhiUocTinh FROM DonThue d WHERE d.id = :id";
                BigDecimal chiPhiUocTinh = entityManager.createQuery(jpqlTotal, BigDecimal.class)
                        .setParameter("id", uuid)
                        .getSingleResult();
                total = chiPhiUocTinh != null ? chiPhiUocTinh.longValue() : 0;
            } catch (NoResultException e) {
                logger.warn("Cannot fetch total for donThueId: {}", donThueId, e);
                total = 0; // Fallback
            } catch (Exception e) {
                logger.error("Error fetching total for donThueId: {}", donThueId, e);
                total = 0; // Fallback
            }

            // Tạo redirect URL với total
            String redirectUrl = String.format("%s?slug=%s&status=%s&message=%s&donThueId=%s&total=%d",
                    FRONTEND_RETURN_URL,
                    URLEncoder.encode(vehicleSlug, StandardCharsets.UTF_8.toString()),
                    status,
                    URLEncoder.encode(message, StandardCharsets.UTF_8.toString()),
                    donThueId != null ? donThueId : "",
                    total);

            logger.info("Redirecting to: {}", redirectUrl);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .build();
        } catch (UnsupportedEncodingException e) {
            logger.error("Encoding error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Encoding error", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    private String getVehicleSlugFromDonThue(String donThueId) {
        if (donThueId == null) {
            logger.warn("donThueId is null");
            return "";
        }
        try {
            UUID uuid = UUID.fromString(donThueId);
            // Sử dụng query custom với JOIN FETCH để eager load xe và dong_xe
            String jpql = "SELECT d FROM DonThue d " +
                          "JOIN FETCH d.xe x " +
                          "JOIN FETCH x.dongXe dx " +
                          "WHERE d.id = :id";
            DonThue donThue = entityManager.createQuery(jpql, DonThue.class)
                    .setParameter("id", uuid)
                    .getSingleResult();
            
            if (donThue == null || donThue.getXe() == null || donThue.getXe().getDongXe() == null) {
                logger.warn("Cannot find xe or dong_xe for donThueId: {}", donThueId);
                return "";
            }
            
            String slug = donThue.getXe().getDongXe().getSlug();
            if (slug == null || slug.isEmpty()) {
                logger.warn("Slug is null for dongXe in donThueId: {}", donThueId);
                return "";
            }
            return slug;
        } catch (NoResultException e) {
            logger.warn("DonThue not found for id: {}", donThueId);
            return "";
        } catch (NonUniqueResultException e) {
            logger.error("Multiple DonThue found for id: {} - Check DB for duplicates", donThueId, e);
            return "";
        } catch (IllegalArgumentException e) {
            logger.error("Invalid UUID format for donThueId: {}", donThueId, e);
            return "";
        } catch (Exception e) {
            logger.error("Error fetching vehicle slug for donThueId: {}", donThueId, e);
            return "";
        }
    }

    private String getVNPayErrorMessage(String responseCode) {
        switch (responseCode) {
            case "00": return "Giao dịch thành công";
            case "07": return "Dữ liệu gửi sang không đúng định dạng";
            case "11": return "Giao dịch đã quá thời gian chờ thanh toán";
            case "24": return "Giao dịch bị hủy bởi người dùng";
            default: return "Giao dịch thất bại: Mã lỗi " + responseCode;
        }
    }
}