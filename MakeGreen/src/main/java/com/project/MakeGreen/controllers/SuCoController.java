package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.SuCoDto; // ← Thêm import này
import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.models.SuCo;
import com.project.MakeGreen.services.SuCoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors; // ← Thêm import này

@Slf4j
@RestController
@RequestMapping("/api/su-co")
public class SuCoController {

    @Autowired
    private SuCoService suCoService;

    // Create: Ghi sự cố mới → vẫn trả SuCo (hoặc có thể trả SuCoDto nếu muốn)
    @PostMapping
    public ResponseEntity<?> ghiSuCo(
            @RequestParam UUID xeId,
            @RequestParam(required = false) UUID nguoiBaoCaoId,
            @RequestParam String mucDo,
            @RequestParam String moTa) {
        try {
            log.info("Ghi su_co cho xeId: {}", xeId);
            SuCo suCo = suCoService.ghiSuCo(xeId, nguoiBaoCaoId, mucDo, moTa);
            SuCoDto dto = SuCoDto.from(suCo); // ← Chuyển sang DTO
            log.info("Successfully ghi su_co: {}", suCo.getId());
            return ResponseEntity.ok(dto); // ← Trả DTO
        } catch (RuntimeException e) {
            log.error("Error ghi su_co for xeId {}: {}", xeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // Read: Lấy tất cả sự cố
    @GetMapping
    public ResponseEntity<List<SuCoDto>> layTatCaSuCo() { // ← Đổi kiểu trả về
        log.info("Lay tat ca su_co");
        List<SuCo> suCos = suCoService.layTatCaSuCo();
        List<SuCoDto> dtos = suCos.stream()
                .map(SuCoDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos); // ← Trả List DTO
    }

    // Read: Lấy sự cố theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> laySuCoTheoId(@PathVariable UUID id) {
        log.info("Lay su_co theo id: {}", id);
        Optional<SuCo> optionalSuCo = suCoService.laySuCoTheoId(id);
        if (optionalSuCo.isPresent()) {
            SuCoDto dto = SuCoDto.from(optionalSuCo.get()); // ← Chuyển sang DTO
            return ResponseEntity.ok(dto); // ← Trả DTO
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Su co not found with id: " + id, HttpStatus.NOT_FOUND.value()));
        }
    }

    // Update: Cập nhật sự cố
    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatSuCo(
            @PathVariable UUID id,
            @RequestParam(required = false) String mucDo,
            @RequestParam(required = false) String moTa,
            @RequestParam(required = false) Boolean daXuLy) {
        try {
            log.info("Cap nhat su_co id: {}", id);
            SuCo updatedSuCo = suCoService.capNhatSuCo(id, mucDo, moTa, daXuLy);
            SuCoDto dto = SuCoDto.from(updatedSuCo); // ← Chuyển sang DTO
            log.info("Successfully cap nhat su_co: {}", updatedSuCo.getId());
            return ResponseEntity.ok(dto); // ← Trả DTO
        } catch (RuntimeException e) {
            log.error("Error cap nhat su_co id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // Delete: Xóa sự cố theo ID → không cần DTO
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaSuCo(@PathVariable UUID id) {
        try {
            log.info("Xoa su_co id: {}", id);
            suCoService.xoaSuCo(id);
            log.info("Successfully xoa su_co: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error xoa su_co id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }
}