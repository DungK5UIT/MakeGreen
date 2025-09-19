package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "su_co")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuCo {
    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "xe_id", nullable = false)
    private Xe xe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_bao_cao_id")
    private NguoiDung nguoiBaoCao;

    @Column(name = "muc_do")
    private String mucDo;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "tao_luc")
    private ZonedDateTime taoLuc = ZonedDateTime.now();

    @Column(name = "xu_ly_luc")
    private ZonedDateTime xuLyLuc;
}