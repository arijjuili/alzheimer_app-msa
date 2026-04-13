package com.humancare.memoryservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "memory_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "memory_category", nullable = false)
    private MemoryCategory memoryCategory;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "location")
    private String location;

    @Column(name = "year_taken")
    private Integer yearTaken;

    @Column(name = "persons", columnDefinition = "text[]")
    private String[] persons;

    @Column(name = "questions", columnDefinition = "text[]")
    private String[] questions;

    @Column(name = "correct_answers", columnDefinition = "text[]")
    private String[] correctAnswers;

    @Column(name = "storybook_selected", nullable = false)
    @Builder.Default
    private boolean storybookSelected = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
