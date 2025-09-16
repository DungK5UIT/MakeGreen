package com.project.MakeGreen.services;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.time.OffsetDateTime;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.TreeMap;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.MakeGreen.config.VNPayConfig;
import com.project.MakeGreen.models.DonThue;
import com.project.MakeGreen.models.ThanhToan;
import com.project.MakeGreen.repositories.DonThueRepository;
import com.project.MakeGreen.repositories.ThanhToanRepository;

@Service
public class VNPayService {

    private static final Logger logger = LoggerFactory.getLogger(VNPayService.class);

    @Autowired
    private VNPayConfig.VNPayProperties vnPayProperties;

    @Autowired
    private DonThueRepository donThueRepository;

    @Autowired
    private ThanhToanRepository thanhToanRepository;

    public String createPaymentUrl(DonThue donThue, String ipAddress) throws UnsupportedEncodingException {
        // Validate donThue and chi_phi_uoc_tinh
        if (donThue == null || donThue.getId() == null) {
            logger.error("Invalid don_thue: null or missing ID");
            throw new IllegalArgumentException("DonThue cannot be null and must have an ID");
        }
        if (donThue.getChiPhiUocTinh() == null || donThue.getChiPhiUocTinh().compareTo(BigDecimal.ZERO) <= 0) {
            logger.error("Invalid don_thue amount: {}", donThue.getChiPhiUocTinh());
            throw new IllegalArgumentException("DonThue amount must be positive and non-null");
        }

        // Calculate deposit (50% of chi_phi_uoc_tinh)
        BigDecimal depositAmount = donThue.getChiPhiUocTinh().multiply(new BigDecimal("0.5"));

        // Calculate vnp_Amount for deposit
        BigDecimal amount = depositAmount.multiply(new BigDecimal("100"));
        if (amount.scale() > 0) {
            logger.warn("Amount {} has decimal places, rounding to integer", amount);
            amount = amount.setScale(0, RoundingMode.DOWN);
        }
        if (amount.longValue() % 100 != 0) {
            logger.error("vnp_Amount {} is not a multiple of 100", amount.longValue());
            throw new IllegalArgumentException("vnp_Amount must be a multiple of 100");
        }
        String vnp_Amount = String.valueOf(amount.longValue());
        logger.info("vnp_Amount: {}", vnp_Amount);

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = donThue.getId().toString();
        String vnp_OrderInfo = "Thanh toan don thue " + donThue.getId();
        String vnp_OrderType = "billpayment";
        String vnp_Locale = "vn";
        String vnp_CurrCode = "VND";
        String vnp_IpAddr = ipAddress;

        // Ensure GMT+7 timezone
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        logger.info("vnp_CreateDate: {}", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 60); // Timeout 60 phút
        String vnp_ExpireDate = formatter.format(cld.getTime());
        logger.info("vnp_ExpireDate: {}", vnp_ExpireDate);

        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnPayProperties.getTmnCode());
        vnp_Params.put("vnp_Amount", vnp_Amount);
        vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", URLEncoder.encode(vnp_OrderInfo, StandardCharsets.UTF_8.toString()));
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", vnPayProperties.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Log all parameters
        vnp_Params.forEach((key, value) -> logger.info("VNPay param: {} = {}", key, value));

        String queryString = buildQueryString(vnp_Params);
        logger.info("Query string: {}", queryString);
        String secureHash = generateSecureHash(queryString);
        logger.info("Secure hash: {}", secureHash);

        String paymentUrl = vnPayProperties.getPaymentUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
        logger.info("Generated VNPay payment URL: {}", paymentUrl);

        // Save thanh_toan record for deposit
        ThanhToan thanhToan = ThanhToan.builder()
                .nguoiDungId(donThue.getNguoiDungId())
                .donThueId(donThue.getId())
                .loai("deposit")
                .phuongThuc("vnpay")
                .soTien(depositAmount)
                .trangThai("PENDING")
                .build();
        thanhToanRepository.save(thanhToan);

        return paymentUrl;
    }

    public boolean verifyPaymentResponse(Map<String, String> params) throws UnsupportedEncodingException {
        Map<String, String> paramsWithoutHash = new TreeMap<>(params);
        String receivedHash = paramsWithoutHash.remove("vnp_SecureHash");  // Remove trước khi build
        if (receivedHash == null) {
            return false;  // Không có hash → invalid
        }
        String queryString = buildQueryString(paramsWithoutHash);
        String calculatedHash = generateSecureHash(queryString);
        logger.info("Verifying payment response: receivedHash={}, calculatedHash={}", receivedHash, calculatedHash);
        return receivedHash.equals(calculatedHash);
    }

    public void processPaymentCallback(Map<String, String> params) {
        logger.info("Processing VNPay callback: vnp_TxnRef={}, vnp_ResponseCode={}, vnp_TransactionNo={}", 
            params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"), params.get("vnp_TransactionNo"));

        UUID donThueId = UUID.fromString(params.get("vnp_TxnRef"));
        DonThue donThue = donThueRepository.findById(donThueId)
                .orElseThrow(() -> new IllegalArgumentException("DonThue not found: " + params.get("vnp_TxnRef")));

        if (!"PENDING".equals(donThue.getTrangThai())) {
            logger.warn("DonThue {} is not in PENDING status, skipping callback processing", params.get("vnp_TxnRef"));
            return;
        }

        // Fix duplicate: Sử dụng List thay vì single
        List<ThanhToan> payments = thanhToanRepository.findByDonThueIdAndPhuongThuc(donThueId, "vnpay");
        if (payments.isEmpty()) {
            logger.error("No payment found for donThueId: {} and phuongThuc: vnpay", donThueId);
            throw new IllegalArgumentException("ThanhToan not found for don_thue: " + donThueId);
        }
        if (payments.size() > 1) {
            logger.warn("Duplicate payments found for donThueId: {} and phuongThuc: vnpay. Using first one.", donThueId);
            // Mark duplicates as INVALID to avoid future conflicts
            for (ThanhToan dup : payments.subList(1, payments.size())) {
                dup.setTrangThai("INVALID");
                thanhToanRepository.save(dup);
            }
        }
        ThanhToan thanhToan = payments.get(0); // Lấy record đầu tiên

        String responseCode = params.get("vnp_ResponseCode");

        if ("00".equals(responseCode)) {
            donThue.setTrangThai("CONFIRMED");
            thanhToan.setTrangThai("SUCCESS");
            thanhToan.setThanhToanLuc(OffsetDateTime.now());
        } else {
            donThue.setTrangThai("FAILED");
            thanhToan.setTrangThai("FAILED");
        }

        donThueRepository.save(donThue);
        thanhToanRepository.save(thanhToan);

        logger.info("Processed VNPay callback for don_thue {}: {}", params.get("vnp_TxnRef"), thanhToan.getTrangThai());
    }

    private String buildQueryString(Map<String, String> params) throws UnsupportedEncodingException {
        StringBuilder query = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = params.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()));
            query.append("=");
            query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
            if (itr.hasNext()) {
                query.append("&");
            }
        }
        return query.toString();
    }

    private String generateSecureHash(String queryString) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA512");
            SecretKeySpec secret_key = new SecretKeySpec(vnPayProperties.getHashSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(queryString.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Error generating secure hash: {}", e.getMessage());
            throw new IllegalStateException("Failed to generate secure hash: " + e.getMessage(), e);
        }
    }
}