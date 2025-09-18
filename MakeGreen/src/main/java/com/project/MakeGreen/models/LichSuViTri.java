package com.project.MakeGreen.models;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "lich_su_vi_tri")
public class LichSuViTri {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "chuyen_di_id", nullable = false)
    private UUID chuyenDiId;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "pin")
    private Integer pin;

    @Column(name = "toc_do")
    private Double tocDo;

    @Column(name = "so_km")
    private Double soKm;

    @Column(name = "cap_nhat_luc", nullable = false)
    private ZonedDateTime capNhatLuc;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getChuyenDiId() { return chuyenDiId; }
    public void setChuyenDiId(UUID chuyenDiId) { this.chuyenDiId = chuyenDiId; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    public Integer getPin() { return pin; }
    public void setPin(Integer pin) { this.pin = pin; }
    public Double getTocDo() { return tocDo; }
    public void setTocDo(Double tocDo) { this.tocDo = tocDo; }
    public Double getSoKm() { return soKm; }
    public void setSoKm(Double soKm) { this.soKm = soKm; }
    public ZonedDateTime getCapNhatLuc() { return capNhatLuc; }
    public void setCapNhatLuc(ZonedDateTime capNhatLuc) { this.capNhatLuc = capNhatLuc; }
}