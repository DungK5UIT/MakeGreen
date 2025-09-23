package com.project.MakeGreen.dtos;

import com.project.MakeGreen.models.Xe;
import lombok.Data;
import java.util.UUID;

@Data
public class XeDto {
    private UUID id;
    private String bienSo;
    private String trangThai;
    private Integer pinPhanTram;
    private Double soKm;
    private String name;
    private String brand;
    private String model;
    private Integer rangeKm;
    private Integer topSpeedKmh;
    private String battery;
    private Double price;
    private Double deposit;
    private Double rating;
    private String chargeTime;
    private Integer weightKg;
    private Integer dungLuongPinWh;
    private Double pinTieuThuPerKm;

    public static XeDto from(Xe xe) {
        if (xe == null) {
            return null;
        }

        XeDto dto = new XeDto();
        dto.setId(xe.getId());
        dto.setBienSo(xe.getBienSo());
        dto.setTrangThai(xe.getTrangThai());
        dto.setPinPhanTram(xe.getPinPhanTram());
        dto.setSoKm(xe.getSoKm());
        dto.setName(xe.getName());
        dto.setBrand(xe.getBrand());
        dto.setModel(xe.getModel());
        dto.setRangeKm(xe.getRangeKm());
        dto.setTopSpeedKmh(xe.getTopSpeedKmh());
        dto.setBattery(xe.getBattery());
        dto.setPrice(xe.getPrice());
        dto.setDeposit(xe.getDeposit());
        dto.setRating(xe.getRating());
        dto.setChargeTime(xe.getChargeTime());
        dto.setWeightKg(xe.getWeightKg());
        dto.setDungLuongPinWh(xe.getDungLuongPinWh());
        dto.setPinTieuThuPerKm(xe.getPinTieuThuPerKm());
        return dto;
    }
}