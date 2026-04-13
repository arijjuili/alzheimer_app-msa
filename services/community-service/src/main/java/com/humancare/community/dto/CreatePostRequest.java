package com.humancare.community.dto;

import com.humancare.community.entity.PostCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank(message = "Author ID is required")
        String authorId,

        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be less than 150 characters")
        String title,

        @NotBlank(message = "Content is required")
        @Size(max = 2000, message = "Content must be less than 2000 characters")
        String content,

        @NotNull(message = "Category is required")
        PostCategory category
) {}
