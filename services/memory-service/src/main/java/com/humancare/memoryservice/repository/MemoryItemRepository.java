package com.humancare.memoryservice.repository;

import com.humancare.memoryservice.entity.MemoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MemoryItemRepository extends JpaRepository<MemoryItem, UUID> {
    List<MemoryItem> findByPatientId(UUID patientId);
    List<MemoryItem> findByPatientIdIn(List<UUID> patientIds);
}
