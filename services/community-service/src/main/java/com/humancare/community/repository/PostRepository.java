package com.humancare.community.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.humancare.community.entity.CommunityPost;
import com.humancare.community.entity.PostCategory;

public interface PostRepository extends JpaRepository<CommunityPost, UUID> {
    Page<CommunityPost> findByAuthorId(UUID authorId, Pageable pageable);
    Page<CommunityPost> findByCategory(PostCategory category, Pageable pageable);
}
