package com.project.MakeGreen.controllers;

import com.project.MakeGreen.models.ChuyenDi;
import com.project.MakeGreen.services.ChuyenDiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/chuyen-di")
public class ChuyenDiController {
    @Autowired
    private ChuyenDiService chuyenDiService;

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ChuyenDi> completeChuyenDi(@PathVariable UUID id, @RequestBody String path) {
        try {
            log.info("Completing chuyen_di with id: {}", id);
            ChuyenDi updatedChuyenDi = chuyenDiService.completeChuyenDi(id, path);
            log.info("Successfully completed chuyen_di: {}", id);
            return ResponseEntity.ok(updatedChuyenDi);
        } catch (RuntimeException e) {
            log.error("Error completing chuyen_di {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build(); // Không trả null, dùng .build() cho empty body
        }
    }
}