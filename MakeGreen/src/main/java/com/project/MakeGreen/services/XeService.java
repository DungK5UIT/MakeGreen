package com.project.MakeGreen.services;

import com.project.MakeGreen.dtos.XeDto;
import com.project.MakeGreen.models.Tram;
import com.project.MakeGreen.models.TramXe;
import com.project.MakeGreen.models.TramXeId;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.repositories.TramRepository;
import com.project.MakeGreen.repositories.TramXeRepository;
import com.project.MakeGreen.repositories.XeRepository;
import org.hibernate.Hibernate;
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
public class XeService {

    private static final Logger logger = LoggerFactory.getLogger(XeService.class);

    @Autowired
    private XeRepository xeRepository;

    @Autowired
    private TramRepository tramRepository;  // Inject để validate tramId

    @Autowired
    private TramXeRepository tramXeRepository;  // Inject để quản lý liên kết TramXe

    // Create: Tạo xe mới, thêm param tramId để liên kết với trạm
    @Transactional
    public Xe taoXe(String bienSo, String trangThai, Integer pinPhanTram, Double soKm, String name, String brand, String model, Integer rangeKm, Integer topSpeedKmh, String battery, Double price, Double deposit, Double rating, String chargeTime, Integer weightKg, Integer dungLuongPinWh, Double pinTieuThuPerKm, String tinhTrang, UUID tramId) {
        Xe xe = Xe.builder()
                .bienSo(bienSo)
                .trangThai(trangThai)
                .pinPhanTram(pinPhanTram)
                .soKm(soKm)
                .name(name)
                .brand(brand)
                .model(model)
                .rangeKm(rangeKm)
                .topSpeedKmh(topSpeedKmh)
                .battery(battery)
                .price(price)
                .deposit(deposit)
                .rating(rating)
                .chargeTime(chargeTime)
                .weightKg(weightKg)
                .dungLuongPinWh(dungLuongPinWh)
                .pinTieuThuPerKm(pinTieuThuPerKm)
                .tinhTrang(tinhTrang)
                .build();

        Xe savedXe = xeRepository.save(xe);

        // Liên kết với trạm nếu có tramId
        if (tramId != null) {
            Tram tram = tramRepository.findById(tramId)
                    .orElseThrow(() -> new RuntimeException("Tram not found with id: " + tramId));
            TramXe tramXe = new TramXe(savedXe, tram);
            tramXeRepository.save(tramXe);
            logger.info("Liên kết xe {} với trạm {} thành công", savedXe.getId(), tramId);
        }

        Hibernate.initialize(savedXe.getBaoTris());
        logger.info("Tao xe thanh cong voi id: {}", savedXe.getId());

        return savedXe;
    }

    // Read: Lấy tất cả xe, set tramId vào DTO nếu có liên kết
    @Transactional(readOnly = true)
    public List<XeDto> layTatCaXe() {
        List<Xe> xes = xeRepository.findAll();
        return xes.stream().map(xe -> {
            Hibernate.initialize(xe.getBaoTris());
            XeDto dto = XeDto.from(xe);
            Optional<TramXe> tramXeOpt = tramXeRepository.findByXeId(xe.getId());
            tramXeOpt.ifPresent(tramXe -> dto.setTramId(tramXe.getTram().getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    // Read: Lấy xe theo ID, set tramId vào DTO nếu có liên kết
    @Transactional(readOnly = true)
    public Optional<XeDto> layXeTheoId(UUID id) {
        Optional<Xe> optionalXe = xeRepository.findById(id);
        return optionalXe.map(xe -> {
            Hibernate.initialize(xe.getBaoTris());
            XeDto dto = XeDto.from(xe);
            Optional<TramXe> tramXeOpt = tramXeRepository.findByXeId(xe.getId());
            tramXeOpt.ifPresent(tramXe -> dto.setTramId(tramXe.getTram().getId()));
            return dto;
        });
    }

    // Update: Cập nhật xe, thêm param tramId để cập nhật liên kết
    @Transactional
    public Xe capNhatXe(UUID id, String bienSo, String trangThai, Integer pinPhanTram, Double soKm, String name, String brand, String model, Integer rangeKm, Integer topSpeedKmh, String battery, Double price, Double deposit, Double rating, String chargeTime, Integer weightKg, Integer dungLuongPinWh, Double pinTieuThuPerKm, String tinhTrang, UUID tramId) {
        Xe xe = xeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Xe not found with id: " + id));

        if (bienSo != null) {
            xe.setBienSo(bienSo);
        }
        if (trangThai != null) {
            xe.setTrangThai(trangThai);
        }
        if (pinPhanTram != null) {
            xe.setPinPhanTram(pinPhanTram);
        }
        if (soKm != null) {
            xe.setSoKm(soKm);
        }
        if (name != null) {
            xe.setName(name);
        }
        if (brand != null) {
            xe.setBrand(brand);
        }
        if (model != null) {
            xe.setModel(model);
        }
        if (rangeKm != null) {
            xe.setRangeKm(rangeKm);
        }
        if (topSpeedKmh != null) {
            xe.setTopSpeedKmh(topSpeedKmh);
        }
        if (battery != null) {
            xe.setBattery(battery);
        }
        if (price != null) {
            xe.setPrice(price);
        }
        if (deposit != null) {
            xe.setDeposit(deposit);
        }
        if (rating != null) {
            xe.setRating(rating);
        }
        if (chargeTime != null) {
            xe.setChargeTime(chargeTime);
        }
        if (weightKg != null) {
            xe.setWeightKg(weightKg);
        }
        if (dungLuongPinWh != null) {
            xe.setDungLuongPinWh(dungLuongPinWh);
        }
        if (pinTieuThuPerKm != null) {
            xe.setPinTieuThuPerKm(pinTieuThuPerKm);
        }
        if (tinhTrang != null) {
            xe.setTinhTrang(tinhTrang);
        }

        // Xử lý liên kết trạm
        Optional<TramXe> existingTramXe = tramXeRepository.findByXeId(id);
        if (tramId != null) {
            Tram tram = tramRepository.findById(tramId)
                    .orElseThrow(() -> new RuntimeException("Tram not found with id: " + tramId));
            if (existingTramXe.isPresent()) {
                TramXe tramXe = existingTramXe.get();
                if (!tramXe.getTram().getId().equals(tramId)) {
                    tramXe.setTram(tram);
                    tramXe.setId(new TramXeId(tramId, id));
                    tramXeRepository.save(tramXe);
                }
            } else {
                TramXe newTramXe = new TramXe(xe, tram);
                tramXeRepository.save(newTramXe);
            }
            logger.info("Cap nhat lien ket tram cho xe {} thanh {}", id, tramId);
        } else if (existingTramXe.isPresent()) {
            tramXeRepository.delete(existingTramXe.get());
            logger.info("Xoa lien ket tram cho xe {}", id);
        }

        Xe updatedXe = xeRepository.save(xe);
        Hibernate.initialize(updatedXe.getBaoTris());
        logger.info("Cap nhat xe thanh cong voi id: {}", updatedXe.getId());

        return updatedXe;
    }

    // Delete: Xóa xe, xóa liên kết TramXe nếu có
    @Transactional
    public void xoaXe(UUID id) {
        if (!xeRepository.existsById(id)) {
            throw new RuntimeException("Xe not found with id: " + id);
        }
        Optional<TramXe> tramXeOpt = tramXeRepository.findByXeId(id);
        tramXeOpt.ifPresent(tramXeRepository::delete);
        xeRepository.deleteById(id);
        logger.info("Xoa xe thanh cong voi id: {}", id);
    }
}