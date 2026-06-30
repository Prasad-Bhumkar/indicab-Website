package com.indicab.service.impl;

import com.indicab.dto.BlogDTO;
import com.indicab.entity.Blog;
import com.indicab.repository.BlogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BlogService Tests")
class BlogServiceTest {

    @Mock
    private BlogRepository blogRepository;

    @InjectMocks
    private BlogService blogService;

    private Blog testBlog;
    private BlogDTO blogDTO;

    @BeforeEach
    void setUp() {
        testBlog = new Blog("Test Blog Title", "This is the content of the test blog that is long enough.",
                "Author Name", "https://example.com/image.jpg", "DRAFT");
        setId(testBlog, 1L);
        testBlog.setPublishedAt(null);
        testBlog.setCreatedAt(LocalDateTime.now());
        testBlog.setUpdatedAt(LocalDateTime.now());

        blogDTO = new BlogDTO(null, "New Blog Title", "New blog content that meets the minimum length requirement.",
                "New Author", "https://example.com/new.jpg", "PUBLISHED");
    }

    private void setId(Object entity, Long id) {
        try {
            Field field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set id via reflection", e);
        }
    }

    @Test
    @DisplayName("Should create blog successfully")
    void testCreateBlog() {
        Blog savedBlog = new Blog("New Blog Title", "New blog content that meets the minimum length requirement.",
                "New Author", "https://example.com/new.jpg", "PUBLISHED");
        setId(savedBlog, 2L);
        when(blogRepository.save(any(Blog.class))).thenReturn(savedBlog);

        Blog result = blogService.createBlog(blogDTO);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("New Blog Title");
        assertThat(result.getStatus()).isEqualTo("PUBLISHED");
        verify(blogRepository).save(any(Blog.class));
    }

    @Test
    @DisplayName("Should create blog as draft when status is DRAFT")
    void testCreateBlogAsDraft() {
        blogDTO.setStatus("DRAFT");
        Blog savedBlog = new Blog("New Blog Title", "New blog content that meets the minimum length requirement.",
                "New Author", "https://example.com/new.jpg", "DRAFT");
        setId(savedBlog, 2L);
        when(blogRepository.save(any(Blog.class))).thenReturn(savedBlog);

        Blog result = blogService.createBlog(blogDTO);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("DRAFT");
    }

