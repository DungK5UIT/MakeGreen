package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.NguoiDungDto;
import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.models.NguoiDung;
import com.project.MakeGreen.models.VaiTro;
import com.project.MakeGreen.services.NguoiDungService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/nguoidung")
public class NguoiDungController {

    @Autowired
    private NguoiDungService nguoiDungService;

    @PostMapping
    public ResponseEntity<?> taoNguoiDung(
            @RequestParam String email,
            @RequestParam String sdt,
            @RequestParam String hoTen,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) Set<String> vaiTros) {
        try {
            log.info("Tao nguoi dung voi email: {}", email);
            Set<VaiTro> vaiTroSet = null;
            if (vaiTros != null) {
                // Assuming VaiTro has a constructor or a builder that takes 'ten'
                // and you have VaiTroRepository to find existing roles.
                // This is a simple fix. A better way is to fetch existing roles.
                vaiTroSet = vaiTros.stream()
                        .map(ten -> new VaiTro(null, null, ten)) // Using AllArgsConstructor
                        .collect(Collectors.toSet());
            }

            NguoiDung nguoiDung = nguoiDungService.taoNguoiDung(email, sdt, hoTen, trangThai, enabled, vaiTroSet);
            log.info("Successfully tao nguoi dung: {}", nguoiDung.getId());
            return ResponseEntity.ok(NguoiDungDto.from(nguoiDung));
        } catch (RuntimeException e) {
            log.error("Error tao nguoi dung for email {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @GetMapping
    public ResponseEntity<List<NguoiDungDto>> layTatCaNguoiDung() {
        log.info("Lay tat ca nguoi dung");
        List<NguoiDungDto> nguoiDungDtos = nguoiDungService.layTatCaNguoiDung();
        return ResponseEntity.ok(nguoiDungDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layNguoiDungTheoId(@PathVariable UUID id) {
        log.info("Lay nguoi dung theo id: {}", id);
        Optional<NguoiDungDto> optionalNguoiDungDto = nguoiDungService.layNguoiDungTheoId(id);
        if (optionalNguoiDungDto.isPresent()) {
            return ResponseEntity.ok(optionalNguoiDungDto.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("NguoiDung not found with id: " + id, HttpStatus.NOT_FOUND.value()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatNguoiDung(
            @PathVariable UUID id,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String sdt,
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) Set<String> vaiTros) {
        try {
            log.info("Cap nhat nguoi dung id: {}", id);
            Set<VaiTro> vaiTroSet = null;
            if (vaiTros != null) {
                // Assuming VaiTro has a constructor or a builder that takes 'ten'
                vaiTroSet = vaiTros.stream()
                        .map(ten -> new VaiTro(null, null, ten)) // Using AllArgsConstructor
                        .collect(Collectors.toSet());
            }

            NguoiDung updatedNguoiDung = nguoiDungService.capNhatNguoiDung(id, email, sdt, hoTen, trangThai, enabled, vaiTroSet);
            log.info("Successfully cap nhat nguoi dung: {}", updatedNguoiDung.getId());
            return ResponseEntity.ok(NguoiDungDto.from(updatedNguoiDung));
        } catch (RuntimeException e) {
            log.error("Error cap nhat nguoi dung id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaNguoiDung(@PathVariable UUID id) {
        try {
            log.info("Xoa nguoi dung id: {}", id);
            nguoiDungService.xoaNguoiDung(id);
            log.info("Successfully xoa nguoi dung: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error xoa nguoi dung id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }
}