package com.project.MakeGreen.dtos;

import com.project.MakeGreen.models.Tram;
import lombok.Data;

import java.util.UUID;

@Data
public class TramDto {
    private UUID id;
    private String ten;
    private String diaChi;
    private Double lat;
    private Double lng;
    private Integer sucChua;
    private String trangThai;

    public static TramDto from(Tram tram) {
        if (tram == null) {
            return null;
        }
        TramDto dto = new TramDto();
        dto.setId(tram.getId());
        dto.setTen(tram.getTen());
        dto.setDiaChi(tram.getDiaChi());
        dto.setLat(tram.getLat());
        dto.setLng(tram.getLng());
        dto.setSucChua(tram.getSucChua());
        dto.setTrangThai(tram.getTrangThai());
        return dto;
    }
}