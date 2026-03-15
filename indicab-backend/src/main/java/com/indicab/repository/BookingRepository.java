package com.indicab.repository;

import com.indicab.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    /**
     * Find all bookings for a user with pagination
     */
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    Page<Booking> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find bookings by status with pagination
     */
    @Query("SELECT b FROM Booking b WHERE b.status = :status ORDER BY b.createdAt DESC")
    Page<Booking> findByStatus(@Param("status") String status, Pageable pageable);

    /**
     * Find bookings by user ID and status with pagination
     */
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status ORDER BY b.createdAt DESC")
    Page<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status, Pageable pageable);

    /**
     * Count bookings by user ID
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    /**
     * Count bookings by status
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    Long countByStatus(@Param("status") String status);

    /**
     * Find all bookings for a user without pagination
     */
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    java.util.List<Booking> findByUserId(@Param("userId") Long userId);
}
