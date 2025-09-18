package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "tram")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tram {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "ten", nullable = false)
    private String ten;

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "suc_chua")
    private Integer sucChua;

    @Column(name = "trang_thai")
    private String trangThai;
}