    @Test
    @DisplayName("Should get blog by ID")
    void testGetBlogById() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(testBlog));

        Optional<Blog> result = blogService.getBlogById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Test Blog Title");
    }

    @Test
    @DisplayName("Should return empty when blog ID not found")
    void testGetBlogByIdNotFound() {
        when(blogRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Blog> result = blogService.getBlogById(999L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get all blogs with pagination")
    void testGetAllBlogsWithPageable() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Blog> blogList = new ArrayList<>();
        blogList.add(testBlog);
        Page<Blog> blogPage = new PageImpl<>(blogList, pageable, blogList.size());

        when(blogRepository.findAll(pageable)).thenReturn(blogPage);

        Page<Blog> result = blogService.getAllBlogs(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get all blogs with specification")
    void testGetAllBlogsWithSpecification() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Blog> blogList = new ArrayList<>();
        blogList.add(testBlog);
        Page<Blog> blogPage = new PageImpl<>(blogList, pageable, blogList.size());

        when(blogRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(blogPage);

        Specification<Blog> spec = (root, query, cb) -> cb.equal(root.get("status"), "DRAFT");
        Page<Blog> result = blogService.getAllBlogs(pageable, spec);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get published blogs")
    void testGetPublishedBlogs() {
        Pageable pageable = PageRequest.of(0, 10);
        testBlog.setStatus("PUBLISHED");
        List<Blog> blogList = new ArrayList<>();
        blogList.add(testBlog);
        Page<Blog> blogPage = new PageImpl<>(blogList, pageable, blogList.size());

        when(blogRepository.findByStatus("PUBLISHED", pageable)).thenReturn(blogPage);

        Page<Blog> result = blogService.getPublishedBlogs(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get draft blogs")
    void testGetDraftBlogs() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Blog> blogList = new ArrayList<>();
        blogList.add(testBlog);
        Page<Blog> blogPage = new PageImpl<>(blogList, pageable, blogList.size());

        when(blogRepository.findByStatus("DRAFT", pageable)).thenReturn(blogPage);

        Page<Blog> result = blogService.getDraftBlogs(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should update blog successfully")
    void testUpdateBlog() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(testBlog));
        when(blogRepository.save(any(Blog.class))).thenReturn(testBlog);

        Blog result = blogService.updateBlog(1L, blogDTO);

        assertThat(result).isNotNull();
        verify(blogRepository).save(any(Blog.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent blog")
    void testUpdateBlogNotFound() {
        when(blogRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> blogService.updateBlog(999L, blogDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Blog not found with ID: 999");
    }

    @Test
    @DisplayName("Should delete blog successfully")
    void testDeleteBlog() {
        when(blogRepository.existsById(1L)).thenReturn(true);

        blogService.deleteBlog(1L);

        verify(blogRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent blog")
    void testDeleteBlogNotFound() {
        when(blogRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> blogService.deleteBlog(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Blog not found with ID: 999");
        verify(blogRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Should publish blog")
    void testPublishBlog() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(testBlog));
        when(blogRepository.save(any(Blog.class))).thenReturn(testBlog);

        Blog result = blogService.publishBlog(1L);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("PUBLISHED");
        verify(blogRepository).save(any(Blog.class));
    }

    @Test
    @DisplayName("Should throw exception when publishing non-existent blog")
    void testPublishBlogNotFound() {
        when(blogRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> blogService.publishBlog(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Blog not found with ID: 999");
    }

    @Test
    @DisplayName("Should unpublish blog")
    void testUnpublishBlog() {
        testBlog.setStatus("PUBLISHED");
        testBlog.setPublishedAt(LocalDateTime.now());
        when(blogRepository.findById(1L)).thenReturn(Optional.of(testBlog));
        when(blogRepository.save(any(Blog.class))).thenReturn(testBlog);

        Blog result = blogService.unpublishBlog(1L);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        verify(blogRepository).save(any(Blog.class));
    }

    @Test
    @DisplayName("Should check if blog exists")
    void testBlogExists() {
        when(blogRepository.existsById(1L)).thenReturn(true);

        boolean result = blogService.blogExists(1L);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when blog does not exist")
    void testBlogNotExists() {
        when(blogRepository.existsById(999L)).thenReturn(false);

        boolean result = blogService.blogExists(999L);

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should bulk delete blogs")
    void testBulkDeleteBlogs() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        ids.add(2L);

        blogService.bulkDeleteBlogs(ids);

        verify(blogRepository).deleteAllById(ids);
    }

    @Test
    @DisplayName("Should handle exception during bulk delete blogs")
    void testBulkDeleteBlogsException() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);

        doThrow(new RuntimeException("Database error")).when(blogRepository).deleteAllById(ids);

        assertThatThrownBy(() -> blogService.bulkDeleteBlogs(ids))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to delete multiple blogs");
    }

    @Test
    @DisplayName("Should bulk update blog status")
    void testBulkUpdateBlogsStatus() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        List<Blog> blogs = new ArrayList<>();
        blogs.add(testBlog);
        when(blogRepository.findAllById(ids)).thenReturn(blogs);
        when(blogRepository.saveAll(blogs)).thenReturn(blogs);

        blogService.bulkUpdateBlogsStatus(ids, "PUBLISHED");

        verify(blogRepository).saveAll(blogs);
    }

    @Test
    @DisplayName("Should handle exception during bulk update blog status")
    void testBulkUpdateBlogsStatusException() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        when(blogRepository.findAllById(ids)).thenThrow(new RuntimeException("Database error"));

        assertThatThrownBy(() -> blogService.bulkUpdateBlogsStatus(ids, "PUBLISHED"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to update status for multiple blogs");
    }
}
