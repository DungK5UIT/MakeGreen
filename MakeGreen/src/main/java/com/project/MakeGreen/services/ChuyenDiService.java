package com.project.MakeGreen.services;

import com.project.MakeGreen.dtos.ChuyenDiDto;
import com.project.MakeGreen.models.ChuyenDi;
import com.project.MakeGreen.models.DonThue;
import com.project.MakeGreen.models.Tram;
import com.project.MakeGreen.models.TramXe;
import com.project.MakeGreen.models.ViTriXe;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.repositories.ChuyenDiRepository;
import com.project.MakeGreen.repositories.DonThueRepository;
import com.project.MakeGreen.repositories.LichSuViTriRepository;
import com.project.MakeGreen.repositories.TramRepository;
import com.project.MakeGreen.repositories.TramXeRepository;
import com.project.MakeGreen.repositories.ViTriXeRepository;
import com.project.MakeGreen.repositories.XeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChuyenDiService {

    private static final Logger logger = LoggerFactory.getLogger(ChuyenDiService.class);

    @Autowired
    private ChuyenDiRepository chuyenDiRepository;

    @Autowired
    private LichSuViTriRepository lichSuViTriRepository;

    @Autowired
    private XeRepository xeRepository;

    @Autowired
    private ViTriXeRepository viTriXeRepository;

    @Autowired
    private DonThueRepository donThueRepository;

    @Autowired
    private TramRepository tramRepository;
    
    @Autowired
    private TramXeRepository tramXeRepository;

    // Create: Tạo chuyến đi mới
    @Transactional
    public ChuyenDi taoChuyenDi(UUID donThueId, UUID nguoiDungId, UUID xeId, String trangThai, ZonedDateTime batDauLuc, ZonedDateTime ketThucLuc, Double tongChiPhi, String path) {
        ChuyenDi chuyenDi = ChuyenDi.builder()
                .donThueId(donThueId)
                .nguoiDungId(nguoiDungId)
                .xeId(xeId)
                .trangThai(trangThai)
                .batDauLuc(batDauLuc)
                .ketThucLuc(ketThucLuc)
                .tongChiPhi(tongChiPhi)
                .path(path)
                .build();

        ChuyenDi savedChuyenDi = chuyenDiRepository.save(chuyenDi);
        logger.info("Tao chuyen di thanh cong voi id: {}", savedChuyenDi.getId());
        return savedChuyenDi;
    }

    // Read: Lấy tất cả chuyến đi
    @Transactional(readOnly = true)
    public List<ChuyenDiDto> layTatCaChuyenDi() {
        List<ChuyenDi> chuyenDis = chuyenDiRepository.findAll();
        return chuyenDis.stream()
                .map(ChuyenDiDto::from)
                .collect(Collectors.toList());
    }

    // Read: Lấy chuyến đi theo ID
    @Transactional(readOnly = true)
    public Optional<ChuyenDiDto> layChuyenDiTheoId(UUID id) {
        Optional<ChuyenDi> optionalChuyenDi = chuyenDiRepository.findById(id);
        return optionalChuyenDi.map(ChuyenDiDto::from);
    }

    // Update: Cập nhật chuyến đi
    @Transactional
    public ChuyenDi capNhatChuyenDi(UUID id, UUID donThueId, UUID nguoiDungId, UUID xeId, String trangThai, ZonedDateTime batDauLuc, ZonedDateTime ketThucLuc, Double tongChiPhi, String path) {
        ChuyenDi chuyenDi = chuyenDiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ChuyenDi not found with id: " + id));

        if (donThueId != null) {
            chuyenDi.setDonThueId(donThueId);
        }
        if (nguoiDungId != null) {
            chuyenDi.setNguoiDungId(nguoiDungId);
        }
        if (xeId != null) {
            chuyenDi.setXeId(xeId);
        }
        if (trangThai != null) {
            chuyenDi.setTrangThai(trangThai);
        }
        if (batDauLuc != null) {
            chuyenDi.setBatDauLuc(batDauLuc);
        }
        if (ketThucLuc != null) {
            chuyenDi.setKetThucLuc(ketThucLuc);
        }
        if (tongChiPhi != null) {
            chuyenDi.setTongChiPhi(tongChiPhi);
        }
        if (path != null) {
            chuyenDi.setPath(path);
        }

        ChuyenDi updatedChuyenDi = chuyenDiRepository.save(chuyenDi);
        logger.info("Cap nhat chuyen di thanh cong voi id: {}", updatedChuyenDi.getId());
        return updatedChuyenDi;
    }

    /**
     * Hoàn tất chuyến đi
     * @param chuyenDiId ID chuyến đi
     * @param path đường đi (dữ liệu GPX/GeoJSON hoặc chuỗi lưu lại hành trình)
     * @return ChuyenDi đã cập nhật
     */
 // Trong file ChuyenDiService.java

 // Trong file ChuyenDiService.java

    @Transactional
    public ChuyenDi completeChuyenDi(UUID chuyenDiId, String path) {
        // 1. Tìm chuyến đi
        ChuyenDi chuyenDi = chuyenDiRepository.findById(chuyenDiId)
                .orElseThrow(() -> new RuntimeException("ChuyenDi not found with id: " + chuyenDiId));

        if ("COMPLETED".equals(chuyenDi.getTrangThai())) {
            logger.warn("Attempted to complete an already completed trip: {}", chuyenDiId);
            return chuyenDi;
        }

        // 2. Lấy thông tin đơn thuê và xe
        DonThue donThue = donThueRepository.findById(chuyenDi.getDonThueId())
                .orElseThrow(() -> new RuntimeException("DonThue not found for ChuyenDi id: " + chuyenDi.getDonThueId()));

        Xe xe = xeRepository.findById(chuyenDi.getXeId())
                .orElseThrow(() -> new RuntimeException("Xe not found with id: " + chuyenDi.getXeId()));

        // 3. Cập nhật chuyến đi
        chuyenDi.setTrangThai("COMPLETED");
        chuyenDi.setKetThucLuc(ZonedDateTime.now());
        chuyenDi.setPath(path);
        if (donThue.getChiPhiUocTinh() != null) {
            chuyenDi.setTongChiPhi(donThue.getChiPhiUocTinh().doubleValue());
        }
        
        // 4. Cập nhật trạng thái xe
        xe.setTrangThai("AVAILABLE");
        xeRepository.save(xe);
        logger.info("Vehicle {} status updated to AVAILABLE.", xe.getId());

        // 5. Lấy thông tin trạm trả và cập nhật vị trí
        if (donThue.getTramTra() != null) {
            Tram tramTra = donThue.getTramTra();

            // ========== BẮT ĐẦU SỬA LỖI ==========
            // Logic đúng: Xóa liên kết cũ, flush, sau đó tạo liên kết mới.

            // 5.1. Xóa liên kết trạm cũ của xe và FLUSH NGAY LẬP TỨC
            tramXeRepository.findByXe(xe).ifPresent(existingTramXe -> {
                tramXeRepository.delete(existingTramXe);
                tramXeRepository.flush(); // <-- THÊM DÒNG NÀY ĐỂ THỰC THI LỆNH DELETE NGAY
                logger.info("Deleted old station link for vehicle {}.", xe.getId());
            });

            // 5.2. Tạo liên kết mới với trạm trả xe
            TramXe newTramXe = new TramXe(xe, tramTra);
            tramXeRepository.save(newTramXe);
            logger.info("Created new station link for vehicle {} at return station {}.", xe.getId(), tramTra.getId());
            // ========== KẾT THÚC SỬA LỖI ==========
            

            // 5.3. Cập nhật vị trí GPS cuối cùng của xe trong "vi_tri_xe" cho nhất quán
            ViTriXe viTriXe = viTriXeRepository.findByXe(xe)
                .orElseGet(() -> ViTriXe.builder().xe(xe).build());
            
            viTriXe.setLat(tramTra.getLat());
            viTriXe.setLng(tramTra.getLng());
            viTriXe.setPin(100);
            viTriXe.setTocDo(0.0);
            viTriXe.setCapNhatLuc(ZonedDateTime.now());
            viTriXeRepository.save(viTriXe);
            logger.info("Final GPS location for vehicle {} updated to match return station.", xe.getId());

        } else {
            logger.warn("Return station (TramTra object) is null for DonThue {}, skipping vehicle location updates.", donThue.getId());
        }

        // 6. Lưu lại chuyến đi và dọn dẹp
        ChuyenDi updatedChuyenDi = chuyenDiRepository.save(chuyenDi);
        lichSuViTriRepository.deleteByChuyenDiId(chuyenDiId);
        logger.info("Deleted location history for completed trip {}", chuyenDiId);

        return updatedChuyenDi;
    }
    // Delete: Xóa chuyến đi
    @Transactional
    public void xoaChuyenDi(UUID id) {
        if (!chuyenDiRepository.existsById(id)) {
            throw new RuntimeException("ChuyenDi not found with id: " + id);
        }
        chuyenDiRepository.deleteById(id);
        logger.info("Xoa chuyen di thanh cong voi id: {}", id);
    }
}