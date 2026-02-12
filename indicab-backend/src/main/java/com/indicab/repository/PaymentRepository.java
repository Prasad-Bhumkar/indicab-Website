package com.indicab.repository;

import com.indicab.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Payment entity with pagination support
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Find payment by Stripe payment ID
     */
    Optional<Payment> findByStripePaymentId(String stripePaymentId);

    /**
     * Find payments by booking ID with pagination
     */
    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId ORDER BY p.createdAt DESC")
    Page<Payment> findByBookingId(@Param("bookingId") Long bookingId, Pageable pageable);

    /**
     * Find payments by status with pagination
     */
    @Query("SELECT p FROM Payment p WHERE p.status = :status ORDER BY p.createdAt DESC")
    Page<Payment> findByStatus(@Param("status") String status, Pageable pageable);

    /**
     * Find payments by payment method with pagination
     */
    @Query("SELECT p FROM Payment p WHERE p.paymentMethod = :paymentMethod ORDER BY p.createdAt DESC")
    Page<Payment> findByPaymentMethod(@Param("paymentMethod") String paymentMethod, Pageable pageable);

    /**
     * Count payments by status
     */
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status")
    Long countByStatus(@Param("status") String status);
}
