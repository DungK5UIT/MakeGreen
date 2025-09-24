package com.project.MakeGreen.dtos;

import com.project.MakeGreen.models.SuCo;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class SuCoDto {
    private UUID id;
    private UUID xeId;
    private UUID nguoiBaoCaoId;
    private String mucDo;
    private String moTa;
    private ZonedDateTime taoLuc;
    private ZonedDateTime xuLyLuc;
    private String trangThai; // Thêm trường trangThai

    public static SuCoDto from(SuCo suCo) {
        if (suCo == null) {
            return null;
        }

        SuCoDto dto = new SuCoDto();
        dto.setId(suCo.getId());
        dto.setXeId(suCo.getXe().getId());
        dto.setNguoiBaoCaoId(suCo.getNguoiBaoCao() != null ? suCo.getNguoiBaoCao().getId() : null);
        dto.setMucDo(suCo.getMucDo());
        dto.setMoTa(suCo.getMoTa());
        dto.setTaoLuc(suCo.getTaoLuc());
        dto.setXuLyLuc(suCo.getXuLyLuc());
        dto.setTrangThai(suCo.getTrangThai()); // Ánh xạ trangThai
        return dto;
    }
}