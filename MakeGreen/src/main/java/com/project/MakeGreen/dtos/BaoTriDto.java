// BaoTriDto.java
package com.project.MakeGreen.dtos;

import com.project.MakeGreen.models.BaoTri;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class BaoTriDto {
    private UUID id;
    private UUID xeId;
    private String trangThai;
    private ZonedDateTime lichHen;
    private ZonedDateTime batDauLuc;
    private ZonedDateTime ketThucLuc;
    private String noiDung;

    public static BaoTriDto from(BaoTri baoTri) {
        if (baoTri == null) {
            return null;
        }

        BaoTriDto dto = new BaoTriDto();
        dto.setId(baoTri.getId());
        dto.setXeId(baoTri.getXe() != null ? baoTri.getXe().getId() : null);
        dto.setTrangThai(baoTri.getTrangThai());
        dto.setLichHen(baoTri.getLichHen());
        dto.setBatDauLuc(baoTri.getBatDauLuc());
        dto.setKetThucLuc(baoTri.getKetThucLuc());
        dto.setNoiDung(baoTri.getNoiDung());
        return dto;
    }
}