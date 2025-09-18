package com.project.MakeGreen.services;

import  com.project.MakeGreen.models.ChuyenDi;
import  com.project.MakeGreen.repositories.ChuyenDiRepository;
import com.project.MakeGreen.repositories.LichSuViTriRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
public class ChuyenDiService {
    @Autowired
    private ChuyenDiRepository chuyenDiRepository;

    @Autowired
    private LichSuViTriRepository lichSuViTriRepository;

    @Transactional
    public ChuyenDi completeChuyenDi(UUID chuyenDiId, String path) {
        ChuyenDi chuyenDi = chuyenDiRepository.findById(chuyenDiId)
                .orElseThrow(() -> new RuntimeException("ChuyenDi not found"));

        if ("COMPLETED".equals(chuyenDi.getTrangThai())) {
            throw new RuntimeException("ChuyenDi already completed");
        }

        chuyenDi.setTrangThai("COMPLETED");
        chuyenDi.setKetThucLuc(ZonedDateTime.now());
        chuyenDi.setPath(path);

        // Lưu ChuyenDi
        ChuyenDi updatedChuyenDi = chuyenDiRepository.save(chuyenDi);

        // Xóa lich_su_vi_tri
        lichSuViTriRepository.deleteByChuyenDiId(chuyenDiId);

        return updatedChuyenDi;
    }
}