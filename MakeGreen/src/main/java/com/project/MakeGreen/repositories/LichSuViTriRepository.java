package com.project.MakeGreen.repositories;


import org.springframework.data.jpa.repository.JpaRepository;

import com.project.MakeGreen.models.LichSuViTri;

import java.util.UUID;

public interface LichSuViTriRepository extends JpaRepository<LichSuViTri, UUID> {
    void deleteByChuyenDiId(UUID chuyenDiId);
}
