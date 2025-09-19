package com.project.MakeGreen.services;

import com.project.MakeGreen.models.ChuyenDi;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.repositories.ChuyenDiRepository;
import com.project.MakeGreen.repositories.LichSuViTriRepository;
import com.project.MakeGreen.repositories.XeRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
public class ChuyenDiService {

    private static final Logger logger = LoggerFactory.getLogger(ChuyenDiService.class);

    @Autowired
    private ChuyenDiRepository chuyenDiRepository;

    @Autowired
    private LichSuViTriRepository lichSuViTriRepository;

    @Autowired
    private XeRepository xeRepository;

    /**
     * Hoàn tất chuyến đi
     * @param chuyenDiId ID chuyến đi
     * @param path đường đi (dữ liệu GPX/GeoJSON hoặc chuỗi lưu lại hành trình)
     * @return ChuyenDi đã cập nhật
     */
    @Transactional
    public ChuyenDi completeChuyenDi(UUID chuyenDiId, String path) {
        // Tìm chuyến đi
        ChuyenDi chuyenDi = chuyenDiRepository.findById(chuyenDiId)
                .orElseThrow(() -> new RuntimeException("ChuyenDi not found with id: " + chuyenDiId));

        if ("COMPLETED".equals(chuyenDi.getTrangThai())) {
            throw new RuntimeException("ChuyenDi already completed");
        }

        // Cập nhật thông tin chuyến đi
        chuyenDi.setTrangThai("COMPLETED");
        chuyenDi.setKetThucLuc(ZonedDateTime.now());
        chuyenDi.setPath(path);

        // Cập nhật trạng thái xe về AVAILABLE
        Xe xe = xeRepository.findById(chuyenDi.getXeId())
                .orElseThrow(() -> new RuntimeException("Xe not found with id: " + chuyenDi.getXeId()));
        xe.setTrangThai("AVAILABLE");
        xeRepository.save(xe);

        logger.info("Xe {} đã được cập nhật thành AVAILABLE sau khi kết thúc chuyến đi {}", xe.getId(), chuyenDi.getId());

        // Lưu lại thay đổi chuyến đi
        ChuyenDi updatedChuyenDi = chuyenDiRepository.save(chuyenDi);

        // Xoá lịch sử vị trí liên quan đến chuyến đi này
        lichSuViTriRepository.deleteByChuyenDiId(chuyenDiId);
        logger.info("Đã xoá lịch sử vị trí cho chuyến đi {}", chuyenDiId);

        return updatedChuyenDi;
    }
}
