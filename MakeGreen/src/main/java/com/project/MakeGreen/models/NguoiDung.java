package com.project.MakeGreen.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Entity @Table(name = "nguoi_dung")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NguoiDung {
  @Id
  @Column(columnDefinition = "uuid")
  private UUID id;

  private String email;
  private String sdt;
  private String hoTen;
  private String trang_thai;
  private OffsetDateTime ngay_tao;
  private Boolean enabled;
  
  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "vai_tro_nguoi_dung",
      joinColumns = @JoinColumn(name = "nguoi_dung_id"),
      inverseJoinColumns = @JoinColumn(name = "vai_tro_id")
  )
  private Set<VaiTro> vaiTros;

  @PrePersist
  protected void onCreate() {
      this.ngay_tao = OffsetDateTime.now();
  }
}