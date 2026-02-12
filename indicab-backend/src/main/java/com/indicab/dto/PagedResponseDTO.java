package com.indicab.dto;

import java.util.List;

/**
 * Generic DTO for paginated API responses
 */
public class PagedResponseDTO<T> {
    
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean hasNextPage;
    private boolean hasPreviousPage;

    public PagedResponseDTO() {}

    public PagedResponseDTO(List<T> content, int pageNumber, int pageSize, 
                           long totalElements, int totalPages) {
        this.content = content;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.hasNextPage = pageNumber < totalPages - 1;
        this.hasPreviousPage = pageNumber > 0;
    }

    public List<T> getContent() { return content; }
    public void setContent(List<T> content) { this.content = content; }

    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public boolean isHasNextPage() { return hasNextPage; }
    public void setHasNextPage(boolean hasNextPage) { this.hasNextPage = hasNextPage; }

    public boolean isHasPreviousPage() { return hasPreviousPage; }
    public void setHasPreviousPage(boolean hasPreviousPage) { this.hasPreviousPage = hasPreviousPage; }
}
