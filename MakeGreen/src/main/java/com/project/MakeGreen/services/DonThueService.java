package com.project.MakeGreen.services;

import com.project.MakeGreen.dtos.DonThueDto;
import com.project.MakeGreen.models.DonThue;
import com.project.MakeGreen.models.Tram;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.repositories.DonThueRepository;
import com.project.MakeGreen.repositories.TramRepository;
import com.project.MakeGreen.repositories.XeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DonThueService {

    private static final Logger logger = LoggerFactory.getLogger(DonThueService.class);

    @Autowired
    private DonThueRepository donThueRepository;

    @Autowired
    private XeRepository xeRepository;

    @Autowired
    private TramRepository tramRepository;

    @Transactional
    public DonThue taoDonThue(UUID nguoiDungId, UUID xeId, OffsetDateTime batDauLuc, OffsetDateTime ketThucLuc, String trangThai, BigDecimal soTienCoc, BigDecimal chiPhiUocTinh, UUID tramThueId, UUID tramTraId) {
        Xe xe = xeRepository.findById(xeId)
                .orElseThrow(() -> new RuntimeException("Xe not found with id: " + xeId));
        Tram tramThue = tramRepository.findById(tramThueId)
                .orElseThrow(() -> new RuntimeException("Tram thue not found with id: " + tramThueId));
        Tram tramTra = tramRepository.findById(tramTraId)
                .orElseThrow(() -> new RuntimeException("Tram tra not found with id: " + tramTraId));

        DonThue donThue = DonThue.builder()
                .nguoiDungId(nguoiDungId)
                .xe(xe)
                .batDauLuc(batDauLuc)
                .ketThucLuc(ketThucLuc)
                .trangThai(trangThai)
                .soTienCoc(soTienCoc)
                .chiPhiUocTinh(chiPhiUocTinh)
                .tramThue(tramThue)
                .tramTra(tramTra)
                .build();

        DonThue savedDonThue = donThueRepository.save(donThue);
        logger.info("Tao don thue thanh cong voi id: {}", savedDonThue.getId());
        return savedDonThue;
    }

    @Transactional(readOnly = true)
    public List<DonThueDto> layTatCaDonThue() {
        List<DonThue> donThues = donThueRepository.findAll();
        return donThues.stream()
                .map(DonThueDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DonThueDto> layDonThueTheoId(UUID id) {
        Optional<DonThue> optionalDonThue = donThueRepository.findById(id);
        return optionalDonThue.map(DonThueDto::from);
    }

    @Transactional
    public DonThue capNhatDonThue(UUID id, UUID nguoiDungId, UUID xeId, OffsetDateTime batDauLuc, OffsetDateTime ketThucLuc, String trangThai, BigDecimal soTienCoc, BigDecimal chiPhiUocTinh, UUID tramThueId, UUID tramTraId) {
        DonThue donThue = donThueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DonThue not found with id: " + id));

        if (nguoiDungId != null) {
            donThue.setNguoiDungId(nguoiDungId);
        }
        if (xeId != null) {
            Xe xe = xeRepository.findById(xeId)
                    .orElseThrow(() -> new RuntimeException("Xe not found with id: " + xeId));
            donThue.setXe(xe);
        }
        if (batDauLuc != null) {
            donThue.setBatDauLuc(batDauLuc);
        }
        if (ketThucLuc != null) {
            donThue.setKetThucLuc(ketThucLuc);
        }
        if (trangThai != null) {
            donThue.setTrangThai(trangThai);
        }
        if (soTienCoc != null) {
            donThue.setSoTienCoc(soTienCoc);
        }
        if (chiPhiUocTinh != null) {
            donThue.setChiPhiUocTinh(chiPhiUocTinh);
        }
        if (tramThueId != null) {
            Tram tramThue = tramRepository.findById(tramThueId)
                    .orElseThrow(() -> new RuntimeException("Tram thue not found with id: " + tramThueId));
            donThue.setTramThue(tramThue);
        }
        if (tramTraId != null) {
            Tram tramTra = tramRepository.findById(tramTraId)
                    .orElseThrow(() -> new RuntimeException("Tram tra not found with id: " + tramTraId));
            donThue.setTramTra(tramTra);
        }

        DonThue updatedDonThue = donThueRepository.save(donThue);
        logger.info("Cap nhat don thue thanh cong voi id: {}", updatedDonThue.getId());
        return updatedDonThue;
    }

    @Transactional
    public void xoaDonThue(UUID id) {
        if (!donThueRepository.existsById(id)) {
            throw new RuntimeException("DonThue not found with id: " + id);
        }
        donThueRepository.deleteById(id);
        logger.info("Xoa don thue thanh cong voi id: {}", id);
    }
}