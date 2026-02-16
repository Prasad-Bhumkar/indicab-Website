package com.indicab.service.impl;

import com.indicab.entity.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Service for sending email notifications
 */
@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Value("${admin.email:admin@indicab.com}")
    private String adminEmail;
    
    @Value("${mail.from:noreply@indicab.com}")
    private String fromEmail;
    
    /**
     * Send booking notification email to admin
     * Called when a new booking is created
     */
    public void sendBookingNotificationToAdmin(Booking booking) {
        if (mailSender == null) {
            logger.warn("Mail sender not configured, skipping email notification to admin");
            return;
        }
        
        logger.info("Sending booking notification email to admin: {}", adminEmail);
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject("New Booking - ID: " + booking.getId());
            
            String htmlContent = buildBookingNotificationHtml(booking);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Booking notification email sent to admin successfully");
        } catch (MessagingException e) {
            logger.error("Failed to send booking notification email to admin: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send booking confirmation email to customer
     * Called when admin confirms the booking
     */
    public void sendConfirmationEmailToCustomer(Booking booking) {
        if (mailSender == null) {
            logger.warn("Mail sender not configured, skipping confirmation email to customer");
            return;
        }
        
        logger.info("Sending confirmation email to customer: {}", booking.getEmail());
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(booking.getEmail());
            helper.setSubject("Your Booking is Confirmed - Booking ID: " + booking.getId());
            
            String htmlContent = buildConfirmationEmailHtml(booking);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Confirmation email sent to customer successfully");
        } catch (MessagingException e) {
            logger.error("Failed to send confirmation email to customer: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send booking cancellation email to customer
     * Called when admin cancels the booking
     */
    public void sendCancellationEmailToCustomer(Booking booking, String cancellationReason) {
        if (mailSender == null) {
            logger.warn("Mail sender not configured, skipping cancellation email to customer");
            return;
        }
        
        logger.info("Sending cancellation email to customer: {}", booking.getEmail());
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(booking.getEmail());
            helper.setSubject("Your Booking has been Cancelled - Booking ID: " + booking.getId());
            
            String htmlContent = buildCancellationEmailHtml(booking, cancellationReason);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Cancellation email sent to customer successfully");
        } catch (MessagingException e) {
            logger.error("Failed to send cancellation email to customer: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Build HTML content for booking notification email to admin
     */
    private String buildBookingNotificationHtml(Booking booking) {
        return "<html><body style='font-family: Arial, sans-serif; color: #333;'>" +
               "<h2 style='color: #0066cc;'>New Booking Received</h2>" +
               "<hr>" +
               "<p><strong>Booking ID:</strong> " + booking.getId() + "</p>" +
               "<p><strong>Customer Name:</strong> " + booking.getFullName() + "</p>" +
               "<p><strong>Email:</strong> " + booking.getEmail() + "</p>" +
               "<p><strong>Phone:</strong> " + booking.getPhoneNumber() + "</p>" +
               "<hr>" +
               "<h3>Journey Details</h3>" +
               "<p><strong>From:</strong> " + booking.getFrom() + "</p>" +
               "<p><strong>To:</strong> " + booking.getTo() + "</p>" +
               "<p><strong>Date:</strong> " + booking.getDate() + "</p>" +
               "<p><strong>Vehicle:</strong> " + booking.getVehicle() + "</p>" +
               "<p><strong>Passengers:</strong> " + (booking.getPassengerCount() != null ? booking.getPassengerCount() : 1) + "</p>" +
               "<hr>" +
               "<h3>Pricing</h3>" +
               "<p><strong>Estimated Fare:</strong> ₹" + String.format("%.2f", booking.getAmount()) + "</p>" +
               "<hr>" +
               "<h3>Pickup Details</h3>" +
               "<p><strong>Pickup Address:</strong> " + booking.getPickupAddress() + "</p>" +
               "<p><strong>Dropoff Address:</strong> " + booking.getDropoffAddress() + "</p>" +
               "<p><strong>Contact Preference:</strong> " + (booking.getContactPreference() != null ? booking.getContactPreference() : "Call") + "</p>" +
               "<p><strong>Special Requirements:</strong> " + (booking.getSpecialRequirements() != null ? booking.getSpecialRequirements() : "None") + "</p>" +
               "<hr>" +
               "<p style='color: #666; font-size: 12px;'>Status: PENDING CONFIRMATION</p>" +
               "<p style='color: #666; font-size: 12px;'>Please review and confirm/cancel this booking from the admin panel.</p>" +
               "</body></html>";
    }
    
    /**
     * Build HTML content for booking confirmation email to customer
     */
    private String buildConfirmationEmailHtml(Booking booking) {
        return "<html><body style='font-family: Arial, sans-serif; color: #333;'>" +
               "<h2 style='color: #28a745;'>Your Booking is Confirmed!</h2>" +
               "<p>Dear " + booking.getFullName() + ",</p>" +
               "<p>Your booking has been confirmed. Below are your booking details:</p>" +
               "<hr>" +
               "<h3>Booking Information</h3>" +
               "<p><strong>Booking ID:</strong> " + booking.getId() + "</p>" +
               "<p><strong>Status:</strong> CONFIRMED</p>" +
               "<hr>" +
               "<h3>Journey Details</h3>" +
               "<p><strong>From:</strong> " + booking.getFrom() + "</p>" +
               "<p><strong>To:</strong> " + booking.getTo() + "</p>" +
               "<p><strong>Date:</strong> " + booking.getDate() + "</p>" +
               "<p><strong>Vehicle:</strong> " + booking.getVehicle() + "</p>" +
               "<p><strong>Passengers:</strong> " + (booking.getPassengerCount() != null ? booking.getPassengerCount() : 1) + "</p>" +
               "<hr>" +
               "<h3>Pricing</h3>" +
               "<p><strong>Estimated Fare:</strong> ₹" + String.format("%.2f", booking.getAmount()) + "</p>" +
               "<hr> " +
               "<h3>Pickup Details</h3>" +
               "<p><strong>Pickup Address:</strong> " + booking.getPickupAddress() + "</p>" +
               "<p><strong>Dropoff Address:</strong> " + booking.getDropoffAddress() + "</p>" +
               "<hr>" +
               "<p style='color: #666;'>Our team will contact you shortly with further instructions. " +
               "Your preferred contact method is: <strong>" + (booking.getContactPreference() != null ? booking.getContactPreference() : "Call") + "</strong></p>" +
               "<p style='color: #666; font-size: 12px;'>Thank you for booking with Indicab!</p>" +
               "</body></html>";
    }
    
    /**
     * Build HTML content for booking cancellation email to customer
     */
    private String buildCancellationEmailHtml(Booking booking, String cancellationReason) {
        return "<html><body style='font-family: Arial, sans-serif; color: #333;'>" +
               "<h2 style='color: #dc3545;'>Your Booking has been Cancelled</h2>" +
               "<p>Dear " + booking.getFullName() + ",</p>" +
               "<p>Unfortunately, your booking has been cancelled.</p>" +
               "<hr>" +
               "<h3>Booking Information</h3>" +
               "<p><strong>Booking ID:</strong> " + booking.getId() + "</p>" +
               "<p><strong>Status:</strong> CANCELLED</p>" +
               (cancellationReason != null && !cancellationReason.isEmpty() ? 
                   "<p><strong>Reason:</strong> " + cancellationReason + "</p>" : "") +
               "<hr>" +
               "<h3>Original Journey Details</h3>" +
               "<p><strong>From:</strong> " + booking.getFrom() + "</p>" +
               "<p><strong>To:</strong> " + booking.getTo() + "</p>" +
               "<p><strong>Date:</strong> " + booking.getDate() + "</p>" +
               "<hr>" +
               "<p style='color: #666;'>If you have any questions, please contact our support team.</p>" +
               "<p style='color: #666; font-size: 12px;'>Indicab Support Team</p>" +
               "</body></html>";
    }
}
