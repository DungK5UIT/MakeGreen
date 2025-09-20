package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "vi_tri_xe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViTriXe {
    @Id
    @UuidGenerator
    private UUID id;

    @OneToOne
    @JoinColumn(name = "xe_id", unique = true, nullable = false)
    private Xe xe;

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

    @Column(name = "cap_nhat_luc")
    private ZonedDateTime capNhatLuc;

    @Version  // Thêm field này để enable optimistic locking explicitly
    private Long version;
}