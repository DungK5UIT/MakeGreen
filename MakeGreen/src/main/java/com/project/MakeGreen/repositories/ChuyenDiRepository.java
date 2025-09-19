package com.project.MakeGreen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.MakeGreen.models.ChuyenDi;

import java.util.Optional;
import java.util.UUID;

public interface ChuyenDiRepository extends JpaRepository<ChuyenDi, UUID> {
    Optional<ChuyenDi> findByDonThueId(UUID donThueId);
}
