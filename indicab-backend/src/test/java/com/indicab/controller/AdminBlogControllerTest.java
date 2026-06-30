package com.indicab.controller;

import com.indicab.entity.Blog;
import com.indicab.repository.BlogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for AdminBlogController
 * Tests admin blog endpoints with search, sort, and pagination
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AdminBlogController Tests")
class AdminBlogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BlogRepository blogRepository;

    @BeforeEach
    void setUp() {
        blogRepository.deleteAll();
    }

    private Blog createTestBlog(String title, String content, String status) {
        Blog blog = new Blog();
        blog.setTitle(title);
        blog.setContent(content);
        blog.setAuthor("Admin");
        blog.setStatus(status);
        blog.setCreatedAt(LocalDateTime.now());
        blog.setUpdatedAt(LocalDateTime.now());
        return blogRepository.save(blog);
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs - Get all blogs without filters")
    @WithMockUser(roles = "ADMIN")
    void testGetAllBlogsNoFilters() throws Exception {
        // Arrange
        createTestBlog("Blog Title 1", "Blog Content 1", "PUBLISHED");
        createTestBlog("Blog Title 2", "Blog Content 2", "DRAFT");
        createTestBlog("Blog Title 3", "Blog Content 3", "PUBLISHED");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs - Filter by status")
    @WithMockUser(roles = "ADMIN")
    void testGetBlogsFilterByStatus() throws Exception {
        // Arrange
        createTestBlog("Published Blog 1", "Content 1", "PUBLISHED");
        createTestBlog("Published Blog 2", "Content 2", "PUBLISHED");
        createTestBlog("Draft Blog 1", "Content 3", "DRAFT");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("status", "PUBLISHED")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs - Search by title")
    @WithMockUser(roles = "ADMIN")
    void testGetBlogsSearchByTitle() throws Exception {
        // Arrange
        createTestBlog("Spring Boot Tutorial", "Learn Spring Boot", "PUBLISHED");
        createTestBlog("Java Best Practices", "Java Tips", "PUBLISHED");
        createTestBlog("Spring Framework Guide", "Spring Info", "DRAFT");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("search", "Spring")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs - Search by content")
    @WithMockUser(roles = "ADMIN")
    void testGetBlogsSearchByContent() throws Exception {
        // Arrange
        createTestBlog("Blog 1", "This is about microservices architecture", "PUBLISHED");
        createTestBlog("Blog 2", "This discusses REST APIs", "PUBLISHED");
        createTestBlog("Blog 3", "Another microservices guide", "DRAFT");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("search", "microservices")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs/drafts - Get draft blogs only")
    @WithMockUser(roles = "ADMIN")
    void testGetDraftBlogs() throws Exception {
        // Arrange
        createTestBlog("Published 1", "Content 1", "PUBLISHED");
        createTestBlog("Draft 1", "Content 2", "DRAFT");
        createTestBlog("Draft 2", "Content 3", "DRAFT");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs/drafts")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs/drafts - Search in draft blogs")
    @WithMockUser(roles = "ADMIN")
    void testGetDraftBlogsSearch() throws Exception {
        // Arrange
        createTestBlog("Published Spring", "About Spring", "PUBLISHED");
        createTestBlog("Draft Spring", "Draft content about Spring", "DRAFT");
        createTestBlog("Draft Java", "Draft Java content", "DRAFT");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs/drafts")
                .param("search", "Spring")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs - Pagination")
    @WithMockUser(roles = "ADMIN")
    void testGetBlogsPagination() throws Exception {
        // Arrange
        for (int i = 0; i < 25; i++) {
            createTestBlog("Blog " + i, "Content " + i, "PUBLISHED");
        }

        // Act & Assert - First page
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(10))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(3));

        // Act & Assert - Third page
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("page", "2")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(5))
                .andExpect(jsonPath("$.number").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs - Sorting by title ascending")
    @WithMockUser(roles = "ADMIN")
    void testGetBlogsSorting() throws Exception {
        // Arrange
        createTestBlog("Zebra Blog", "Content 1", "PUBLISHED");
        createTestBlog("Apple Blog", "Content 2", "PUBLISHED");
        createTestBlog("Mango Blog", "Content 3", "PUBLISHED");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("page", "0")
                .param("size", "10")
                .param("sort", "title,asc")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Apple Blog"))
                .andExpect(jsonPath("$.content[2].title").value("Zebra Blog"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs - Combined search, filter, and pagination")
    @WithMockUser(roles = "ADMIN")
    void testGetBlogsCombined() throws Exception {
        // Arrange
        createTestBlog("Spring Basics", "Learn Spring Boot basics", "PUBLISHED");
        createTestBlog("Spring Advanced", "Advanced Spring topics", "DRAFT");
        createTestBlog("Java Patterns", "Design patterns in Java", "PUBLISHED");
        createTestBlog("Spring Best Practices", "Spring framework best practices", "DRAFT");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("search", "Spring")
                .param("status", "DRAFT")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs/{id} - Get blog by ID")
    @WithMockUser(roles = "ADMIN")
    void testGetBlogById() throws Exception {
        // Arrange
        Blog blog = createTestBlog("Test Blog", "Test Content", "PUBLISHED");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs/" + blog.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(blog.getId()))
                .andExpect(jsonPath("$.title").value("Test Blog"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/blogs/{id} - Blog not found")
    @WithMockUser(roles = "ADMIN")
    void testGetBlogByIdNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Unauthorized - Missing ADMIN role")
    @WithMockUser(roles = "USER")
    void testGetBlogsUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated - No token")
    void testGetBlogsUnauthenticated() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/blogs")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
