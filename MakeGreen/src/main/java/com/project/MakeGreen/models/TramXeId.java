// File mới: TramXeId.java
package com.project.MakeGreen.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode // Rất quan trọng cho khóa phức hợp
public class TramXeId implements Serializable {

    @Column(name = "tram_id")
    private UUID tramId;

    @Column(name = "xe_id")
    private UUID xeId;
}