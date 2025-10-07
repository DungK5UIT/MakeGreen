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
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/xe")
public class XeController {

    @Autowired
    private XeService xeService;

    // Create: Tạo xe mới
    @PostMapping
    public ResponseEntity<?> taoXe(@RequestBody XeDto xeDto) {
        try {
            log.info("Tao xe voi bienSo: {}", xeDto.getBienSo());
            Xe xe = xeService.taoXe(xeDto.getBienSo(), xeDto.getTrangThai(), xeDto.getPinPhanTram(), xeDto.getSoKm(), xeDto.getName(), xeDto.getBrand(), xeDto.getModel(), xeDto.getRangeKm(), xeDto.getTopSpeedKmh(), xeDto.getBattery(), xeDto.getPrice(), xeDto.getDeposit(), xeDto.getRating(), xeDto.getChargeTime(), xeDto.getWeightKg(), xeDto.getDungLuongPinWh(), xeDto.getPinTieuThuPerKm(), xeDto.getTinhTrang());
            log.info("Successfully tao xe: {}", xe.getId());
            return ResponseEntity.ok(XeDto.from(xe));
        } catch (RuntimeException e) {
            log.error("Error tao xe for bienSo {}: {}", xeDto.getBienSo(), e.getMessage());
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
    public ResponseEntity<?> capNhatXe(@PathVariable UUID id, @RequestBody XeDto xeDto) {
        try {
            log.info("Cap nhat xe id: {}", id);
            Xe updatedXe = xeService.capNhatXe(id, xeDto.getBienSo(), xeDto.getTrangThai(), xeDto.getPinPhanTram(), xeDto.getSoKm(), xeDto.getName(), xeDto.getBrand(), xeDto.getModel(), xeDto.getRangeKm(), xeDto.getTopSpeedKmh(), xeDto.getBattery(), xeDto.getPrice(), xeDto.getDeposit(), xeDto.getRating(), xeDto.getChargeTime(), xeDto.getWeightKg(), xeDto.getDungLuongPinWh(), xeDto.getPinTieuThuPerKm(), xeDto.getTinhTrang());
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