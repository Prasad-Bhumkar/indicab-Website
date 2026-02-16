package com.indicab.controller;

import com.indicab.dto.BlogDTO;
import com.indicab.entity.Blog;
import com.indicab.service.impl.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing blogs
 * Public endpoints for reading blogs, admin endpoints for CRUD
 */
@RestController
@RequestMapping("/api/v1/blogs")
@Tag(name = "Blogs", description = "Blog management endpoints")
public class BlogController {
    
    private static final Logger logger = LoggerFactory.getLogger(BlogController.class);
    
    @Autowired
    private BlogService blogService;
    
    // ==================== PUBLIC ENDPOINTS ====================
    
    /**
     * Get published blogs (public)
     */
    @GetMapping("/published")
    @Operation(summary = "Get published blogs", description = "Retrieve published blogs for public display")
    @ApiResponse(responseCode = "200", description = "Published blogs retrieved successfully")
    public ResponseEntity<Page<Blog>> getPublishedBlogs(Pageable pageable) {
        logger.info("Fetching published blogs");
        Page<Blog> blogs = blogService.getPublishedBlogs(pageable);
        return ResponseEntity.ok(blogs);
    }
    
    /**
     * Get blog by ID (public)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get blog details", description = "Retrieve detailed information about a blog")
    @ApiResponse(responseCode = "200", description = "Blog retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Blog not found")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        logger.info("Fetching blog with ID: {}", id);
        return blogService.getBlogById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // ==================== ADMIN ENDPOINTS ====================
    
    /**
     * Get all blogs (admin)
     */
    @GetMapping("/admin/all")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Get all blogs", description = "Retrieve all blogs (admin view)")
    @ApiResponse(responseCode = "200", description = "Blogs retrieved successfully")
    public ResponseEntity<Page<Blog>> getAllBlogs(Pageable pageable) {
        logger.info("Fetching all blogs (admin view)");
        Page<Blog> blogs = blogService.getAllBlogs(pageable);
        return ResponseEntity.ok(blogs);
    }
    
    /**
     * Get draft blogs (admin)
     */
    @GetMapping("/admin/drafts")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Get draft blogs", description = "Retrieve draft blogs only")
    @ApiResponse(responseCode = "200", description = "Draft blogs retrieved successfully")
    public ResponseEntity<Page<Blog>> getDraftBlogs(Pageable pageable) {
        logger.info("Fetching draft blogs");
        Page<Blog> blogs = blogService.getDraftBlogs(pageable);
        return ResponseEntity.ok(blogs);
    }
    
    /**
     * Create a new blog (admin)
     */
    @PostMapping("/admin")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Create blog", description = "Create a new blog post")
    @ApiResponse(responseCode = "201", description = "Blog created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<Blog> createBlog(@Valid @RequestBody BlogDTO blogDTO) {
        logger.info("Creating new blog: {}", blogDTO.getTitle());
        
        try {
            Blog blog = blogService.createBlog(blogDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(blog);
        } catch (Exception e) {
            logger.error("Error creating blog: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update a blog (admin)
     */
    @PutMapping("/admin/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Update blog", description = "Update an existing blog post")
    @ApiResponse(responseCode = "200", description = "Blog updated successfully")
    @ApiResponse(responseCode = "404", description = "Blog not found")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<Blog> updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody BlogDTO blogDTO) {
        
        logger.info("Updating blog with ID: {}", id);
        
        try {
            Blog blog = blogService.updateBlog(id, blogDTO);
            return ResponseEntity.ok(blog);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating blog: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete a blog (admin)
     */
    @DeleteMapping("/admin/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Delete blog", description = "Delete a blog post permanently")
    @ApiResponse(responseCode = "204", description = "Blog deleted successfully")
    @ApiResponse(responseCode = "404", description = "Blog not found")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        logger.info("Deleting blog with ID: {}", id);
        
        try {
            blogService.deleteBlog(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error deleting blog: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Publish a blog (admin)
     */
    @PutMapping("/admin/{id}/publish")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Publish blog", description = "Change blog status to PUBLISHED")
    @ApiResponse(responseCode = "200", description = "Blog published successfully")
    @ApiResponse(responseCode = "404", description = "Blog not found")
    public ResponseEntity<Blog> publishBlog(@PathVariable Long id) {
        logger.info("Publishing blog with ID: {}", id);
        
        try {
            Blog blog = blogService.publishBlog(id);
            return ResponseEntity.ok(blog);
        } catch (IllegalArgumentException e) {
            logger.error("Error publishing blog: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Unpublish a blog (admin)
     */
    @PutMapping("/admin/{id}/unpublish")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Unpublish blog", description = "Change blog status to DRAFT")
    @ApiResponse(responseCode = "200", description = "Blog unpublished successfully")
    @ApiResponse(responseCode = "404", description = "Blog not found")
    public ResponseEntity<Blog> unpublishBlog(@PathVariable Long id) {
        logger.info("Unpublishing blog with ID: {}", id);
        
        try {
            Blog blog = blogService.unpublishBlog(id);
            return ResponseEntity.ok(blog);
        } catch (IllegalArgumentException e) {
            logger.error("Error unpublishing blog: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
