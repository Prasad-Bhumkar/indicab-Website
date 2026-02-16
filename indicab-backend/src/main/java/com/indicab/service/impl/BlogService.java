package com.indicab.service.impl;

import com.indicab.dto.BlogDTO;
import com.indicab.entity.Blog;
import com.indicab.repository.BlogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for managing blogs
 */
@Service
public class BlogService {
    
    private static final Logger logger = LoggerFactory.getLogger(BlogService.class);
    
    @Autowired
    private BlogRepository blogRepository;
    
    /**
     * Create a new blog
     */
    public Blog createBlog(BlogDTO blogDTO) {
        logger.info("Creating new blog: {}", blogDTO.getTitle());
        
        Blog blog = new Blog(
            blogDTO.getTitle(),
            blogDTO.getContent(),
            blogDTO.getAuthor(),
            blogDTO.getImageUrl(),
            blogDTO.getStatus()
        );
        
        // If publishing, set published date
        if ("PUBLISHED".equals(blogDTO.getStatus())) {
            blog.setPublishedAt(LocalDateTime.now());
        }
        
        Blog savedBlog = blogRepository.save(blog);
        logger.info("Blog created successfully with ID: {}", savedBlog.getId());
        return savedBlog;
    }
    
    /**
     * Get blog by ID
     */
    public Optional<Blog> getBlogById(Long id) {
        logger.debug("Fetching blog with ID: {}", id);
        return blogRepository.findById(id);
    }
    
    /**
     * Get all blogs with pagination (admin view)
     */
    public Page<Blog> getAllBlogs(Pageable pageable) {
        logger.debug("Fetching all blogs");
        return blogRepository.findAll(pageable);
    }
    
    /**
     * Get published blogs only (public view)
     */
    public Page<Blog> getPublishedBlogs(Pageable pageable) {
        logger.debug("Fetching published blogs");
        return blogRepository.findByStatus("PUBLISHED", pageable);
    }
    
    /**
     * Get draft blogs only
     */
    public Page<Blog> getDraftBlogs(Pageable pageable) {
        logger.debug("Fetching draft blogs");
        return blogRepository.findByStatus("DRAFT", pageable);
    }
    
    /**
     * Update a blog
     */
    public Blog updateBlog(Long id, BlogDTO blogDTO) {
        logger.info("Updating blog with ID: {}", id);
        
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found with ID: " + id));
        
        boolean statusChanged = !blog.getStatus().equals(blogDTO.getStatus());
        
        blog.setTitle(blogDTO.getTitle());
        blog.setContent(blogDTO.getContent());
        blog.setAuthor(blogDTO.getAuthor());
        blog.setImageUrl(blogDTO.getImageUrl());
        blog.setStatus(blogDTO.getStatus());
        
        // Set published date if changing to PUBLISHED
        if (statusChanged && "PUBLISHED".equals(blogDTO.getStatus())) {
            blog.setPublishedAt(LocalDateTime.now());
        }
        
        Blog updatedBlog = blogRepository.save(blog);
        logger.info("Blog updated successfully with ID: {}", id);
        return updatedBlog;
    }
    
    /**
     * Delete a blog
     */
    public void deleteBlog(Long id) {
        logger.info("Deleting blog with ID: {}", id);
        
        if (!blogRepository.existsById(id)) {
            throw new IllegalArgumentException("Blog not found with ID: " + id);
        }
        
        blogRepository.deleteById(id);
        logger.info("Blog deleted successfully with ID: {}", id);
    }
    
    /**
     * Publish a blog (change status to PUBLISHED)
     */
    public Blog publishBlog(Long id) {
        logger.info("Publishing blog with ID: {}", id);
        
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found with ID: " + id));
        
        blog.setStatus("PUBLISHED");
        blog.setPublishedAt(LocalDateTime.now());
        
        Blog publishedBlog = blogRepository.save(blog);
        logger.info("Blog published successfully with ID: {}", id);
        return publishedBlog;
    }
    
    /**
     * Unpublish a blog (change status to DRAFT)
     */
    public Blog unpublishBlog(Long id) {
        logger.info("Unpublishing blog with ID: {}", id);
        
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found with ID: " + id));
        
        blog.setStatus("DRAFT");
        blog.setPublishedAt(null);
        
        Blog unpublishedBlog = blogRepository.save(blog);
        logger.info("Blog unpublished successfully with ID: {}", id);
        return unpublishedBlog;
    }
    
    /**
     * Check if blog exists
     */
    public boolean blogExists(Long id) {
        return blogRepository.existsById(id);
    }
}
