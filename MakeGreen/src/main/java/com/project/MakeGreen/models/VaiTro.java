package com.project.MakeGreen.models;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity @Table(name = "vai_tro")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class VaiTro {
  @Id
  @GeneratedValue
  @Column(columnDefinition = "uuid")
  private UUID id;

  @Column(unique = true)
  private String ma;  // ví dụ: admin, user, ktv

  private String ten;
}