package com.indicab.repository;

import com.indicab.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    
    Page<Blog> findByStatus(String status, Pageable pageable);
    
    Page<Blog> findAll(Pageable pageable);
}
