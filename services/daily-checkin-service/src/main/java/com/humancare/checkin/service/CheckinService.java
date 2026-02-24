package com.humancare.checkin.service;

import com.humancare.checkin.dto.CheckinResponse;
import com.humancare.checkin.dto.CreateCheckinRequest;
import com.humancare.checkin.dto.SymptomCheckResponse;
import com.humancare.checkin.dto.UpdateCheckinRequest;
import com.humancare.checkin.entity.DailyCheckin;
import com.humancare.checkin.entity.SymptomCheck;
import com.humancare.checkin.exception.CheckinNotFoundException;
import com.humancare.checkin.exception.DuplicateCheckinException;
import com.humancare.checkin.repository.DailyCheckinRepository;
import com.humancare.checkin.repository.SymptomCheckRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CheckinService {

    private final DailyCheckinRepository dailyCheckinRepository;
    private final SymptomCheckRepository symptomCheckRepository;

    public CheckinService(DailyCheckinRepository dailyCheckinRepository, 
                          SymptomCheckRepository symptomCheckRepository) {
        this.dailyCheckinRepository = dailyCheckinRepository;
        this.symptomCheckRepository = symptomCheckRepository;
    }

    @Transactional
    public CheckinResponse create(CreateCheckinRequest request) {
        // Check for duplicate checkin on same date
        if (dailyCheckinRepository.existsByPatientIdAndCheckinDate(request.getPatientId(), request.getCheckinDate())) {
            throw new DuplicateCheckinException(request.getPatientId(), request.getCheckinDate());
        }

        DailyCheckin checkin = new DailyCheckin();
        checkin.setPatientId(request.getPatientId());
        checkin.setMood(request.getMood());
        checkin.setEnergyLevel(request.getEnergyLevel());
        checkin.setSleepQuality(request.getSleepQuality());
        checkin.setNotes(request.getNotes());
        checkin.setCheckinDate(request.getCheckinDate());

        DailyCheckin savedCheckin = dailyCheckinRepository.save(checkin);

        // Add symptoms if provided
        if (request.getSymptoms() != null && !request.getSymptoms().isEmpty()) {
            request.getSymptoms().forEach(symptomRequest -> {
                SymptomCheck symptom = new SymptomCheck();
                symptom.setSymptomType(symptomRequest.getSymptomType());
                symptom.setSeverity(symptomRequest.getSeverity());
                symptom.setPresent(symptomRequest.getPresent());
                savedCheckin.addSymptom(symptom);
            });
            dailyCheckinRepository.save(savedCheckin);
        }

        return mapToResponse(savedCheckin);
    }

    @Transactional(readOnly = true)
    public CheckinResponse findById(UUID id) {
        DailyCheckin checkin = dailyCheckinRepository.findById(id)
                .orElseThrow(() -> new CheckinNotFoundException(id));
        return mapToResponse(checkin);
    }

    @Transactional(readOnly = true)
    public Page<CheckinResponse> findByPatientId(UUID patientId, Pageable pageable) {
        return dailyCheckinRepository.findByPatientId(patientId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Optional<CheckinResponse> findByPatientIdAndDate(UUID patientId, LocalDate date) {
        return dailyCheckinRepository.findByPatientIdAndCheckinDate(patientId, date)
                .map(this::mapToResponse);
    }

    @Transactional
    public CheckinResponse update(UUID id, UpdateCheckinRequest request) {
        DailyCheckin checkin = dailyCheckinRepository.findById(id)
                .orElseThrow(() -> new CheckinNotFoundException(id));

        if (request.getMood() != null) {
            checkin.setMood(request.getMood());
        }
        if (request.getEnergyLevel() != null) {
            checkin.setEnergyLevel(request.getEnergyLevel());
        }
        if (request.getSleepQuality() != null) {
            checkin.setSleepQuality(request.getSleepQuality());
        }
        if (request.getNotes() != null) {
            checkin.setNotes(request.getNotes());
        }

        // Update symptoms if provided
        if (request.getSymptoms() != null) {
            // Clear existing symptoms
            checkin.getSymptoms().clear();
            
            // Add new symptoms
            request.getSymptoms().forEach(symptomRequest -> {
                SymptomCheck symptom = new SymptomCheck();
                symptom.setSymptomType(symptomRequest.getSymptomType());
                symptom.setSeverity(symptomRequest.getSeverity());
                symptom.setPresent(symptomRequest.getPresent());
                checkin.addSymptom(symptom);
            });
        }

        DailyCheckin updatedCheckin = dailyCheckinRepository.save(checkin);
        return mapToResponse(updatedCheckin);
    }

    @Transactional
    public void delete(UUID id) {
        DailyCheckin checkin = dailyCheckinRepository.findById(id)
                .orElseThrow(() -> new CheckinNotFoundException(id));
        dailyCheckinRepository.delete(checkin);
    }

    @Transactional(readOnly = true)
    public boolean hasCheckinForDate(UUID patientId, LocalDate date) {
        return dailyCheckinRepository.existsByPatientIdAndCheckinDate(patientId, date);
    }

    private CheckinResponse mapToResponse(DailyCheckin checkin) {
        CheckinResponse response = new CheckinResponse();
        response.setId(checkin.getId());
        response.setPatientId(checkin.getPatientId());
        response.setMood(checkin.getMood());
        response.setEnergyLevel(checkin.getEnergyLevel());
        response.setSleepQuality(checkin.getSleepQuality());
        response.setNotes(checkin.getNotes());
        response.setCheckinDate(checkin.getCheckinDate());
        response.setCreatedAt(checkin.getCreatedAt());
        response.setUpdatedAt(checkin.getUpdatedAt());

        List<SymptomCheckResponse> symptomResponses = checkin.getSymptoms().stream()
                .map(this::mapSymptomToResponse)
                .collect(Collectors.toList());
        response.setSymptoms(symptomResponses);

        return response;
    }

    private SymptomCheckResponse mapSymptomToResponse(SymptomCheck symptom) {
        SymptomCheckResponse response = new SymptomCheckResponse();
        response.setId(symptom.getId());
        response.setSymptomType(symptom.getSymptomType());
        response.setSeverity(symptom.getSeverity());
        response.setPresent(symptom.getPresent());
        return response;
    }
}
