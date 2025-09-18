package com.project.MakeGreen.models;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "chuyen_di")
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

    @Column(name = "path", columnDefinition = "jsonb")
    private String path;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getDonThueId() { return donThueId; }
    public void setDonThueId(UUID donThueId) { this.donThueId = donThueId; }
    public UUID getNguoiDungId() { return nguoiDungId; }
    public void setNguoiDungId(UUID nguoiDungId) { this.nguoiDungId = nguoiDungId; }
    public UUID getXeId() { return xeId; }
    public void setXeId(UUID xeId) { this.xeId = xeId; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public ZonedDateTime getBatDauLuc() { return batDauLuc; }
    public void setBatDauLuc(ZonedDateTime batDauLuc) { this.batDauLuc = batDauLuc; }
    public ZonedDateTime getKetThucLuc() { return ketThucLuc; }
    public void setKetThucLuc(ZonedDateTime ketThucLuc) { this.ketThucLuc = ketThucLuc; }
    public Double getTongChiPhi() { return tongChiPhi; }
    public void setTongChiPhi(Double tongChiPhi) { this.tongChiPhi = tongChiPhi; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}