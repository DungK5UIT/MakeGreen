package com.project.MakeGreen.services;

import com.project.MakeGreen.dtos.NguoiDungDto;
import com.project.MakeGreen.models.NguoiDung;
import com.project.MakeGreen.models.VaiTro;
import com.project.MakeGreen.repositories.NguoiDungRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NguoiDungService {

    private static final Logger logger = LoggerFactory.getLogger(NguoiDungService.class);

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Transactional
    public NguoiDung taoNguoiDung(String email, String sdt, String hoTen, String trangThai, Boolean enabled, Set<VaiTro> vaiTros) {
        NguoiDung nguoiDung = NguoiDung.builder()
                .email(email)
                .sdt(sdt)
                .hoTen(hoTen)
                .trangThai(trangThai)
                .enabled(enabled)
                .vaiTros(vaiTros)
                .build();

        NguoiDung savedNguoiDung = nguoiDungRepository.save(nguoiDung);
        logger.info("Tao nguoi dung thanh cong voi id: {}", savedNguoiDung.getId());
        return savedNguoiDung;
    }

    @Transactional(readOnly = true)
    public List<NguoiDungDto> layTatCaNguoiDung() {
        List<NguoiDung> nguoiDungs = nguoiDungRepository.findAll();
        return nguoiDungs.stream()
                .map(NguoiDungDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<NguoiDungDto> layNguoiDungTheoId(UUID id) {
        Optional<NguoiDung> optionalNguoiDung = nguoiDungRepository.findById(id);
        return optionalNguoiDung.map(NguoiDungDto::from);
    }

    @Transactional
    public NguoiDung capNhatNguoiDung(UUID id, String email, String sdt, String hoTen, String trangThai, Boolean enabled, Set<VaiTro> vaiTros) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NguoiDung not found with id: " + id));

        if (email != null) {
            nguoiDung.setEmail(email);
        }
        if (sdt != null) {
            nguoiDung.setSdt(sdt);
        }
        if (hoTen != null) {
            nguoiDung.setHoTen(hoTen);
        }
        if (trangThai != null) {
            nguoiDung.setTrangThai(trangThai);
        }
        if (enabled != null) {
            nguoiDung.setEnabled(enabled);
        }
        if (vaiTros != null) {
            nguoiDung.setVaiTros(vaiTros);
        }

        NguoiDung updatedNguoiDung = nguoiDungRepository.save(nguoiDung);
        logger.info("Cap nhat nguoi dung thanh cong voi id: {}", updatedNguoiDung.getId());
        return updatedNguoiDung;
    }

    @Transactional
    public void xoaNguoiDung(UUID id) {
        if (!nguoiDungRepository.existsById(id)) {
            throw new RuntimeException("NguoiDung not found with id: " + id);
        }
        nguoiDungRepository.deleteById(id);
        logger.info("Xoa nguoi dung thanh cong voi id: {}", id);
    }
}