package com.humancare.checkin.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.humancare.checkin.entity.DailyCheckin;

@Repository
public interface DailyCheckinRepository extends JpaRepository<DailyCheckin, UUID> {
    
    Page<DailyCheckin> findByPatientId(UUID patientId, Pageable pageable);
    
    Optional<DailyCheckin> findByPatientIdAndCheckinDate(UUID patientId, LocalDate checkinDate);
    
    boolean existsByPatientIdAndCheckinDate(UUID patientId, LocalDate checkinDate);
}
