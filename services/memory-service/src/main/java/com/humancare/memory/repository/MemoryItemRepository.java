package com.humancare.memory.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.humancare.memory.entity.MemoryItem;

@Repository
public interface MemoryItemRepository extends JpaRepository<MemoryItem, UUID> {
    Page<MemoryItem> findByPatientId(UUID patientId, Pageable pageable);
}
