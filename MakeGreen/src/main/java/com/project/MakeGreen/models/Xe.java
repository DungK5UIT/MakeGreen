package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "xe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Xe {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "bien_so", unique = true)
    private String bienSo;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "pin_phan_tram")
    private Integer pinPhanTram;

    @Column(name = "so_km")
    private Double soKm;

    @Column(name = "name")
    private String name;

    @Column(name = "brand")
    private String brand;

    @Column(name = "model")
    private String model;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "top_speed_kmh")
    private Integer topSpeedKmh;

    @Column(name = "battery")
    private String battery;

    @Column(name = "price")
    private Double price;

    @Column(name = "deposit")
    private Double deposit;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "charge_time")
    private String chargeTime;

    @Column(name = "weight_kg")
    private Integer weightKg;

    @Column(name = "dung_luong_pin_wh")
    private Integer dungLuongPinWh;

    @Column(name = "pin_tieu_thu_per_km")
    private Double pinTieuThuPerKm;
}