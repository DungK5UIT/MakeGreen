package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.responses.ErrorResponse;
import com.project.MakeGreen.models.SuCo;
import com.project.MakeGreen.services.SuCoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/su-co")
public class SuCoController {

    @Autowired
    private SuCoService suCoService;

    @PostMapping
    public ResponseEntity<?> ghiSuCo(
            @RequestParam UUID xeId,
            @RequestParam(required = false) UUID nguoiBaoCaoId,
            @RequestParam String mucDo,
            @RequestParam String moTa) {
        try {
            log.info("Ghi su_co cho xeId: {}", xeId);
            SuCo suCo = suCoService.ghiSuCo(xeId, nguoiBaoCaoId, mucDo, moTa);
            log.info("Successfully ghi su_co: {}", suCo.getId());
            return ResponseEntity.ok(suCo);
        } catch (RuntimeException e) {
            log.error("Error ghi su_co for xeId {}: {}", xeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }
}