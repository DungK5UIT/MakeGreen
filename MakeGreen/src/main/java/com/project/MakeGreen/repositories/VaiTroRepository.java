package com.project.MakeGreen.repositories;
import com.project.MakeGreen.models.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface VaiTroRepository extends JpaRepository<VaiTro, UUID> {
  Optional<VaiTro> findByMa(String ma);
}