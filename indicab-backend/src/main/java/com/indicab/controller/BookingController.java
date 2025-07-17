package com.indicab.controller;

import com.indicab.entity.Booking;
import com.indicab.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {


    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        return booking.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        Optional<Booking> optionalBooking = bookingRepository.findById(id);
        if (!optionalBooking.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Booking booking = optionalBooking.get();
        booking.setFrom(bookingDetails.getFrom());
        booking.setTo(bookingDetails.getTo());
        booking.setDate(bookingDetails.getDate());
        booking.setVehicle(bookingDetails.getVehicle());
        booking.setAmount(bookingDetails.getAmount());
        booking.setFullName(bookingDetails.getFullName());
        booking.setLicense(bookingDetails.getLicense());
        booking.setName(bookingDetails.getName());
        booking.setPaymentMethod(bookingDetails.getPaymentMethod());
        booking.setPhone(bookingDetails.getPhone());
        booking.setPhoneNumber(bookingDetails.getPhoneNumber());
        booking.setPickupAddress(bookingDetails.getPickupAddress());
        booking.setStatus(bookingDetails.getStatus());

        Booking updatedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(updatedBooking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
