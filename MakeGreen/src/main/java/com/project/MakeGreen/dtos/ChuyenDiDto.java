package com.project.MakeGreen.dtos;

import com.project.MakeGreen.models.ChuyenDi;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class ChuyenDiDto {
    private UUID id;
    private UUID donThueId;
    private UUID nguoiDungId;
    private UUID xeId;
    private String trangThai;
    private ZonedDateTime batDauLuc;
    private ZonedDateTime ketThucLuc;
    private Double tongChiPhi;
    private String path;

    public static ChuyenDiDto from(ChuyenDi chuyenDi) {
        if (chuyenDi == null) {
            return null;
        }

        ChuyenDiDto dto = new ChuyenDiDto();
        dto.setId(chuyenDi.getId());
        dto.setDonThueId(chuyenDi.getDonThueId());
        dto.setNguoiDungId(chuyenDi.getNguoiDungId());
        dto.setXeId(chuyenDi.getXeId());
        dto.setTrangThai(chuyenDi.getTrangThai());
        dto.setBatDauLuc(chuyenDi.getBatDauLuc());
        dto.setKetThucLuc(chuyenDi.getKetThucLuc());
        dto.setTongChiPhi(chuyenDi.getTongChiPhi());
        dto.setPath(chuyenDi.getPath());
        return dto;
    }
}