package com.project.MakeGreen.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.MakeGreen.models.DonThue;

public interface DonThueRepository extends JpaRepository<DonThue, UUID> {
    Optional<DonThue> findById(UUID id);
}