package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.TramDto;
import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.models.Tram;
import com.project.MakeGreen.services.TramService;
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
@RequestMapping("/api/tram")
public class TramController {

    @Autowired
    private TramService tramService;

    // Create: Tạo trạm mới
    @PostMapping
    public ResponseEntity<?> taoTram(@RequestBody TramDto tramDto) {
        try {
            log.info("Tao tram voi ten: {}", tramDto.getTen());
            Tram tram = tramService.taoTram(tramDto.getTen(), tramDto.getDiaChi(), tramDto.getLat(), tramDto.getLng(), tramDto.getSucChua(), tramDto.getTrangThai());
            log.info("Successfully tao tram: {}", tram.getId());
            return ResponseEntity.ok(TramDto.from(tram));
        } catch (RuntimeException e) {
            log.error("Error tao tram for ten {}: {}", tramDto.getTen(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // Read: Lấy tất cả trạm
    @GetMapping
    public ResponseEntity<List<TramDto>> layTatCaTram() {
        log.info("Lay tat ca tram");
        List<TramDto> tramDtos = tramService.layTatCaTram();
        return ResponseEntity.ok(tramDtos);
    }

    // Read: Lấy trạm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> layTramTheoId(@PathVariable UUID id) {
        log.info("Lay tram theo id: {}", id);
        Optional<TramDto> optionalTramDto = tramService.layTramTheoId(id);
        if (optionalTramDto.isPresent()) {
            return ResponseEntity.ok(optionalTramDto.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Tram not found with id: " + id, HttpStatus.NOT_FOUND.value()));
        }
    }

    // Update: Cập nhật trạm
    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatTram(@PathVariable UUID id, @RequestBody TramDto tramDto) {
        try {
            log.info("Cap nhat tram id: {}", id);
            Tram updatedTram = tramService.capNhatTram(id, tramDto.getTen(), tramDto.getDiaChi(), tramDto.getLat(), tramDto.getLng(), tramDto.getSucChua(), tramDto.getTrangThai());
            log.info("Successfully cap nhat tram: {}", updatedTram.getId());
            return ResponseEntity.ok(TramDto.from(updatedTram));
        } catch (RuntimeException e) {
            log.error("Error cap nhat tram id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // Delete: Xóa trạm theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaTram(@PathVariable UUID id) {
        try {
            log.info("Xoa tram id: {}", id);
            tramService.xoaTram(id);
            log.info("Successfully xoa tram: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error xoa tram id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }
}