// BaoTri.java
package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "bao_tri")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoTri {
    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "xe_id", nullable = false)
    private Xe xe;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "lich_hen")
    private ZonedDateTime lichHen;

    @Column(name = "bat_dau_luc")
    private ZonedDateTime batDauLuc;

    @Column(name = "ket_thuc_luc")
    private ZonedDateTime ketThucLuc;

    @Column(name = "noi_dung")
    private String noiDung;
}