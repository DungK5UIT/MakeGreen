package com.project.MakeGreen.repositories;

import com.project.MakeGreen.models.DongXe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DongXeRepository extends JpaRepository<DongXe, UUID> {
}