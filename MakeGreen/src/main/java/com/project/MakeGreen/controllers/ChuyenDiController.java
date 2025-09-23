package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.ChuyenDiDto;
import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.models.ChuyenDi;
import com.project.MakeGreen.services.ChuyenDiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/chuyen-di")
public class ChuyenDiController {

    @Autowired
    private ChuyenDiService chuyenDiService;

    @PostMapping
    public ResponseEntity<?> taoChuyenDi(
            @RequestParam UUID donThueId,
            @RequestParam UUID nguoiDungId,
            @RequestParam UUID xeId,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) ZonedDateTime batDauLuc,
            @RequestParam(required = false) ZonedDateTime ketThucLuc,
            @RequestParam(required = false) Double tongChiPhi,
            @RequestParam(required = false) String path) {
        try {
            log.info("Tao chuyen di voi donThueId: {}", donThueId);
            ChuyenDi chuyenDi = chuyenDiService.taoChuyenDi(donThueId, nguoiDungId, xeId, trangThai, batDauLuc, ketThucLuc, tongChiPhi, path);
            log.info("Successfully tao chuyen di: {}", chuyenDi.getId());
            return ResponseEntity.ok(ChuyenDiDto.from(chuyenDi));
        } catch (RuntimeException e) {
            log.error("Error tao chuyen di for donThueId {}: {}", donThueId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ChuyenDiDto>> layTatCaChuyenDi() {
        log.info("Lay tat ca chuyen di");
        List<ChuyenDiDto> chuyenDiDtos = chuyenDiService.layTatCaChuyenDi();
        return ResponseEntity.ok(chuyenDiDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layChuyenDiTheoId(@PathVariable UUID id) {
        log.info("Lay chuyen di theo id: {}", id);
        Optional<ChuyenDiDto> optionalChuyenDiDto = chuyenDiService.layChuyenDiTheoId(id);
        if (optionalChuyenDiDto.isPresent()) {
            return ResponseEntity.ok(optionalChuyenDiDto.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("ChuyenDi not found with id: " + id, HttpStatus.NOT_FOUND.value()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatChuyenDi(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID donThueId,
            @RequestParam(required = false) UUID nguoiDungId,
            @RequestParam(required = false) UUID xeId,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) ZonedDateTime batDauLuc,
            @RequestParam(required = false) ZonedDateTime ketThucLuc,
            @RequestParam(required = false) Double tongChiPhi,
            @RequestParam(required = false) String path) {
        try {
            log.info("Cap nhat chuyen di id: {}", id);
            ChuyenDi updatedChuyenDi = chuyenDiService.capNhatChuyenDi(id, donThueId, nguoiDungId, xeId, trangThai, batDauLuc, ketThucLuc, tongChiPhi, path);
            log.info("Successfully cap nhat chuyen di: {}", updatedChuyenDi.getId());
            return ResponseEntity.ok(ChuyenDiDto.from(updatedChuyenDi));
        } catch (RuntimeException e) {
            log.error("Error cap nhat chuyen di id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeChuyenDi(@PathVariable UUID id, @RequestBody String path) {
        try {
            log.info("Completing chuyen di with id: {}", id);
            ChuyenDi updatedChuyenDi = chuyenDiService.completeChuyenDi(id, path);
            log.info("Successfully completed chuyen di: {}", id);
            return ResponseEntity.ok(ChuyenDiDto.from(updatedChuyenDi));
        } catch (RuntimeException e) {
            log.error("Error completing chuyen di {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaChuyenDi(@PathVariable UUID id) {
        try {
            log.info("Xoa chuyen di id: {}", id);
            chuyenDiService.xoaChuyenDi(id);
            log.info("Successfully xoa chuyen di: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error xoa chuyen di id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }
}