package com.humancare.memoryservice.dto;

import com.humancare.memoryservice.entity.MemoryCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryItemCreateRequest {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Memory category is required")
    private MemoryCategory memoryCategory;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String imageUrl;
    private String location;
    private Integer yearTaken;
    private String[] persons;
    private String[] questions;
    private String[] correctAnswers;
    private boolean storybookSelected;
}
