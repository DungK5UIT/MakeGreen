package com.project.MakeGreen.repositories;


import com.project.MakeGreen.models.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, UUID> {
  Optional<NguoiDung> findByEmail(String email);
}