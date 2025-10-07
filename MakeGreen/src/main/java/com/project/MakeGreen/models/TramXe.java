// Thay thế toàn bộ nội dung file: TramXe.java
package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tram_xe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TramXe {

    @EmbeddedId // Sử dụng khóa phức hợp
    private TramXeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tramId") // Ánh xạ thuộc tính tramId trong TramXeId
    @JoinColumn(name = "tram_id")
    private Tram tram;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId("xeId") // Ánh xạ thuộc tính xeId trong TramXeId
    @JoinColumn(name = "xe_id")
    private Xe xe;

    // Constructor tiện lợi mới
    public TramXe(Xe xe, Tram tram) {
        this.xe = xe;
        this.tram = tram;
        this.id = new TramXeId(tram.getId(), xe.getId());
    }
}