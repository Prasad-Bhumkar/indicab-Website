package com.indicab.util;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Generic search specification utility for filtering entities
 * Supports flexible field-based searching with multiple operators
 */
public class SearchSpecification<T> implements Specification<T> {

    private final String field;
    private final Object value;
    private final SearchOperator operator;

    public enum SearchOperator {
        EQUALS,
        CONTAINS,
        STARTS_WITH,
        ENDS_WITH,
        GREATER_THAN,
        LESS_THAN,
        GREATER_THAN_EQUAL,
        LESS_THAN_EQUAL,
        IN,
        NOT_EQUALS
    }

    public SearchSpecification(String field, Object value, SearchOperator operator) {
        this.field = field;
        this.value = value;
        this.operator = operator;
    }

    private jakarta.persistence.criteria.Path<Object> resolvePath(Root<T> root) {
        jakarta.persistence.criteria.Path<Object> path = (jakarta.persistence.criteria.Path<Object>) (jakarta.persistence.criteria.Path<?>) root;
        String[] parts = field.split("\\.");
        for (String part : parts) {
            path = path.get(part);
        }
        return path;
    }

    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        if (value == null || (value instanceof String && ((String) value).isEmpty())) {
            return cb.conjunction();
        }

        jakarta.persistence.criteria.Path<Object> path = resolvePath(root);
        String stringValue = value instanceof String ? (String) value : value.toString();

        switch (operator) {
            case CONTAINS:
                return cb.like(cb.lower(path.as(String.class)), "%" + stringValue.toLowerCase() + "%");
            case STARTS_WITH:
                return cb.like(cb.lower(path.as(String.class)), stringValue.toLowerCase() + "%");
            case ENDS_WITH:
                return cb.like(cb.lower(path.as(String.class)), "%" + stringValue.toLowerCase());
            case EQUALS:
                return cb.equal(path, value);
            case NOT_EQUALS:
                return cb.notEqual(path, value);
            case GREATER_THAN:
                return cb.greaterThan(path.as(Comparable.class), (Comparable) value);
            case LESS_THAN:
                return cb.lessThan(path.as(Comparable.class), (Comparable) value);
            case GREATER_THAN_EQUAL:
                return cb.greaterThanOrEqualTo(path.as(Comparable.class), (Comparable) value);
            case LESS_THAN_EQUAL:
                return cb.lessThanOrEqualTo(path.as(Comparable.class), (Comparable) value);
            case IN:
                return path.in((Object[]) stringValue.split(","));
            default:
                return cb.conjunction();
        }
    }

    /**
     * Builder for fluent API construction of specifications
     */
    public static class SpecificationBuilder<T> {
        private final List<Specification<T>> specifications = new ArrayList<>();
        private boolean nextIsOr = false;

        public SpecificationBuilder<T> with(String field, Object value, SearchOperator operator) {
            if (value != null && (!(value instanceof String) || !((String) value).isEmpty())) {
                SearchSpecification<T> spec = new SearchSpecification<>(field, value, operator);
                if (nextIsOr && !specifications.isEmpty()) {
                    Specification<T> last = specifications.remove(specifications.size() - 1);
                    specifications.add(last.or(spec));
                    nextIsOr = false;
                } else {
                    specifications.add(spec);
                }
            }
            return this;
        }

        public SpecificationBuilder<T> or() {
            this.nextIsOr = true;
            return this;
        }

        public Specification<T> build() {
            if (specifications.isEmpty()) {
                return (root, query, cb) -> cb.conjunction();
            }

            Specification<T> result = specifications.get(0);
            for (int i = 1; i < specifications.size(); i++) {
                result = result.and(specifications.get(i));
            }
            return result;
        }
    }
}
