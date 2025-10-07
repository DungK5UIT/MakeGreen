package com.project.MakeGreen.repositories;

import com.project.MakeGreen.models.TramXe;
import com.project.MakeGreen.models.Xe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TramXeRepository extends JpaRepository<TramXe, UUID> {
    
    // Phương thức để tìm liên kết Tram-Xe dựa trên đối tượng Xe
    Optional<TramXe> findByXe(Xe xe);
}