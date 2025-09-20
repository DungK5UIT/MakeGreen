package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;  // Import this for SqlTypes.JSON

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "chuyen_di")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChuyenDi {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "don_thue_id", nullable = false, unique = true)
    private UUID donThueId;

    @Column(name = "nguoi_dung_id", nullable = false)
    private UUID nguoiDungId;

    @Column(name = "xe_id", nullable = false)
    private UUID xeId;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "bat_dau_luc")
    private ZonedDateTime batDauLuc;

    @Column(name = "ket_thuc_luc")
    private ZonedDateTime ketThucLuc;

    @Column(name = "tong_chi_phi")
    private Double tongChiPhi;

    @JdbcTypeCode(SqlTypes.JSON)  // Add this to handle jsonb mapping
    @Column(name = "path", columnDefinition = "jsonb")
    private String path;	
}