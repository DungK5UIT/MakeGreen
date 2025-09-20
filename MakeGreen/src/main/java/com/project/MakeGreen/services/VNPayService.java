// Backend: VNPayService.java (full code with fixes: UTF_8 in verify, added detailed log in processPaymentCallback)
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
import java.time.ZonedDateTime;
import java.util.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.MakeGreen.config.VNPayConfig;
import com.project.MakeGreen.models.*;
import com.project.MakeGreen.repositories.*;

import jakarta.transaction.Transactional;

@Service
public class VNPayService {

    private static final Logger logger = LoggerFactory.getLogger(VNPayService.class);

    @Autowired
    private VNPayConfig.VNPayProperties vnPayProperties;

    @Autowired
    private DonThueRepository donThueRepository;

    @Autowired
    private ThanhToanRepository thanhToanRepository;

    @Autowired
    private XeRepository xeRepository;

    @Autowired
    private ViTriXeRepository viTriXeRepository;

    @Autowired
    private ChuyenDiRepository chuyenDiRepository;

    public String createPaymentUrl(DonThue donThue, String ipAddress) throws UnsupportedEncodingException {
        if (donThue == null || donThue.getId() == null) {
            throw new IllegalArgumentException("DonThue cannot be null and must have an ID");
        }
        if (donThue.getChiPhiUocTinh() == null || donThue.getChiPhiUocTinh().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("DonThue amount must be positive and non-null");
        }

        BigDecimal depositAmount = donThue.getChiPhiUocTinh().multiply(new BigDecimal("0.5"));
        BigDecimal amount = depositAmount.multiply(new BigDecimal("100")).setScale(0, RoundingMode.DOWN);

        if (amount.longValue() % 100 != 0) {
            throw new IllegalArgumentException("vnp_Amount must be a multiple of 100");
        }

        String vnp_Amount = String.valueOf(amount.longValue());
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = donThue.getId().toString();
        String vnp_OrderInfo = "Thanh toan don thue " + donThue.getId();
        String vnp_OrderType = "billpayment";
        String vnp_Locale = "vn";
        String vnp_CurrCode = "VND";
        String vnp_IpAddr = ipAddress;

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        cld.add(Calendar.MINUTE, 60);
        String vnp_ExpireDate = formatter.format(cld.getTime());

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

        String queryString = buildQueryString(vnp_Params);
        String secureHash = generateSecureHash(queryString);
        String paymentUrl = vnPayProperties.getPaymentUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

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
    public boolean verifyPaymentResponse(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null) {
                logger.warn("Missing vnp_SecureHash in callback params");
                return false;
            }

            List<String> fieldNames = new ArrayList<>(params.keySet());
            fieldNames.remove("vnp_SecureHashType"); // nếu có
            fieldNames.remove("vnp_SecureHash");
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    // SỬA: Dùng UTF_8 để consistent với buildQueryString
                    String encodedFieldName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString());
                    String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());
                    hashData.append(encodedFieldName).append("=").append(encodedFieldValue);
                    if (itr.hasNext()) {
                        hashData.append("&");
                    }
                }
            }

            String generatedHash = hmacSHA512(vnPayProperties.getHashSecret(), hashData.toString());
            boolean isValid = vnp_SecureHash.equals(generatedHash);

            if (!isValid) {
                logger.warn("Hash mismatch - received: {}, generated: {} for hashData: {}", vnp_SecureHash, generatedHash, hashData);
            }

            return isValid;
        } catch (Exception e) {
            logger.error("Error verifying payment response", e);
            return false;
        }
    }
    // Hàm hỗ trợ HMAC SHA512
    private String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                return "";
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));  // Use & 0xff for unsigned byte
            }
            return sb.toString().toLowerCase(Locale.ROOT);  // Explicit lowercase with Locale
        } catch (Exception ex) {
            logger.error("Error generating HMAC SHA512", ex);
            return "";
        }
    }
    
    @Transactional
    public void processPaymentCallback(Map<String, String> params) {
        try {
            UUID donThueId = UUID.fromString(params.get("vnp_TxnRef"));
            logger.info("Processing callback for donThueId: {}, responseCode: {}", donThueId, params.get("vnp_ResponseCode"));

            DonThue donThue = donThueRepository.findById(donThueId)
                    .orElseThrow(() -> new IllegalArgumentException("DonThue not found: " + donThueId));
            logger.info("Found donThue with status: {}", donThue.getTrangThai());

            if (!"PENDING".equals(donThue.getTrangThai())) {
                logger.warn("Skipping process because not PENDING");
                return;
            }

            List<ThanhToan> payments = thanhToanRepository.findByDonThueIdAndPhuongThuc(donThueId, "vnpay");
            logger.info("Found {} thanhToan records", payments.size());
            if (payments.isEmpty()) {
                throw new IllegalArgumentException("ThanhToan not found for don_thue: " + donThueId);
            }
            ThanhToan thanhToan = payments.get(0);

            String responseCode = params.get("vnp_ResponseCode");

            if ("00".equals(responseCode)) {
                donThue.setTrangThai("CONFIRMED");
                thanhToan.setTrangThai("SUCCESS");
                thanhToan.setThanhToanLuc(OffsetDateTime.now());

                logger.info("Fetching xe for id: {}", donThue.getXe().getId());
                Xe xe = xeRepository.findById(donThue.getXe().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Xe not found: " + donThue.getXe().getId()));
                xe.setTrangThai("UNAVAILABLE");
                logger.info("Saving xe");
                xeRepository.save(xe);

                logger.info("Handling viTriXe for xe: {}", xe.getId());
                viTriXeRepository.findByXe(xe).orElseGet(() -> {  // SỬA: findByXe thay vì findById
                    ViTriXe viTriXe = ViTriXe.builder()
                            .xe(xe)  // SỬA: Thêm .xe(xe) để set xe_id
                            // KHÔNG set .id() - để @UuidGenerator generate tự động
                            .lat(0.0)
                            .lng(0.0)
                            .pin(100)
                            .tocDo(0.0)
                            .soKm(0.0)
                            .capNhatLuc(ZonedDateTime.now())  // Thêm nếu cần
                            .build();
                    logger.info("Saving new viTriXe with generated ID");
                    return viTriXeRepository.save(viTriXe);
                });

                logger.info("Handling chuyenDi");
                chuyenDiRepository.findByDonThueId(donThue.getId()).orElseGet(() -> {
                    ChuyenDi chuyenDi = ChuyenDi.builder()
                            .donThueId(donThue.getId())
                            .nguoiDungId(donThue.getNguoiDungId())
                            .xeId(donThue.getXe().getId())
                            .trangThai("PENDING")
                            .batDauLuc(ZonedDateTime.now())
                            .build();
                    logger.info("Saving new chuyenDi");
                    return chuyenDiRepository.save(chuyenDi);
                });
            } else {
                donThue.setTrangThai("FAILED");
                thanhToan.setTrangThai("FAILED");
            }

            logger.info("Saving donThue and thanhToan");
            donThueRepository.save(donThue);
            thanhToanRepository.save(thanhToan);
        } catch (Exception e) {
            logger.error("Exception in processPaymentCallback: {} - Stack: {}", e.getMessage(), e.getStackTrace());
            throw e;  // Re-throw để catch ở controller
        }
    }

    private String buildQueryString(Map<String, String> params) throws UnsupportedEncodingException {
        StringBuilder query = new StringBuilder();
        for (Iterator<Map.Entry<String, String>> itr = params.entrySet().iterator(); itr.hasNext();) {
            Map.Entry<String, String> entry = itr.next();
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()));
            query.append("=");
            query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
            if (itr.hasNext()) query.append("&");
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
            return hexString.toString().toLowerCase(); // VNPAY dùng lowercase
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Failed to generate secure hash", e);
        }
    }
}