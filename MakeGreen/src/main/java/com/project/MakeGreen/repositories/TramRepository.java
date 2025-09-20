package com.project.MakeGreen.repositories;

import com.project.MakeGreen.models.Tram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TramRepository extends JpaRepository<Tram, UUID> {
    
    /**
     * Tìm trạm theo tên (partial match)
     */
    List<Tram> findByTenContainingIgnoreCase(String ten);
    
    /**
     * Tìm trạm theo trạng thái
     */
    List<Tram> findByTrangThai(String trangThai);
    
    /**
     * Tìm trạm có sức chứa còn lại
     */
    List<Tram> findBySucChuaGreaterThan(Integer sucChua);
    
    /**
     * Tìm trạm đang hoạt động và có sức chứa
     */
    List<Tram> findByTrangThaiEqualsAndSucChuaGreaterThan(String trangThai, Integer sucChua);
    
    /**
     * Tìm trạm theo ID với Optional
     */
    Optional<Tram> findById(UUID id);
    
    /**
     * Tìm trạm theo tên chính xác
     */
    Optional<Tram> findByTen(String ten);
}