// BaoTriService.java
package com.project.MakeGreen.services;

import com.project.MakeGreen.dtos.BaoTriDto;
import com.project.MakeGreen.models.BaoTri;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.repositories.BaoTriRepository;
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
public class BaoTriService {

    private static final Logger logger = LoggerFactory.getLogger(BaoTriService.class);

    @Autowired
    private BaoTriRepository baoTriRepository;

    @Autowired
    private XeRepository xeRepository;

    // Create: Tạo bảo trì mới
    @Transactional
    public BaoTri taoBaoTri(UUID xeId, String trangThai, ZonedDateTime lichHen, ZonedDateTime batDauLuc, ZonedDateTime ketThucLuc, String noiDung) {
        Xe xe = xeRepository.findById(xeId)
                .orElseThrow(() -> new RuntimeException("Xe not found with id: " + xeId));

        BaoTri baoTri = BaoTri.builder()
                .xe(xe)
                .trangThai(trangThai)
                .lichHen(lichHen)
                .batDauLuc(batDauLuc)
                .ketThucLuc(ketThucLuc)
                .noiDung(noiDung)
                .build();

        BaoTri savedBaoTri = baoTriRepository.save(baoTri);
        logger.info("Tao bao tri thanh cong voi id: {}", savedBaoTri.getId());

        // Cập nhật trạng thái xe dựa trên trạng thái bảo trì
        updateXeTrangThai(savedBaoTri.getXe(), savedBaoTri.getTrangThai());

        return savedBaoTri;
    }

    // Read: Lấy tất cả bảo trì
    @Transactional(readOnly = true)
    public List<BaoTriDto> layTatCaBaoTri() {
        List<BaoTri> baoTris = baoTriRepository.findAll();
        return baoTris.stream()
                .map(BaoTriDto::from)
                .collect(Collectors.toList());
    }

    // Read: Lấy bảo trì theo ID
    @Transactional(readOnly = true)
    public Optional<BaoTriDto> layBaoTriTheoId(UUID id) {
        Optional<BaoTri> optionalBaoTri = baoTriRepository.findById(id);
        return optionalBaoTri.map(BaoTriDto::from);
    }

    // Update: Cập nhật bảo trì
    @Transactional
    public BaoTri capNhatBaoTri(UUID id, UUID xeId, String trangThai, ZonedDateTime lichHen, ZonedDateTime batDauLuc, ZonedDateTime ketThucLuc, String noiDung) {
        BaoTri baoTri = baoTriRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bao tri not found with id: " + id));

        // Lưu trạng thái cũ để so sánh
        String oldTrangThai = baoTri.getTrangThai();

        if (xeId != null) {
            Xe xe = xeRepository.findById(xeId)
                    .orElseThrow(() -> new RuntimeException("Xe not found with id: " + xeId));
            baoTri.setXe(xe);
        }

        if (trangThai != null) {
            baoTri.setTrangThai(trangThai);
        }
        if (lichHen != null) {
            baoTri.setLichHen(lichHen);
        }
        if (batDauLuc != null) {
            baoTri.setBatDauLuc(batDauLuc);
        }
        if (ketThucLuc != null) {
            baoTri.setKetThucLuc(ketThucLuc);
        }
        if (noiDung != null) {
            baoTri.setNoiDung(noiDung);
        }

        BaoTri updatedBaoTri = baoTriRepository.save(baoTri);
        logger.info("Cap nhat bao tri thanh cong voi id: {}", updatedBaoTri.getId());

        // Cập nhật trạng thái xe nếu trạng thái bảo trì thay đổi
        if (trangThai != null && !trangThai.equals(oldTrangThai)) {
            updateXeTrangThai(updatedBaoTri.getXe(), updatedBaoTri.getTrangThai());
        }

        return updatedBaoTri;
    }

    // Delete: Xóa bảo trì
    @Transactional
    public void xoaBaoTri(UUID id) {
        BaoTri baoTri = baoTriRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bao tri not found with id: " + id));
        
        Xe xe = baoTri.getXe();
        baoTriRepository.deleteById(id);
        logger.info("Xoa bao tri thanh cong voi id: {}", id);
        
        // Set xe về AVAILABLE khi xóa bảo trì (giả sử xóa tương đương hủy)
        updateXeTrangThai(xe, "HUY");
    }

    // Phương thức helper để cập nhật trạng thái xe dựa trên trạng thái bảo trì
    private void updateXeTrangThai(Xe xe, String baoTriTrangThai) {
        String newXeTrangThai;
        if ("DANG_XU_LY".equals(baoTriTrangThai)) {
            newXeTrangThai = "MAINTENANCE";
        } else if ("HOAN_THANH".equals(baoTriTrangThai) || "HUY".equals(baoTriTrangThai)) {
            newXeTrangThai = "AVAILABLE";  // Hoặc "UNAVAILABLE" tùy theo business logic
        } else {
            return;  // Không thay đổi nếu trạng thái khác (ví dụ: "CHO_XU_LY")
        }

        if (!newXeTrangThai.equals(xe.getTrangThai())) {
            xe.setTrangThai(newXeTrangThai);
            xeRepository.save(xe);
            logger.info("Cap nhat trang thai xe {} thanh {}", xe.getId(), newXeTrangThai);
        }
    }
}