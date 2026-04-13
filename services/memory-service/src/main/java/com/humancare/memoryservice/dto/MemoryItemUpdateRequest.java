package com.humancare.memoryservice.dto;

import com.humancare.memoryservice.entity.MemoryCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryItemUpdateRequest {
    private MemoryCategory memoryCategory;
    private String title;
    private String description;
    private String imageUrl;
    private String location;
    private Integer yearTaken;
    private String[] persons;
    private String[] questions;
    private String[] correctAnswers;
    private Boolean storybookSelected;
}
