package com.humancare.checkin.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.humancare.checkin.entity.SymptomCheck;

@Repository
public interface SymptomCheckRepository extends JpaRepository<SymptomCheck, UUID> {

    List<SymptomCheck> findByDailyCheckinId(UUID dailyCheckinId);
}
