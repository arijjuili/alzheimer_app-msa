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

    public RoutineService(RoutineRepository repository, RoutineMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
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
        Routine routine = mapper.toEntity(request);
        Routine saved = repository.save(routine);
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
