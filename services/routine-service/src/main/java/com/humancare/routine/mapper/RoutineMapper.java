package com.humancare.routine.mapper;

import org.springframework.stereotype.Component;

import com.humancare.routine.dto.CreateRoutineRequest;
import com.humancare.routine.dto.RoutineResponse;
import com.humancare.routine.dto.UpdateRoutineRequest;
import com.humancare.routine.entity.Routine;

@Component
public class RoutineMapper {

    public Routine toEntity(CreateRoutineRequest request) {
        Routine routine = new Routine();
        routine.setPatientId(request.patientId());
        routine.setTitle(request.title());
        routine.setDescription(request.description());
        routine.setFrequency(request.frequency());
        routine.setTimeOfDay(request.timeOfDay());
        routine.setIsActive(true);
        return routine;
    }

    public void applyUpdate(Routine routine, UpdateRoutineRequest request) {
        routine.setTitle(request.title());
        routine.setDescription(request.description());
        routine.setFrequency(request.frequency());
        routine.setTimeOfDay(request.timeOfDay());
        routine.setIsActive(request.isActive());
    }

    public RoutineResponse toResponse(Routine routine) {
        return new RoutineResponse(
                routine.getId(),
                routine.getPatientId(),
                routine.getTitle(),
                routine.getDescription(),
                routine.getFrequency(),
                routine.getTimeOfDay(),
                routine.getIsActive(),
                routine.getCreatedAt(),
                routine.getUpdatedAt()
        );
    }
}
