package com.humancare.routine.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.humancare.routine.dto.CreateRoutineRequest;
import com.humancare.routine.dto.RoutineResponse;
import com.humancare.routine.dto.UpdateRoutineRequest;
import com.humancare.routine.entity.Routine;
import com.humancare.routine.exception.RoutineNotFoundException;
import com.humancare.routine.mapper.RoutineMapper;
import com.humancare.routine.repository.RoutineRepository;

@Service
public class RoutineService {

    private final RoutineRepository repository;
    private final RoutineMapper mapper;
    private final EventPublisherService eventPublisher;
    private final com.humancare.routine.client.PatientClient patientClient;

    public RoutineService(RoutineRepository repository, RoutineMapper mapper,
                          EventPublisherService eventPublisher,
                          com.humancare.routine.client.PatientClient patientClient) {
        this.repository = repository;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
        this.patientClient = patientClient;
    }

    @Transactional(readOnly = true)
    public Page<RoutineResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<RoutineResponse> findByPatientId(UUID patientId, Pageable pageable) {
        return repository.findByPatientId(patientId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public RoutineResponse findById(UUID id) {
        return mapper.toResponse(getOrThrow(id));
    }

    @Transactional
    public RoutineResponse create(CreateRoutineRequest request) {
        // Synchronous Feign validation: ensure patient exists
        var patient = patientClient.getPatientById(request.patientId());
        if (patient == null) {
            throw new com.humancare.routine.exception.RoutineNotFoundException(request.patientId());
        }
        Routine routine = mapper.toEntity(request);
        Routine saved = repository.save(routine);
        return mapper.toResponse(saved);
    }

    @Transactional
    public RoutineResponse completeRoutine(UUID id) {
        Routine routine = getOrThrow(id);
        routine.setCompleted(true);
        routine.setIsActive(false);
        Routine saved = repository.save(routine);

        eventPublisher.publishRoutineCompleted(new com.humancare.routine.event.RoutineCompletedEvent(
                saved.getId(),
                saved.getPatientId(),
                saved.getTitle(),
                java.time.LocalDateTime.now()
        ));

        return mapper.toResponse(saved);
    }

    @Transactional
    public RoutineResponse update(UUID id, UpdateRoutineRequest request) {
        Routine routine = getOrThrow(id);
        mapper.applyUpdate(routine, request);
        return mapper.toResponse(routine);
    }

    @Transactional
    public void delete(UUID id) {
        Routine routine = getOrThrow(id);
        repository.delete(routine);
    }

    private Routine getOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RoutineNotFoundException(id));
    }
}
