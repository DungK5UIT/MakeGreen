package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "thanh_toan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToan {
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "nguoi_dung_id", nullable = false)
    private UUID nguoiDungId;

    @Column(name = "don_thue_id")
    private UUID donThueId;

    @Column(name = "loai")
    private String loai;

    @Column(name = "phuong_thuc")
    private String phuongThuc;

    @Column(name = "so_tien")
    private BigDecimal soTien;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "thanh_toan_luc")
    private OffsetDateTime thanhToanLuc;

    @PrePersist
    protected void onCreate() {
        this.thanhToanLuc = OffsetDateTime.now();
    }
}