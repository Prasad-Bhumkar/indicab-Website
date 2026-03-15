package com.indicab.util;

import com.indicab.entity.User;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SearchSpecification utility class
 * Tests all search operators and the specification builder
 */
@DisplayName("SearchSpecification Tests")
class SearchSpecificationTest {

    @Mock
    private Root<User> root;

    @Mock
    private Path<?> path;

    @Mock
    private CriteriaQuery<?> query;

    @Mock
    private CriteriaBuilder cb;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        // Provide default behavior for common CriteriaBuilder operations
        when(cb.conjunction()).thenReturn(mock(Predicate.class));
        when(cb.equal(any(), any())).thenReturn(mock(Predicate.class));
        when(cb.notEqual(any(), any())).thenReturn(mock(Predicate.class));
        when(cb.like(any(), anyString())).thenReturn(mock(Predicate.class));

        // Provide a stable path for root.get(...) calls
        doReturn(path).when(root).get(anyString());
        doReturn(path).when(path).as(String.class);
        doReturn(path).when(path).as(Comparable.class);
    }

    @Test
    @DisplayName("Test CONTAINS operator with null value")
    void testContainsWithNullValue() {
        SearchSpecification<User> spec = new SearchSpecification<>("email", null, SearchSpecification.SearchOperator.CONTAINS);
        spec.toPredicate(root, query, cb);

        verify(cb, times(1)).conjunction();
    }

    @Test
    @DisplayName("Test CONTAINS operator with empty string")
    void testContainsWithEmptyValue() {
        SearchSpecification<User> spec = new SearchSpecification<>("email", "", SearchSpecification.SearchOperator.CONTAINS);
        spec.toPredicate(root, query, cb);

        verify(cb, times(1)).conjunction();
    }

    @Test
    @DisplayName("Test EQUALS operator")
    void testEqualsOperator() {
        SearchSpecification<User> spec = new SearchSpecification<>("role", "ADMIN", SearchSpecification.SearchOperator.EQUALS);
        
        Predicate result = spec.toPredicate(root, query, cb);
        
        assertNotNull(result);
    }

    @Test
    @DisplayName("Test NOT_EQUALS operator")
    void testNotEqualsOperator() {
        SearchSpecification<User> spec = new SearchSpecification<>("status", "INACTIVE", SearchSpecification.SearchOperator.NOT_EQUALS);
        
        Predicate result = spec.toPredicate(root, query, cb);
        
        assertNotNull(result);
    }

    @Test
    @DisplayName("Test STARTS_WITH operator")
    void testStartsWithOperator() {
        SearchSpecification<User> spec = new SearchSpecification<>("firstName", "John", SearchSpecification.SearchOperator.STARTS_WITH);
        
        Predicate result = spec.toPredicate(root, query, cb);
        
        assertNotNull(result);
    }

    @Test
    @DisplayName("Test ENDS_WITH operator")
    void testEndsWithOperator() {
        SearchSpecification<User> spec = new SearchSpecification<>("email", "@gmail.com", SearchSpecification.SearchOperator.ENDS_WITH);
        
        Predicate result = spec.toPredicate(root, query, cb);
        
        assertNotNull(result);
    }

    @Test
    @DisplayName("Test GREATER_THAN operator")
    void testGreaterThanOperator() {
        SearchSpecification<User> spec = new SearchSpecification<>("id", 10L, SearchSpecification.SearchOperator.GREATER_THAN);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
    }

    @Test
    @DisplayName("Test LESS_THAN operator")
    void testLessThanOperator() {
        SearchSpecification<User> spec = new SearchSpecification<>("id", 100L, SearchSpecification.SearchOperator.LESS_THAN);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
    }

    @Test
    @DisplayName("Test SpecificationBuilder with multiple conditions")
    void testSpecificationBuilder() {
        SearchSpecification.SpecificationBuilder<User> builder = new SearchSpecification.SpecificationBuilder<>();

        builder.with("firstName", "John", SearchSpecification.SearchOperator.CONTAINS)
               .with("email", "test@example.com", SearchSpecification.SearchOperator.EQUALS)
               .with("role", "ADMIN", SearchSpecification.SearchOperator.EQUALS);

        assertNotNull(builder.build());
    }

    @Test
    @DisplayName("Test SpecificationBuilder with comparison operators")
    void testSpecificationBuilderWithComparisonOperators() {
        SearchSpecification.SpecificationBuilder<User> builder = new SearchSpecification.SpecificationBuilder<>();

        builder.with("id", 5L, SearchSpecification.SearchOperator.GREATER_THAN_EQUAL)
               .with("email", "test@example.com", SearchSpecification.SearchOperator.EQUALS);

        assertNotNull(builder.build());
    }

    @Test
    @DisplayName("Test SpecificationBuilder with empty specifications")
    void testSpecificationBuilderEmpty() {
        SearchSpecification.SpecificationBuilder<User> builder = new SearchSpecification.SpecificationBuilder<>();
        
        // No specifications added
        Predicate result = builder.build().toPredicate(root, query, cb);
        
        assertNotNull(result);
    }

    @Test
    @DisplayName("Test SpecificationBuilder ignores null values")
    void testSpecificationBuilderIgnoresNull() {
        SearchSpecification.SpecificationBuilder<User> builder = new SearchSpecification.SpecificationBuilder<>();
        
        builder.with("firstName", null, SearchSpecification.SearchOperator.CONTAINS)
               .with("email", "test@example.com", SearchSpecification.SearchOperator.EQUALS);
        
        assertNotNull(builder.build());
    }
}
