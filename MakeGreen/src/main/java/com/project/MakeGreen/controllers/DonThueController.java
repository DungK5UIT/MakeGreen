package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.DonThueDto;
import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.models.DonThue;
import com.project.MakeGreen.services.DonThueService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/donthue")
public class DonThueController {

    @Autowired
    private DonThueService donThueService;

    // Đã xóa EmailService ở đây để tránh dư thừa

    @PostMapping
    public ResponseEntity<?> taoDonThue(
            @RequestParam UUID nguoiDungId,
            @RequestParam UUID xeId,
            @RequestParam(required = false) OffsetDateTime batDauLuc,
            @RequestParam(required = false) OffsetDateTime ketThucLuc,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) BigDecimal soTienCoc,
            @RequestParam(required = false) BigDecimal chiPhiUocTinh,
            @RequestParam UUID tramThueId,
            @RequestParam UUID tramTraId) {
        try {
            log.info("Tao don thue voi nguoiDungId: {}", nguoiDungId);
            
            // 1. Gọi Service tạo đơn (Service sẽ tự lo việc gửi mail)
            DonThue donThue = donThueService.taoDonThue(nguoiDungId, xeId, batDauLuc, ketThucLuc, trangThai, soTienCoc, chiPhiUocTinh, tramThueId, tramTraId);
            log.info("Successfully tao don thue: {}", donThue.getId());

            // ĐÃ XÓA CODE GỬI EMAIL TẠI ĐÂY -> CHỈ GỬI 1 LẦN DUY NHẤT TỪ SERVICE

            return ResponseEntity.ok(DonThueDto.from(donThue));
        } catch (RuntimeException e) {
            log.error("Error tao don thue for nguoiDungId {}: {}", nguoiDungId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DonThueDto>> layTatCaDonThue() {
        log.info("Lay tat ca don thue");
        List<DonThueDto> donThueDtos = donThueService.layTatCaDonThue();
        return ResponseEntity.ok(donThueDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layDonThueTheoId(@PathVariable UUID id) {
        log.info("Lay don thue theo id: {}", id);
        Optional<DonThueDto> optionalDonThueDto = donThueService.layDonThueTheoId(id);
        if (optionalDonThueDto.isPresent()) {
            return ResponseEntity.ok(optionalDonThueDto.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("DonThue not found with id: " + id, HttpStatus.NOT_FOUND.value()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatDonThue(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID nguoiDungId,
            @RequestParam(required = false) UUID xeId,
            @RequestParam(required = false) OffsetDateTime batDauLuc,
            @RequestParam(required = false) OffsetDateTime ketThucLuc,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) BigDecimal soTienCoc,
            @RequestParam(required = false) BigDecimal chiPhiUocTinh,
            @RequestParam(required = false) UUID tramThueId,
            @RequestParam(required = false) UUID tramTraId) {
        try {
            log.info("Cap nhat don thue id: {}", id);
            DonThue updatedDonThue = donThueService.capNhatDonThue(id, nguoiDungId, xeId, batDauLuc, ketThucLuc, trangThai, soTienCoc, chiPhiUocTinh, tramThueId, tramTraId);
            log.info("Successfully cap nhat don thue: {}", updatedDonThue.getId());
            return ResponseEntity.ok(DonThueDto.from(updatedDonThue));
        } catch (RuntimeException e) {
            log.error("Error cap nhat don thue id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaDonThue(@PathVariable UUID id) {
        try {
            log.info("Xoa don thue id: {}", id);
            donThueService.xoaDonThue(id);
            log.info("Successfully xoa don thue: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error xoa don thue id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }
}