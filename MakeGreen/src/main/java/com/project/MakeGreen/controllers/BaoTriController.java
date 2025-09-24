// BaoTriController.java
package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.BaoTriDto;
import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.models.BaoTri;
import com.project.MakeGreen.services.BaoTriService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/bao-tri")
public class BaoTriController {

    @Autowired
    private BaoTriService baoTriService;

    // Create: Tạo bảo trì mới
    @PostMapping
    public ResponseEntity<?> taoBaoTri(
            @RequestParam UUID xeId,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime lichHen,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime batDauLuc,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime ketThucLuc,
            @RequestParam(required = false) String noiDung) {
        try {
            log.info("Tao bao tri voi xeId: {}", xeId);
            BaoTri baoTri = baoTriService.taoBaoTri(xeId, trangThai, lichHen, batDauLuc, ketThucLuc, noiDung);
            log.info("Successfully tao bao tri: {}", baoTri.getId());
            return ResponseEntity.ok(BaoTriDto.from(baoTri));
        } catch (RuntimeException e) {
            log.error("Error tao bao tri for xeId {}: {}", xeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // Read: Lấy tất cả bảo trì
    @GetMapping
    public ResponseEntity<List<BaoTriDto>> layTatCaBaoTri() {
        log.info("Lay tat ca bao tri");
        List<BaoTriDto> baoTriDtos = baoTriService.layTatCaBaoTri();
        return ResponseEntity.ok(baoTriDtos);
    }

    // Read: Lấy bảo trì theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> layBaoTriTheoId(@PathVariable UUID id) {
        log.info("Lay bao tri theo id: {}", id);
        Optional<BaoTriDto> optionalBaoTriDto = baoTriService.layBaoTriTheoId(id);
        if (optionalBaoTriDto.isPresent()) {
            return ResponseEntity.ok(optionalBaoTriDto.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Bao tri not found with id: " + id, HttpStatus.NOT_FOUND.value()));
        }
    }

    // Update: Cập nhật bảo trì
    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatBaoTri(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID xeId,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime lichHen,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime batDauLuc,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime ketThucLuc,
            @RequestParam(required = false) String noiDung) {
        try {
            log.info("Cap nhat bao tri id: {}", id);
            BaoTri updatedBaoTri = baoTriService.capNhatBaoTri(id, xeId, trangThai, lichHen, batDauLuc, ketThucLuc, noiDung);
            log.info("Successfully cap nhat bao tri: {}", updatedBaoTri.getId());
            return ResponseEntity.ok(BaoTriDto.from(updatedBaoTri));
        } catch (RuntimeException e) {
            log.error("Error cap nhat bao tri id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // Delete: Xóa bảo trì theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaBaoTri(@PathVariable UUID id) {
        try {
            log.info("Xoa bao tri id: {}", id);
            baoTriService.xoaBaoTri(id);
            log.info("Successfully xoa bao tri: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error xoa bao tri id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }
}