package com.humancare.memoryservice.dto;

import com.humancare.memoryservice.entity.MemoryCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryItemResponse {
    private UUID id;
    private UUID patientId;
    private MemoryCategory memoryCategory;
    private String title;
    private String description;
    private String imageUrl;
    private String location;
    private Integer yearTaken;
    private String[] persons;
    private String[] questions;
    private String[] correctAnswers;
    private boolean storybookSelected;
    private OffsetDateTime createdAt;
}
