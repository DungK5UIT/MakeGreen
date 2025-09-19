package com.project.MakeGreen.repositories;

import com.project.MakeGreen.models.SuCo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SuCoRepository extends JpaRepository<SuCo, UUID> {
}