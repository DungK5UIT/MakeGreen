package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.XeDto;
import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.services.XeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/xe")
public class XeController {

    @Autowired
    private XeService xeService;

    // Create: Tạo xe mới
    @PostMapping
    public ResponseEntity<?> taoXe(
            @RequestParam String bienSo,
            @RequestParam String trangThai,
            @RequestParam(required = false) Integer pinPhanTram,
            @RequestParam(required = false) Double soKm,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) Integer rangeKm,
            @RequestParam(required = false) Integer topSpeedKmh,
            @RequestParam(required = false) String battery,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) Double deposit,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) String chargeTime,
            @RequestParam(required = false) Integer weightKg,
            @RequestParam(required = false) Integer dungLuongPinWh,
            @RequestParam(required = false) Double pinTieuThuPerKm) {
        try {
            log.info("Tao xe voi bienSo: {}", bienSo);
            Xe xe = xeService.taoXe(bienSo, trangThai, pinPhanTram, soKm, name, brand, model, rangeKm, topSpeedKmh, battery, price, deposit, rating, chargeTime, weightKg, dungLuongPinWh, pinTieuThuPerKm);
            log.info("Successfully tao xe: {}", xe.getId());
            return ResponseEntity.ok(XeDto.from(xe));
        } catch (RuntimeException e) {
            log.error("Error tao xe for bienSo {}: {}", bienSo, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // Read: Lấy tất cả xe
    @GetMapping
    public ResponseEntity<List<XeDto>> layTatCaXe() {
        log.info("Lay tat ca xe");
        List<XeDto> xeDtos = xeService.layTatCaXe();
        return ResponseEntity.ok(xeDtos);
    }

    // Read: Lấy xe theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> layXeTheoId(@PathVariable UUID id) {
        log.info("Lay xe theo id: {}", id);
        Optional<XeDto> optionalXeDto = xeService.layXeTheoId(id);
        if (optionalXeDto.isPresent()) {
            return ResponseEntity.ok(optionalXeDto.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Xe not found with id: " + id, HttpStatus.NOT_FOUND.value()));
        }
    }

    // Update: Cập nhật xe
    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatXe(
            @PathVariable UUID id,
            @RequestParam(required = false) String bienSo,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) Integer pinPhanTram,
            @RequestParam(required = false) Double soKm,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) Integer rangeKm,
            @RequestParam(required = false) Integer topSpeedKmh,
            @RequestParam(required = false) String battery,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) Double deposit,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) String chargeTime,
            @RequestParam(required = false) Integer weightKg,
            @RequestParam(required = false) Integer dungLuongPinWh,
            @RequestParam(required = false) Double pinTieuThuPerKm) {
        try {
            log.info("Cap nhat xe id: {}", id);
            Xe updatedXe = xeService.capNhatXe(id, bienSo, trangThai, pinPhanTram, soKm, name, brand, model, rangeKm, topSpeedKmh, battery, price, deposit, rating, chargeTime, weightKg, dungLuongPinWh, pinTieuThuPerKm);
            log.info("Successfully cap nhat xe: {}", updatedXe.getId());
            return ResponseEntity.ok(XeDto.from(updatedXe));
        } catch (RuntimeException e) {
            log.error("Error cap nhat xe id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // Delete: Xóa xe theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaXe(@PathVariable UUID id) {
        try {
            log.info("Xoa xe id: {}", id);
            xeService.xoaXe(id);
            log.info("Successfully xoa xe: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error xoa xe id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }
}