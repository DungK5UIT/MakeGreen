package com.project.MakeGreen.repositories;

import com.project.MakeGreen.models.Xe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface XeRepository extends JpaRepository<Xe, UUID> {
}