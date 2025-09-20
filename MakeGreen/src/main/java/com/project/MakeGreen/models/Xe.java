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

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "pin_phan_tram")
    private Integer pinPhanTram;

    @Column(name = "so_km")
    private Double soKm;
}