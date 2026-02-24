package com.humancare.routine.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.humancare.routine.entity.Routine;

public interface RoutineRepository extends JpaRepository<Routine, UUID> {
    Page<Routine> findByPatientId(UUID patientId, Pageable pageable);
}
