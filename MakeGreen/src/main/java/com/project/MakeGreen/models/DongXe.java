package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "dong_xe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DongXe {
    @Id
    @UuidGenerator // ← XÓA HOÀN TOÀN columnDefinition = "uuid"
    private UUID id;

    @Column(name = "hang")
    private String hang;

    @Column(name = "dong")
    private String dong;

    @Column(name = "dung_luong_pin_wh")
    private Integer dungLuongPinWh;

    @Column(name = "slug", unique = true)
    private String slug;

    @Column(name = "tam_hoat_dong_km")
    private Integer tamHoatDongKm;

    @Column(name = "top_speed_kmh")
    private Integer topSpeedKmh;

    @Column(name = "kieu_pin")
    private String kieuPin;

    @Column(name = "thoi_gian_sac")
    private String thoiGianSac;

    @Column(name = "trong_luong_kg")
    private Integer trongLuongKg;

    @Column(name = "rating_mac_dinh")
    private Double ratingMacDinh;
}