// BaoTriRepository.java
package com.project.MakeGreen.repositories;

import com.project.MakeGreen.models.BaoTri;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BaoTriRepository extends JpaRepository<BaoTri, UUID> {
}