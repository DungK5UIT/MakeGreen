package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "don_thue")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonThue {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "nguoi_dung_id", nullable = false)
    private UUID nguoiDungId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "xe_id", nullable = false)
    private Xe xe;

    @Column(name = "bat_dau_luc")
    private OffsetDateTime batDauLuc;

    @Column(name = "ket_thuc_luc")
    private OffsetDateTime ketThucLuc;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "so_tien_coc")
    private BigDecimal soTienCoc;

    @Column(name = "chi_phi_uoc_tinh")
    private BigDecimal chiPhiUocTinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tram_thue_id", nullable = false)
    private Tram tramThue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tram_tra_id", nullable = false)
    private Tram tramTra;
}