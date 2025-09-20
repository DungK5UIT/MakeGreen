package com.project.MakeGreen.repositories;

import com.project.MakeGreen.models.ViTriXe;
import com.project.MakeGreen.models.Xe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ViTriXeRepository extends JpaRepository<ViTriXe, UUID> {
    Optional<ViTriXe> findByXe(Xe xe);  // Thêm method này để find by xe
}