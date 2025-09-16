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
    @UuidGenerator // ← XÓA HOÀN TOÀN columnDefinition = "uuid"
    private UUID id;

    @Column(name = "bien_so", unique = true)
    private String bienSo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dong_xe_id", nullable = false)
    private DongXe dongXe;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "pin_phan_tram")
    private Integer pinPhanTram;

    @Column(name = "so_km")
    private Double soKm;

    @Column(name = "lat_hien_tai")
    private Double latHienTai;

    @Column(name = "lng_hien_tai")
    private Double lngHienTai;

    @Column(name = "vung_id")
    private UUID vungId;
}