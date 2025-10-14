package com.project.MakeGreen.services;

import com.project.MakeGreen.dtos.TramDto;
import com.project.MakeGreen.models.Tram;
import com.project.MakeGreen.repositories.TramRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TramService {

    private static final Logger logger = LoggerFactory.getLogger(TramService.class);

    @Autowired
    private TramRepository tramRepository;

    // Create: Tạo trạm mới
    @Transactional
    public Tram taoTram(String ten, String diaChi, Double lat, Double lng, Integer sucChua, String trangThai) {
        Tram tram = Tram.builder()
                .ten(ten)
                .diaChi(diaChi)
                .lat(lat)
                .lng(lng)
                .sucChua(sucChua)
                .trangThai(trangThai)
                .build();

        Tram savedTram = tramRepository.save(tram);
        logger.info("Tao tram thanh cong voi id: {}", savedTram.getId());

        return savedTram;
    }

    // Read: Lấy tất cả trạm
    @Transactional(readOnly = true)
    public List<TramDto> layTatCaTram() {
        List<Tram> trams = tramRepository.findAll();
        return trams.stream()
                .map(TramDto::from)
                .collect(Collectors.toList());
    }

    // Read: Lấy trạm theo ID
    @Transactional(readOnly = true)
    public Optional<TramDto> layTramTheoId(UUID id) {
        Optional<Tram> optionalTram = tramRepository.findById(id);
        return optionalTram.map(TramDto::from);
    }

    // Update: Cập nhật trạm
    @Transactional
    public Tram capNhatTram(UUID id, String ten, String diaChi, Double lat, Double lng, Integer sucChua, String trangThai) {
        Tram tram = tramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tram not found with id: " + id));

        if (ten != null) {
            tram.setTen(ten);
        }
        if (diaChi != null) {
            tram.setDiaChi(diaChi);
        }
        if (lat != null) {
            tram.setLat(lat);
        }
        if (lng != null) {
            tram.setLng(lng);
        }
        if (sucChua != null) {
            tram.setSucChua(sucChua);
        }
        if (trangThai != null) {
            tram.setTrangThai(trangThai);
        }

        Tram updatedTram = tramRepository.save(tram);
        logger.info("Cap nhat tram thanh cong voi id: {}", updatedTram.getId());

        return updatedTram;
    }

    // Delete: Xóa trạm
    @Transactional
    public void xoaTram(UUID id) {
        if (!tramRepository.existsById(id)) {
            throw new RuntimeException("Tram not found with id: " + id);
        }
        tramRepository.deleteById(id);
        logger.info("Xoa tram thanh cong voi id: {}", id);
    }
}