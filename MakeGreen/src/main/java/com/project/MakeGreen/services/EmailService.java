package com.project.MakeGreen.services;

import com.project.MakeGreen.models.DonThue;
import com.project.MakeGreen.models.NguoiDung;
import com.project.MakeGreen.repositories.DonThueRepository;
import com.project.MakeGreen.repositories.NguoiDungRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine; // Spring tự động inject (cần dependency thymeleaf)
    
    @Autowired
    private final NguoiDungRepository nguoiDungRepository;

    @Autowired
    private final DonThueRepository donThueRepository;

    @Value("${spring.mail.username}")
    private String mailFrom;
    
    @Value("${app.mail.sender.name}")
    private String senderName;

    @Async
    @Transactional // Quan trọng: Giữ session mở để load được Xe (Lazy) và tránh lỗi no session
    public void sendOrderCreationEmail(DonThue donThueInput) {
        try {
            logger.info(">>> Bat dau gui email HTML (Async) cho don thue ID: {}", donThueInput.getId());

            // 1. Load lại DonThue từ DB để đảm bảo dữ liệu mới nhất và session sống
            DonThue donThue = donThueRepository.findById(donThueInput.getId()).orElse(null);
            if (donThue == null) {
                logger.error("Khong tim thay don thue ID: {}", donThueInput.getId());
                return;
            }

            // 2. Tìm thông tin Khách hàng (NguoiDung)
            // Vì DonThue chỉ lưu nguoiDungId (UUID), ta phải tìm trong bảng NguoiDung
            UUID uid = donThue.getNguoiDungId();
            NguoiDung nguoiDung = nguoiDungRepository.findById(uid).orElse(null);
            
            String toEmail;
            String tenKhach;

            if (nguoiDung != null && nguoiDung.getEmail() != null) {
                toEmail = nguoiDung.getEmail();
                tenKhach = (nguoiDung.getHoTen() != null && !nguoiDung.getHoTen().isEmpty()) 
                           ? nguoiDung.getHoTen() 
                           : "Quý khách";
            } else {
                logger.warn("Khong tim thay user hoac email cua user ID: {}. Gui ve mail admin test.", uid);
                toEmail = "nguyenhuudung1072005@gmail.com"; // Mail fallback của bạn để test
                tenKhach = "Khách vãng lai";
            }

            // 3. Lấy thông tin Xe (An toàn vì có @Transactional)
            String tenXe = "Xe MakeGreen";
            if (donThue.getXe() != null) {
                tenXe = donThue.getXe().getName();
            }

            // 4. Format tiền tệ cho đẹp (VD: 1,000,000)
            DecimalFormat formatter = new DecimalFormat("#,###");
            String depositStr = (donThue.getSoTienCoc() != null) 
                                ? formatter.format(donThue.getSoTienCoc()) 
                                : "0";
            String totalStr = (donThue.getChiPhiUocTinh() != null) 
                              ? formatter.format(donThue.getChiPhiUocTinh()) 
                              : "0";

            // 5. Chuẩn bị dữ liệu để đẩy vào Template HTML
            Context context = new Context();
            context.setVariable("customerName", tenKhach);
            // Lấy 8 ký tự đầu của UUID cho gọn gàng mã đơn
            context.setVariable("orderId", donThue.getId().toString().substring(0, 8).toUpperCase());
            context.setVariable("vehicleName", tenXe);
            context.setVariable("startDate", donThue.getBatDauLuc());
            context.setVariable("endDate", donThue.getKetThucLuc());
            context.setVariable("deposit", depositStr);
            context.setVariable("totalAmount", totalStr);

            // 6. Xử lý Template HTML
            // "email-template" là tên file email-template.html trong thư mục resources/templates
            String htmlContent = templateEngine.process("email-template", context);

            // 7. Gửi mail
            String subject = "MakeGreen - Xác nhận đơn thuê xe #" + donThue.getId().toString().substring(0, 8).toUpperCase();
            sendHtmlEmail(toEmail, subject, htmlContent);
            
            logger.info(">>> DA GUI EMAIL HTML THANH CONG DEN: {}", toEmail);

        } catch (Exception e) {
            logger.error(">>> LOI GUI MAIL: {}", e.getMessage());
            e.printStackTrace();
        }
    }

    // Hàm gửi mail hỗ trợ HTML
    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException, java.io.UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        // MULTIPART_MODE_MIXED_RELATED hỗ trợ cả đính kèm ảnh hoặc file nếu cần sau này
        MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

        helper.setFrom(mailFrom, senderName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true = Bật chế độ HTML

        mailSender.send(message);
    }
}