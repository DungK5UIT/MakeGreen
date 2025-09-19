package com.project.MakeGreen.repositories;

import com.project.MakeGreen.models.ViTriXe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ViTriXeRepository extends JpaRepository<ViTriXe, UUID> {
}