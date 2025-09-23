package com.project.MakeGreen.dtos;

import com.project.MakeGreen.models.NguoiDung;
import com.project.MakeGreen.models.VaiTro;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class NguoiDungDto {
    private UUID id;
    private String email;
    private String sdt;
    private String hoTen;
    private String trangThai;
    private OffsetDateTime ngayTao;
    private Boolean enabled;
    private Set<String> vaiTros;

    public static NguoiDungDto from(NguoiDung nguoiDung) {
        if (nguoiDung == null) {
            return null;
        }

        NguoiDungDto dto = new NguoiDungDto();
        dto.setId(nguoiDung.getId());
        dto.setEmail(nguoiDung.getEmail());
        dto.setSdt(nguoiDung.getSdt());
        dto.setHoTen(nguoiDung.getHoTen());
        dto.setTrangThai(nguoiDung.getTrangThai());
        dto.setNgayTao(nguoiDung.getNgayTao());
        dto.setEnabled(nguoiDung.getEnabled());
        dto.setVaiTros(nguoiDung.getVaiTros().stream()
                .map(VaiTro::getTen) // Corrected from getName() to getTen()
                .collect(Collectors.toSet()));
        return dto;
    }
}