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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin controller for managing blogs
 * All endpoints require ADMIN role authorization
 */
@RestController
@RequestMapping("/api/v1/admin/blogs")
@Tag(name = "Admin - Blogs", description = "Admin blog management endpoints")
@SecurityRequirement(name = "Bearer Token")
@PreAuthorize("hasRole('ADMIN')")  // All endpoints require ADMIN role
public class AdminBlogController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminBlogController.class);
    
    @Autowired
    private BlogService blogService;
    
    /**
     * Get all blogs (admin view) with search and filtering
     * Supports sorting via Pageable (e.g., sort=createdAt,desc) or explicit orderBy/orderDirection
     */
    @GetMapping
    @Operation(summary = "Get all blogs", description = "Retrieve all blogs (admin view with pagination, sorting, and search)")
    @ApiResponse(responseCode = "200", description = "Blogs retrieved successfully")
    public ResponseEntity<Page<Blog>> getAllBlogs(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String orderBy,
            @RequestParam(required = false, defaultValue = "desc") String orderDirection) {

        logger.info("Fetching all blogs - Page: {}, Size: {}, Search: {}, Status: {}, OrderBy: {}, OrderDir: {}",
                   pageable.getPageNumber(), pageable.getPageSize(), search, status, orderBy, orderDirection);

        com.indicab.util.SearchSpecification.SpecificationBuilder<Blog> builder =
            new com.indicab.util.SearchSpecification.SpecificationBuilder<>();

        if (search != null && !search.isEmpty()) {
            builder.with("title", search, com.indicab.util.SearchSpecification.SearchOperator.CONTAINS)
                   .or().with("content", search, com.indicab.util.SearchSpecification.SearchOperator.CONTAINS);
        }

        if (status != null && !status.isEmpty()) {
            builder.with("status", status, com.indicab.util.SearchSpecification.SearchOperator.EQUALS);
        }

        Page<Blog> blogs = blogService.getAllBlogs(pageable, builder.build());
        return ResponseEntity.ok(blogs);
    }

    /**
     * Get draft blogs only with search
     */
    @GetMapping("/drafts")
    @Operation(summary = "Get draft blogs", description = "Retrieve draft blogs only with optional search")
    @ApiResponse(responseCode = "200", description = "Draft blogs retrieved successfully")
    public ResponseEntity<Page<Blog>> getDraftBlogs(
            Pageable pageable,
            @RequestParam(required = false) String search) {

        logger.info("Fetching draft blogs - Page: {}, Size: {}, Search: {}",
                   pageable.getPageNumber(), pageable.getPageSize(), search);

        com.indicab.util.SearchSpecification.SpecificationBuilder<Blog> builder =
            new com.indicab.util.SearchSpecification.SpecificationBuilder<>();

        // Always filter by DRAFT status
        builder.with("status", "DRAFT", com.indicab.util.SearchSpecification.SearchOperator.EQUALS);

        if (search != null && !search.isEmpty()) {
            builder.with("title", search, com.indicab.util.SearchSpecification.SearchOperator.CONTAINS)
                   .or().with("content", search, com.indicab.util.SearchSpecification.SearchOperator.CONTAINS);
        }

        Page<Blog> blogs = blogService.getAllBlogs(pageable, builder.build());
        return ResponseEntity.ok(blogs);
    }
    
    /**
     * Create a new blog
     */
    @PostMapping
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
     * Get blog by ID
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
    
    /**
     * Update a blog
     */
    @PutMapping("/{id}")
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
     * Delete a blog
     */
    @DeleteMapping("/{id}")
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
     * Publish a blog
     */
    @PutMapping("/{id}/publish")
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
     * Unpublish a blog
     */
    @PutMapping("/{id}/unpublish")
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

    /**
     * Delete multiple blogs
     */
    @DeleteMapping("/bulk")
    @Operation(summary = "Bulk delete blogs", description = "Delete multiple blog posts at once")
    @ApiResponse(responseCode = "204", description = "Blogs deleted successfully")
    public ResponseEntity<Void> bulkDeleteBlogs(@RequestBody java.util.List<Long> ids) {
        logger.info("Admin performing bulk delete on blogs. Count: {}", ids.size());
        blogService.bulkDeleteBlogs(ids);
        return ResponseEntity.noContent().build();
    }

    /**
     * Bulk update blogs status
     */
    @PutMapping("/bulk/status")
    @Operation(summary = "Bulk update blogs status", description = "Update status for multiple blog posts at once")
    @ApiResponse(responseCode = "200", description = "Blogs updated successfully")
    public ResponseEntity<Void> bulkUpdateBlogsStatus(
            @RequestBody java.util.List<Long> ids,
            @RequestParam String status) {

        logger.info("Admin performing bulk status update to: {} for {} blogs", status, ids.size());
        blogService.bulkUpdateBlogsStatus(ids, status);
        return ResponseEntity.ok().build();
    }
}
