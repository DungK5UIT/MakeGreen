package com.project.MakeGreen.services;

import com.project.MakeGreen.models.NguoiDung;
import com.project.MakeGreen.models.SuCo;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.repositories.NguoiDungRepository;
import com.project.MakeGreen.repositories.SuCoRepository;
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

@Service
public class SuCoService {

    private static final Logger logger = LoggerFactory.getLogger(SuCoService.class);

    @Autowired
    private SuCoRepository suCoRepository;

    @Autowired
    private XeRepository xeRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    // Create: Ghi sự cố mới
    @Transactional
    public SuCo ghiSuCo(UUID xeId, UUID nguoiBaoCaoId, String mucDo, String moTa) {
        Xe xe = xeRepository.findById(xeId)
                .orElseThrow(() -> new RuntimeException("Xe not found with id: " + xeId));

        NguoiDung nguoiBaoCao = null;
        if (nguoiBaoCaoId != null) {
            nguoiBaoCao = nguoiDungRepository.findById(nguoiBaoCaoId)
                    .orElseThrow(() -> new RuntimeException("Nguoi bao cao not found with id: " + nguoiBaoCaoId));
        }

        SuCo suCo = SuCo.builder()
                .xe(xe)
                .nguoiBaoCao(nguoiBaoCao)
                .mucDo(mucDo)
                .moTa(moTa)
                .trangThai("CHUAXULY") // Đặt trạng thái mặc định khi tạo mới
                .build();

        SuCo savedSuCo = suCoRepository.save(suCo);
        logger.info("Ghi su_co thanh cong cho xe {} voi id: {}", xeId, savedSuCo.getId());

        return savedSuCo;
    }

    // Read: Lấy tất cả sự cố
    public List<SuCo> layTatCaSuCo() {
        return suCoRepository.findAll();
    }

    // Read: Lấy sự cố theo ID
    public Optional<SuCo> laySuCoTheoId(UUID id) {
        return suCoRepository.findById(id);
    }

    // Update: Cập nhật sự cố
    @Transactional
    public SuCo capNhatSuCo(UUID id, String mucDo, String moTa, Boolean daXuLy) {
        SuCo suCo = suCoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Su co not found with id: " + id));

        if (mucDo != null) {
            suCo.setMucDo(mucDo);
        }
        if (moTa != null) {
            suCo.setMoTa(moTa);
        }
        if (daXuLy != null) {
            suCo.setTrangThai(daXuLy ? "DAXULY" : "CHUAXULY");
            if (daXuLy && suCo.getXuLyLuc() == null) {
                suCo.setXuLyLuc(ZonedDateTime.now()); // Cập nhật thời gian xử lý nếu chuyển sang DAXULY
            } else if (!daXuLy) {
                suCo.setXuLyLuc(null); // Xóa thời gian xử lý nếu chuyển về CHUAXULY
            }
        }

        SuCo updatedSuCo = suCoRepository.save(suCo);
        logger.info("Cap nhat su_co thanh cong voi id: {}", updatedSuCo.getId());

        return updatedSuCo;
    }

    // Delete: Xóa sự cố
    @Transactional
    public void xoaSuCo(UUID id) {
        if (!suCoRepository.existsById(id)) {
            throw new RuntimeException("Su co not found with id: " + id);
        }
        suCoRepository.deleteById(id);
        logger.info("Xoa su_co thanh cong voi id: {}", id);
    }
}