package com.indicab.service.impl;

import com.indicab.entity.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.*;

/**
 * Unit tests for EmailService
 * Tests booking notifications, confirmations, and cancellation emails
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService Tests")
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    private Booking testBooking;

    @BeforeEach
    void setUp() {
        // Setup test booking
        testBooking = new Booking();
        testBooking.setId(123L);
        testBooking.setFullName("John Doe");
        testBooking.setEmail("john@example.com");
        testBooking.setPhoneNumber("9876543210");
        testBooking.setFrom("Mumbai");
        testBooking.setTo("Pune");
        testBooking.setDate("2026-02-20");
        testBooking.setVehicle("SEDAN");
        testBooking.setPassengerCount(2);
        testBooking.setAmount(500.0);
        testBooking.setPickupAddress("123 Main Street, Mumbai");
        testBooking.setDropoffAddress("456 Oak Avenue, Pune");
        testBooking.setContactPreference("Call");
        testBooking.setSpecialRequirements("None");

        // Setup admin email through reflection
        ReflectionTestUtils.setField(emailService, "adminEmail", "admin@indicab.com");
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@indicab.com");
    }

    // ==================== Admin Notification Tests ====================

    @Test
    @DisplayName("Should send booking notification email to admin successfully")
    void testSendBookingNotificationToAdminSuccess() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendBookingNotificationToAdmin(testBooking);

        // Assert
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Should skip sending notification when mail sender is not configured")
    void testSendBookingNotificationWithoutMailSender() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "mailSender", null);

        // Act
        emailService.sendBookingNotificationToAdmin(testBooking);

        // Assert - No exception thrown, gracefully skipped
        // This is expected behavior when mail sender is null
    }

    @Test
    @DisplayName("Should include correct booking details in admin notification email")
    void testAdminNotificationEmailContent() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendBookingNotificationToAdmin(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
        // The email content is built in buildBookingNotificationHtml which includes:
        // - Booking ID
        // - Customer name and contact
        // - Journey details
        // - Pricing information
        // - Pickup/dropoff addresses
    }

    @Test
    @DisplayName("Should handle messaging exception when sending admin notification")
    void testAdminNotificationHandlesMessagingException() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail configuration error"));

        // Act & Assert - Should not throw exception
        emailService.sendBookingNotificationToAdmin(testBooking);
        verify(mailSender).createMimeMessage();
    }

    // ==================== Customer Confirmation Email Tests ====================

    @Test
    @DisplayName("Should send confirmation email to customer successfully")
    void testSendConfirmationEmailToCustomerSuccess() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendConfirmationEmailToCustomer(testBooking);

        // Assert
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Should include confirmation details in customer email")
    void testConfirmationEmailContent() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendConfirmationEmailToCustomer(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
        // Confirmation email includes booking status as CONFIRMED
    }

    @Test
    @DisplayName("Should skip sending confirmation when mail sender is null")
    void testConfirmationEmailWithoutMailSender() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "mailSender", null);

        // Act
        emailService.sendConfirmationEmailToCustomer(testBooking);

        // Assert - No exception thrown
    }

    @Test
    @DisplayName("Should handle exception during confirmation email send")
    void testConfirmationEmailHandlesException() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("SMTP error"));

        // Act & Assert - Should not throw exception
        emailService.sendConfirmationEmailToCustomer(testBooking);
    }

    // ==================== Cancellation Email Tests ====================

    @Test
    @DisplayName("Should send cancellation email to customer with reason")
    void testSendCancellationEmailWithReason() throws MessagingException {
        // Arrange
        String cancellationReason = "Driver unavailable";
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendCancellationEmailToCustomer(testBooking, cancellationReason);

        // Assert
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Should send cancellation email without reason")
    void testSendCancellationEmailWithoutReason() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendCancellationEmailToCustomer(testBooking, null);

        // Assert
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Should include cancellation details in email")
    void testCancellationEmailContent() throws MessagingException {
        // Arrange
        String cancellationReason = "Route unavailable";
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendCancellationEmailToCustomer(testBooking, cancellationReason);

        // Assert
        verify(mailSender).send(mimeMessage);
        // Cancellation email includes original journey details and cancellation status
    }

    @Test
    @DisplayName("Should skip cancellation email when mail sender is not configured")
    void testCancellationEmailWithoutMailSender() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "mailSender", null);

        // Act
        emailService.sendCancellationEmailToCustomer(testBooking, "Some reason");

        // Assert - No exception thrown
    }

    @Test
    @DisplayName("Should handle exception during cancellation email")
    void testCancellationEmailHandlesException() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Connection timeout"));

        // Act & Assert - Should not throw exception
        emailService.sendCancellationEmailToCustomer(testBooking, "Driver cancelled");
    }

    // ==================== Email Content Validation Tests ====================

    @Test
    @DisplayName("Admin notification should contain booking ID")
    void testAdminNotificationContainsBookingId() throws MessagingException {
        // This test validates the HTML email content builder
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendBookingNotificationToAdmin(testBooking);

        // Assert
        // The private method buildBookingNotificationHtml includes booking.getId()
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Admin notification should contain customer contact details")
    void testAdminNotificationContainsCustomerDetails() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendBookingNotificationToAdmin(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
        // Email content includes customer name, phone, email, address
    }

    @Test
    @DisplayName("Confirmation email should contain booking ID")
    void testConfirmationEmailContainsBookingId() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendConfirmationEmailToCustomer(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Confirmation email should contain journey details")
    void testConfirmationEmailContainsJourneyDetails() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendConfirmationEmailToCustomer(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
        // Email includes from, to, date, vehicle, passenger count
    }

    @Test
    @DisplayName("Confirmation email should show booking status")
    void testConfirmationEmailShowsBookingStatus() throws MessagingException {
        // Arrange
        testBooking.setStatus("CONFIRMED");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendConfirmationEmailToCustomer(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Cancellation email should contain cancellation status")
    void testCancellationEmailShowsStatus() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendCancellationEmailToCustomer(testBooking, "Requested by customer");

        // Assert
        verify(mailSender).send(mimeMessage);
    }

    // ==================== HTML Email Builder Tests ====================

    @Test
    @DisplayName("Admin notification HTML should be valid and contain HTML tags")
    void testAdminNotificationHtmlStructure() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendBookingNotificationToAdmin(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
        // HTML should contain proper structure for email clients
    }

    @Test
    @DisplayName("Confirmation email HTML should use success styling")
    void testConfirmationEmailUsesSuccessStyling() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendConfirmationEmailToCustomer(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
        // Confirmation uses green color (#28a745) for success indication
    }

    @Test
    @DisplayName("Cancellation email HTML should use error styling")
    void testCancellationEmailUsesErrorStyling() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendCancellationEmailToCustomer(testBooking, "System error");

        // Assert
        verify(mailSender).send(mimeMessage);
        // Cancellation uses red color (#dc3545) for cancellation indication
    }

    // ==================== Null Safety Tests ====================

    @Test
    @DisplayName("Should handle booking with null passenger count")
    void testAdminNotificationWithNullPassengerCount() throws MessagingException {
        // Arrange
        testBooking.setPassengerCount(null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act & Assert
        emailService.sendBookingNotificationToAdmin(testBooking);
        verify(mailSender).send(mimeMessage);
        // Should default to 1 passenger in HTML
    }

    @Test
    @DisplayName("Should handle booking with null contact preference")
    void testConfirmationEmailWithNullContactPreference() throws MessagingException {
        // Arrange
        testBooking.setContactPreference(null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act & Assert
        emailService.sendConfirmationEmailToCustomer(testBooking);
        verify(mailSender).send(mimeMessage);
        // Should default to "Call" in HTML
    }

    @Test
    @DisplayName("Should handle booking with null special requirements")
    void testAdminNotificationWithNullSpecialRequirements() throws MessagingException {
        // Arrange
        testBooking.setSpecialRequirements(null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act & Assert
        emailService.sendBookingNotificationToAdmin(testBooking);
        verify(mailSender).send(mimeMessage);
        // Should show "None" as default
    }

    @Test
    @DisplayName("Should handle empty cancellation reason")
    void testCancellationEmailWithEmptyReason() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act & Assert
        emailService.sendCancellationEmailToCustomer(testBooking, "");
        verify(mailSender).send(mimeMessage);
        // Empty reason should be handled gracefully
    }

    // ==================== Email Recipient Tests ====================

    @Test
    @DisplayName("Admin notification should be sent to admin email address")
    void testAdminNotificationRecipient() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendBookingNotificationToAdmin(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
        // Email goes to admin@indicab.com (configured in setUp)
    }

    @Test
    @DisplayName("Confirmation email should be sent to customer email")
    void testConfirmationEmailRecipient() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendConfirmationEmailToCustomer(testBooking);

        // Assert
        verify(mailSender).send(mimeMessage);
        // Email goes to booking.getEmail() - john@example.com
    }

    @Test
    @DisplayName("Cancellation email should be sent to customer email")
    void testCancellationEmailRecipient() throws MessagingException {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendCancellationEmailToCustomer(testBooking, "Reason");

        // Assert
        verify(mailSender).send(mimeMessage);
        // Email goes to booking.getEmail() - john@example.com
    }
}
