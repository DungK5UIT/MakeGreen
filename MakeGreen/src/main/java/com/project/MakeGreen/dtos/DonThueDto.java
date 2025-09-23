package com.project.MakeGreen.dtos;

import com.project.MakeGreen.models.DonThue;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DonThueDto {
    private UUID id;
    private UUID nguoiDungId;
    private UUID xeId;
    private OffsetDateTime batDauLuc;
    private OffsetDateTime ketThucLuc;
    private String trangThai;
    private BigDecimal soTienCoc;
    private BigDecimal chiPhiUocTinh;
    private UUID tramThueId;
    private UUID tramTraId;

    public static DonThueDto from(DonThue donThue) {
        if (donThue == null) {
            return null;
        }

        DonThueDto dto = new DonThueDto();
        dto.setId(donThue.getId());
        dto.setNguoiDungId(donThue.getNguoiDungId());
        dto.setXeId(donThue.getXe().getId());
        dto.setBatDauLuc(donThue.getBatDauLuc());
        dto.setKetThucLuc(donThue.getKetThucLuc());
        dto.setTrangThai(donThue.getTrangThai());
        dto.setSoTienCoc(donThue.getSoTienCoc());
        dto.setChiPhiUocTinh(donThue.getChiPhiUocTinh());
        dto.setTramThueId(donThue.getTramThue().getId());
        dto.setTramTraId(donThue.getTramTra().getId());
        return dto;
    }
}