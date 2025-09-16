package com.project.MakeGreen.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.MakeGreen.models.ThanhToan;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, UUID> {
    List<ThanhToan> findByDonThueIdAndPhuongThuc(UUID donThueId, String phuongThuc);
}