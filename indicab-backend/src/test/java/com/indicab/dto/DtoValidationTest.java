package com.indicab.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for DTO validation constraints and Jackson serialization.
 * Uses Jakarta Bean Validation directly — no Spring context required.
 */
class DtoValidationTest {

    private static Validator validator;
    private static ObjectMapper mapper;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
        mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
    }

    // ----------------------------------------------------------------
    // Helper to assert a specific violation message exists
    // ----------------------------------------------------------------
    private <T> void assertViolationMessage(Set<ConstraintViolation<T>> violations, String expectedMessage) {
        assertTrue(
                violations.stream().anyMatch(v -> v.getMessage().equals(expectedMessage)),
                "Expected violation message \"" + expectedMessage + "\" not found. Got: " + violations
        );
    }

    // ================================================================
    // BookingRequestDTO
    // ================================================================
    @Nested
    @DisplayName("BookingRequestDTO")
    class BookingRequestDTOTests {

        private BookingRequestDTO validDto() {
            BookingRequestDTO dto = new BookingRequestDTO();
            dto.setFrom("City Center");
            dto.setTo("Airport");
            dto.setDate("2026-07-15");
            dto.setVehicle("Sedan");
            dto.setAmount(150.0);
            dto.setFullName("John Doe");
            dto.setLicense("DL-1234567890");
            dto.setPhoneNumber("9876543210");
            dto.setPickupAddress("123 Main Street, City Center");
            dto.setDropoffAddress("456 Airport Road, Terminal 2");
            dto.setEmail("john.doe@example.com");
            return dto;
        }

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(validDto());
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Blank from fails")
        void blankFrom_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setFrom("   ");
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Starting location is required");
        }

        @Test
        @DisplayName("Blank to fails")
        void blankTo_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setTo("");
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Destination location is required");
        }

        @Test
        @DisplayName("Null amount fails")
        void nullAmount_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setAmount(null);
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Amount is required");
        }

        @Test
        @DisplayName("Zero amount fails decimal-min check")
        void zeroAmount_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setAmount(0.0);
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Amount must be greater than 0");
        }

        @Test
        @DisplayName("Negative amount fails decimal-min check")
        void negativeAmount_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setAmount(-50.0);
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Amount must be greater than 0");
        }

        @Test
        @DisplayName("Blank fullName fails")
        void blankFullName_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setFullName(" ");
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Full name must be between 2 and 100 characters");
        }

        @Test
        @DisplayName("Short fullName fails size check")
        void shortFullName_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setFullName("A");
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Full name must be between 2 and 100 characters");
        }

        @Test
        @DisplayName("Invalid phone number fails pattern")
        void invalidPhone_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setPhoneNumber("12345");
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty(), "Expected violations for invalid phone number");
        }

        @Test
        @DisplayName("Blank email fails")
        void blankEmail_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setEmail("");
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Email is required");
        }

        @Test
        @DisplayName("Invalid email format fails")
        void invalidEmail_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setEmail("not-an-email");
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Email should be valid");
        }

        @Test
        @DisplayName("Short pickup address fails")
        void shortPickupAddress_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setPickupAddress("AB");  // less than 5
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Pickup address must be between 5 and 255 characters");
        }

        @Test
        @DisplayName("Short dropoff address fails")
        void shortDropoffAddress_shouldFail() {
            BookingRequestDTO dto = validDto();
            dto.setDropoffAddress("AB");
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Dropoff address must be between 5 and 255 characters");
        }

        @Test
        @DisplayName("All blank fields triggers multiple violations")
        void allBlank_shouldHaveMultipleViolations() {
            Set<ConstraintViolation<BookingRequestDTO>> violations = validator.validate(new BookingRequestDTO());
            assertEquals(11, violations.size(),
                    "Expected violations for all 11 @NotBlank/@NotNull fields");
        }

        @Test
        @DisplayName("Jackson serialization and deserialization")
        void jacksonRoundTrip() throws Exception {
            BookingRequestDTO dto = validDto();
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"from\":\"City Center\""), json);
            assertTrue(json.contains("\"amount\":150.0"), json);
            assertTrue(json.contains("\"email\":\"john.doe@example.com\""), json);

            BookingRequestDTO deserialized = mapper.readValue(json, BookingRequestDTO.class);
            assertEquals(dto.getFrom(), deserialized.getFrom());
            assertEquals(dto.getTo(), deserialized.getTo());
            assertEquals(dto.getAmount(), deserialized.getAmount());
            assertEquals(dto.getEmail(), deserialized.getEmail());
            assertEquals(dto.getFullName(), deserialized.getFullName());
        }
    }

    // ================================================================
    // UserRegistrationDTO
    // ================================================================
    @Nested
    @DisplayName("UserRegistrationDTO")
    class UserRegistrationDTOTests {

        private UserRegistrationDTO validDto() {
            UserRegistrationDTO dto = new UserRegistrationDTO();
            dto.setName("John Doe");
            dto.setEmail("john@example.com");
            dto.setPassword("secret123");
            dto.setPhone("+919876543210");
            dto.setAddress("123 Main Street, Mumbai");
            return dto;
        }

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            Set<ConstraintViolation<UserRegistrationDTO>> violations = validator.validate(validDto());
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Blank name fails")
        void blankName_shouldFail() {
            UserRegistrationDTO dto = validDto();
            dto.setName("");
            Set<ConstraintViolation<UserRegistrationDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Name is required");
        }

        @Test
        @DisplayName("Blank email fails")
        void blankEmail_shouldFail() {
            UserRegistrationDTO dto = validDto();
            dto.setEmail("   ");
            Set<ConstraintViolation<UserRegistrationDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("Invalid email fails")
        void invalidEmail_shouldFail() {
            UserRegistrationDTO dto = validDto();
            dto.setEmail("bad-email");
            Set<ConstraintViolation<UserRegistrationDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Email should be valid");
        }

        @Test
        @DisplayName("Short password fails")
        void shortPassword_shouldFail() {
            UserRegistrationDTO dto = validDto();
            dto.setPassword("abc12");
            Set<ConstraintViolation<UserRegistrationDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Password must be between 6 and 50 characters");
        }

        @Test
        @DisplayName("Invalid phone format fails")
        void invalidPhone_shouldFail() {
            UserRegistrationDTO dto = validDto();
            dto.setPhone("0abc");  // starts with 0 (fails [1-9]) and contains letters
            Set<ConstraintViolation<UserRegistrationDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Phone number format is invalid");
        }

        @Test
        @DisplayName("Jackson round-trip")
        void jacksonRoundTrip() throws Exception {
            UserRegistrationDTO dto = validDto();
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"name\":\"John Doe\""));
            assertTrue(json.contains("\"email\":\"john@example.com\""));

            UserRegistrationDTO deserialized = mapper.readValue(json, UserRegistrationDTO.class);
            assertEquals(dto.getName(), deserialized.getName());
            assertEquals(dto.getEmail(), deserialized.getEmail());
        }
    }

    // ================================================================
    // LoginRequestDTO
    // ================================================================
    @Nested
    @DisplayName("LoginRequestDTO")
    class LoginRequestDTOTests {

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            LoginRequestDTO dto = new LoginRequestDTO("user@example.com", "password123");
            Set<ConstraintViolation<LoginRequestDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Blank email fails")
        void blankEmail_shouldFail() {
            LoginRequestDTO dto = new LoginRequestDTO("", "password123");
            Set<ConstraintViolation<LoginRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Email is required");
        }

        @Test
        @DisplayName("Invalid email fails")
        void invalidEmail_shouldFail() {
            LoginRequestDTO dto = new LoginRequestDTO("bad", "password123");
            Set<ConstraintViolation<LoginRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Email should be valid");
        }

        @Test
        @DisplayName("Blank password fails")
        void blankPassword_shouldFail() {
            LoginRequestDTO dto = new LoginRequestDTO("user@example.com", "");
            Set<ConstraintViolation<LoginRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Password is required");
        }

        @Test
        @DisplayName("Short password fails size check")
        void shortPassword_shouldFail() {
            LoginRequestDTO dto = new LoginRequestDTO("user@example.com", "abc12");
            Set<ConstraintViolation<LoginRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Password must be at least 6 characters long");
        }

        @Test
        @DisplayName("Jackson serialization preserves fields")
        void jacksonSerialization() throws Exception {
            LoginRequestDTO dto = new LoginRequestDTO("test@test.com", "mypassword");
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"email\":\"test@test.com\""));
            assertTrue(json.contains("\"password\":\"mypassword\""));

            LoginRequestDTO deserialized = mapper.readValue(json, LoginRequestDTO.class);
            assertEquals(dto.getEmail(), deserialized.getEmail());
            assertEquals(dto.getPassword(), deserialized.getPassword());
        }

        @Test
        @DisplayName("Setters work correctly")
        void settersAndGetters() {
            LoginRequestDTO dto = new LoginRequestDTO();
            dto.setEmail("a@b.com");
            dto.setPassword("pass123");
            assertEquals("a@b.com", dto.getEmail());
            assertEquals("pass123", dto.getPassword());
        }
    }

    // ================================================================
    // DriverRegistrationDTO
    // ================================================================
    @Nested
    @DisplayName("DriverRegistrationDTO")
    class DriverRegistrationDTOTests {

        private DriverRegistrationDTO validDto() {
            DriverRegistrationDTO dto = new DriverRegistrationDTO();
            dto.setLicenseNumber("DL-12345678");
            dto.setVehicleType("Sedan");
            dto.setVehicleNumber("MH-01-AB-1234");
            dto.setPhoneNumber("9876543210");
            dto.setAddress("123 Driver Lane, Pune, Maharashtra");
            return dto;
        }

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            Set<ConstraintViolation<DriverRegistrationDTO>> violations = validator.validate(validDto());
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Blank licenseNumber fails")
        void blankLicense_shouldFail() {
            DriverRegistrationDTO dto = validDto();
            dto.setLicenseNumber("");
            Set<ConstraintViolation<DriverRegistrationDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "License number is required");
        }

        @Test
        @DisplayName("Short licenseNumber fails size check")
        void shortLicense_shouldFail() {
            DriverRegistrationDTO dto = validDto();
            dto.setLicenseNumber("AB");
            Set<ConstraintViolation<DriverRegistrationDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "License number must be between 5 and 50 characters");
        }

        @Test
        @DisplayName("Blank vehicleType fails")
        void blankVehicleType_shouldFail() {
            DriverRegistrationDTO dto = validDto();
            dto.setVehicleType("");
            Set<ConstraintViolation<DriverRegistrationDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Vehicle type is required");
        }

        @Test
        @DisplayName("Invalid phone fails pattern")
        void invalidPhone_shouldFail() {
            DriverRegistrationDTO dto = validDto();
            dto.setPhoneNumber("1111111111");
            Set<ConstraintViolation<DriverRegistrationDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty(), "Expected violations for invalid Indian phone number");
        }

        @Test
        @DisplayName("Short address fails")
        void shortAddress_shouldFail() {
            DriverRegistrationDTO dto = validDto();
            dto.setAddress("Too short");
            Set<ConstraintViolation<DriverRegistrationDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Address must be between 10 and 255 characters");
        }

        @Test
        @DisplayName("Jackson round-trip")
        void jacksonRoundTrip() throws Exception {
            DriverRegistrationDTO dto = validDto();
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"licenseNumber\":\"DL-12345678\""));
            assertTrue(json.contains("\"vehicleType\":\"Sedan\""));

            DriverRegistrationDTO deserialized = mapper.readValue(json, DriverRegistrationDTO.class);
            assertEquals(dto.getLicenseNumber(), deserialized.getLicenseNumber());
        }
    }

    // ================================================================
    // RatingRequestDTO
    // ================================================================
    @Nested
    @DisplayName("RatingRequestDTO")
    class RatingRequestDTOTests {

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            RatingRequestDTO dto = new RatingRequestDTO(1L, 4, "Great ride!", "Driver Name");
            Set<ConstraintViolation<RatingRequestDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Null bookingId fails")
        void nullBookingId_shouldFail() {
            RatingRequestDTO dto = new RatingRequestDTO(null, 4, "Good", "Driver");
            Set<ConstraintViolation<RatingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Booking ID is required");
        }

        @Test
        @DisplayName("Null rating fails")
        void nullRating_shouldFail() {
            RatingRequestDTO dto = new RatingRequestDTO(1L, null, "Good", "Driver");
            Set<ConstraintViolation<RatingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Rating is required");
        }

        @Test
        @DisplayName("Rating too low fails min check")
        void ratingTooLow_shouldFail() {
            RatingRequestDTO dto = new RatingRequestDTO(1L, 0, "Bad", "Driver");
            Set<ConstraintViolation<RatingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Rating must be between 1 and 5");
        }

        @Test
        @DisplayName("Rating too high fails max check")
        void ratingTooHigh_shouldFail() {
            RatingRequestDTO dto = new RatingRequestDTO(1L, 6, "Excellent!", "Driver");
            Set<ConstraintViolation<RatingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Rating must be between 1 and 5");
        }

        @Test
        @DisplayName("Overly long review fails")
        void longReview_shouldFail() {
            String longReview = "a".repeat(501);
            RatingRequestDTO dto = new RatingRequestDTO(1L, 3, longReview, "Driver");
            Set<ConstraintViolation<RatingRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Review cannot exceed 500 characters");
        }

        @Test
        @DisplayName("Setters and getters are consistent")
        void settersAndGetters() {
            RatingRequestDTO dto = new RatingRequestDTO();
            dto.setBookingId(99L);
            dto.setRating(5);
            dto.setReview("Perfect");
            dto.setDriverName("Best Driver");

            assertEquals(99L, dto.getBookingId());
            assertEquals(5, dto.getRating());
            assertEquals("Perfect", dto.getReview());
            assertEquals("Best Driver", dto.getDriverName());
        }

        @Test
        @DisplayName("Jackson serialization")
        void jacksonSerialization() throws Exception {
            RatingRequestDTO dto = new RatingRequestDTO(1L, 4, "Good ride", "Raj");
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"bookingId\":1"));
            assertTrue(json.contains("\"rating\":4"));

            RatingRequestDTO deserialized = mapper.readValue(json, RatingRequestDTO.class);
            assertEquals(Long.valueOf(1L), deserialized.getBookingId());
            assertEquals(Integer.valueOf(4), deserialized.getRating());
        }
    }

    // ================================================================
    // BlogDTO
    // ================================================================
    @Nested
    @DisplayName("BlogDTO")
    class BlogDTOTests {

        private BlogDTO validDto() {
            return new BlogDTO(null, "10 Tips for Safe Rides", 
                    "This is the content of the blog post. It must be at least 20 characters long.",
                    "Admin User", null, "DRAFT");
        }

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            Set<ConstraintViolation<BlogDTO>> violations = validator.validate(validDto());
            assertTrue(violations.isEmpty(), "Violations: " + violations);
        }

        @Test
        @DisplayName("Blank title fails")
        void blankTitle_shouldFail() {
            BlogDTO dto = validDto();
            dto.setTitle("");
            Set<ConstraintViolation<BlogDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Blog title is required");
        }

        @Test
        @DisplayName("Short title fails size check")
        void shortTitle_shouldFail() {
            BlogDTO dto = validDto();
            dto.setTitle("Hi");
            Set<ConstraintViolation<BlogDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Title must be between 5 and 255 characters");
        }

        @Test
        @DisplayName("Blank content fails")
        void blankContent_shouldFail() {
            BlogDTO dto = validDto();
            dto.setContent("");
            Set<ConstraintViolation<BlogDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Blog content is required");
        }

        @Test
        @DisplayName("Short content fails size check")
        void shortContent_shouldFail() {
            BlogDTO dto = validDto();
            dto.setContent("Too short");
            Set<ConstraintViolation<BlogDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Content must be at least 20 characters");
        }

        @Test
        @DisplayName("Blank author fails")
        void blankAuthor_shouldFail() {
            BlogDTO dto = validDto();
            dto.setAuthor("  ");
            Set<ConstraintViolation<BlogDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("Invalid status fails pattern")
        void invalidStatus_shouldFail() {
            BlogDTO dto = validDto();
            dto.setStatus("ARCHIVED");
            Set<ConstraintViolation<BlogDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Status must be either DRAFT or PUBLISHED");
        }

        @Test
        @DisplayName("PublishedAt setters/getters are correct")
        void publishedAtSettersAndGetters() {
            BlogDTO dto = validDto();
            LocalDateTime now = LocalDateTime.now();
            dto.setPublishedAt(now);
            assertEquals(now, dto.getPublishedAt());

            dto.setCreatedAt(now.minusDays(1));
            assertEquals(now.minusDays(1), dto.getCreatedAt());

            dto.setUpdatedAt(now);
            assertEquals(now, dto.getUpdatedAt());
        }

        @Test
        @DisplayName("Jackson serialization")
        void jacksonSerialization() throws Exception {
            BlogDTO dto = validDto();
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"title\":\"10 Tips for Safe Rides\""));
            assertTrue(json.contains("\"status\":\"DRAFT\""));

            BlogDTO deserialized = mapper.readValue(json, BlogDTO.class);
            assertEquals(dto.getTitle(), deserialized.getTitle());
            assertEquals(dto.getContent(), deserialized.getContent());
            assertEquals(dto.getStatus(), deserialized.getStatus());
        }
    }

    // ================================================================
    // VehicleDTO
    // ================================================================
    @Nested
    @DisplayName("VehicleDTO")
    class VehicleDTOTests {

        private VehicleDTO validDto() {
            return new VehicleDTO(null, "Toyota Etios", "Sedan", 4, 1.0,
                    "https://example.com/car.jpg", true);
        }

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(validDto());
            assertTrue(violations.isEmpty(), "Violations: " + violations);
        }

        @Test
        @DisplayName("Blank name fails")
        void blankName_shouldFail() {
            VehicleDTO dto = validDto();
            dto.setName("");
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Vehicle name is required");
        }

        @Test
        @DisplayName("Blank type fails")
        void blankType_shouldFail() {
            VehicleDTO dto = validDto();
            dto.setType("");
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Vehicle type is required");
        }

        @Test
        @DisplayName("Null seatCapacity fails")
        void nullSeatCapacity_shouldFail() {
            VehicleDTO dto = validDto();
            dto.setSeatCapacity(null);
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Seat capacity is required");
        }

        @Test
        @DisplayName("Seat capacity below min fails")
        void seatCapacityTooLow_shouldFail() {
            VehicleDTO dto = validDto();
            dto.setSeatCapacity(0);
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Seat capacity must be at least 1");
        }

        @Test
        @DisplayName("Seat capacity above max fails")
        void seatCapacityTooHigh_shouldFail() {
            VehicleDTO dto = validDto();
            dto.setSeatCapacity(11);
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Seat capacity cannot exceed 10");
        }

        @Test
        @DisplayName("Null priceMultiplier fails")
        void nullPriceMultiplier_shouldFail() {
            VehicleDTO dto = validDto();
            dto.setPriceMultiplier(null);
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Price multiplier is required");
        }

        @Test
        @DisplayName("Price multiplier too low fails")
        void priceMultiplierTooLow_shouldFail() {
            VehicleDTO dto = validDto();
            dto.setPriceMultiplier(0.05);
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Price multiplier must be at least 0.1");
        }

        @Test
        @DisplayName("Null isActive fails")
        void nullIsActive_shouldFail() {
            VehicleDTO dto = validDto();
            dto.setIsActive(null);
            Set<ConstraintViolation<VehicleDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Active status is required");
        }

        @Test
        @DisplayName("Jackson round-trip")
        void jacksonRoundTrip() throws Exception {
            VehicleDTO dto = validDto();
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"name\":\"Toyota Etios\""));
            assertTrue(json.contains("\"seatCapacity\":4"));

            VehicleDTO deserialized = mapper.readValue(json, VehicleDTO.class);
            assertEquals(dto.getName(), deserialized.getName());
            assertEquals(dto.getSeatCapacity(), deserialized.getSeatCapacity());
            assertEquals(dto.getPriceMultiplier(), deserialized.getPriceMultiplier());
            assertEquals(dto.getIsActive(), deserialized.getIsActive());
        }
    }

    // ================================================================
    // PackageDTO
    // ================================================================
    @Nested
    @DisplayName("PackageDTO")
    class PackageDTOTests {

        private PackageDTO validDto() {
            return new PackageDTO("Weekend Getaway", "A perfect weekend package",
                    "regional", new BigDecimal("500.00"), "2 Days", "1 Month",
                    BigDecimal.ZERO, "AC,Music", null, true);
        }

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            Set<ConstraintViolation<PackageDTO>> violations = validator.validate(validDto());
            assertTrue(violations.isEmpty(), "Violations: " + violations);
        }

        @Test
        @DisplayName("Blank name fails")
        void blankName_shouldFail() {
            PackageDTO dto = validDto();
            dto.setName("");
            Set<ConstraintViolation<PackageDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Package name is required");
        }

        @Test
        @DisplayName("Short name fails size check")
        void shortName_shouldFail() {
            PackageDTO dto = validDto();
            dto.setName("AB");
            Set<ConstraintViolation<PackageDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Package name must be between 3 and 255 characters");
        }

        @Test
        @DisplayName("Blank type fails")
        void blankType_shouldFail() {
            PackageDTO dto = validDto();
            dto.setType("");
            Set<ConstraintViolation<PackageDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Package type is required");
        }

        @Test
        @DisplayName("Null baseFare fails")
        void nullBaseFare_shouldFail() {
            PackageDTO dto = validDto();
            dto.setBaseFare(null);
            Set<ConstraintViolation<PackageDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Base fare is required");
        }

        @Test
        @DisplayName("Zero baseFare fails decimal-min check")
        void zeroBaseFare_shouldFail() {
            PackageDTO dto = validDto();
            dto.setBaseFare(BigDecimal.ZERO);
            Set<ConstraintViolation<PackageDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Base fare must be greater than 0");
        }

        @Test
        @DisplayName("Negative discount fails")
        void negativeDiscount_shouldFail() {
            PackageDTO dto = validDto();
            dto.setDiscountPercentage(new BigDecimal("-5"));
            Set<ConstraintViolation<PackageDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Discount percentage must be non-negative");
        }

        @Test
        @DisplayName("Description exceeding max length fails")
        void descriptionTooLong_shouldFail() {
            PackageDTO dto = validDto();
            dto.setDescription("a".repeat(5001));
            Set<ConstraintViolation<PackageDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Description must not exceed 5000 characters");
        }

        @Test
        @DisplayName("Jackson round-trip")
        void jacksonRoundTrip() throws Exception {
            PackageDTO dto = validDto();
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"name\":\"Weekend Getaway\""));
            assertTrue(json.contains("\"type\":\"regional\""));

            PackageDTO deserialized = mapper.readValue(json, PackageDTO.class);
            assertEquals(dto.getName(), deserialized.getName());
            assertEquals(dto.getType(), deserialized.getType());
            assertEquals(dto.getBaseFare(), deserialized.getBaseFare());
        }
    }

    // ================================================================
    // CityDTO
    // ================================================================
    @Nested
    @DisplayName("CityDTO")
    class CityDTOTests {

        private CityDTO validDto() {
            return new CityDTO(null, "Mumbai", 19.0760, 72.8777, true);
        }

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            Set<ConstraintViolation<CityDTO>> violations = validator.validate(validDto());
            assertTrue(violations.isEmpty(), "Violations: " + violations);
        }

        @Test
        @DisplayName("Blank name fails")
        void blankName_shouldFail() {
            CityDTO dto = validDto();
            dto.setName("");
            Set<ConstraintViolation<CityDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "City name is required");
        }

        @Test
        @DisplayName("Short name fails")
        void shortName_shouldFail() {
            CityDTO dto = validDto();
            dto.setName("A");
            Set<ConstraintViolation<CityDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "City name must be between 2 and 100 characters");
        }

        @Test
        @DisplayName("Invalid latitude too low fails")
        void latitudeTooLow_shouldFail() {
            CityDTO dto = validDto();
            dto.setLatitude(-91.0);
            Set<ConstraintViolation<CityDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Latitude must be between -90 and 90");
        }

        @Test
        @DisplayName("Invalid latitude too high fails")
        void latitudeTooHigh_shouldFail() {
            CityDTO dto = validDto();
            dto.setLatitude(91.0);
            Set<ConstraintViolation<CityDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Latitude must be between -90 and 90");
        }

        @Test
        @DisplayName("Invalid longitude too low fails")
        void longitudeTooLow_shouldFail() {
            CityDTO dto = validDto();
            dto.setLongitude(-181.0);
            Set<ConstraintViolation<CityDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Longitude must be between -180 and 180");
        }

        @Test
        @DisplayName("Invalid longitude too high fails")
        void longitudeTooHigh_shouldFail() {
            CityDTO dto = validDto();
            dto.setLongitude(181.0);
            Set<ConstraintViolation<CityDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Longitude must be between -180 and 180");
        }

        @Test
        @DisplayName("Null isActive fails")
        void nullIsActive_shouldFail() {
            CityDTO dto = validDto();
            dto.setIsActive(null);
            Set<ConstraintViolation<CityDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Active status is required");
        }

        @Test
        @DisplayName("Jackson round-trip")
        void jacksonRoundTrip() throws Exception {
            CityDTO dto = validDto();
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"name\":\"Mumbai\""));
            assertTrue(json.contains("\"latitude\":19.076"));

            CityDTO deserialized = mapper.readValue(json, CityDTO.class);
            assertEquals(dto.getName(), deserialized.getName());
            assertEquals(dto.getLatitude(), deserialized.getLatitude());
            assertEquals(dto.getLongitude(), deserialized.getLongitude());
            assertEquals(dto.getIsActive(), deserialized.getIsActive());
        }
    }

    // ================================================================
    // DriverApprovalDTO
    // ================================================================
    @Nested
    @DisplayName("DriverApprovalDTO")
    class DriverApprovalDTOTests {

        @Test
        @DisplayName("Valid APPROVED DTO passes")
        void validApproved_shouldPass() {
            DriverApprovalDTO dto = new DriverApprovalDTO();
            dto.setDriverId(1L);
            dto.setStatus("APPROVED");
            Set<ConstraintViolation<DriverApprovalDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Valid REJECTED DTO passes")
        void validRejected_shouldPass() {
            DriverApprovalDTO dto = new DriverApprovalDTO();
            dto.setDriverId(1L);
            dto.setStatus("REJECTED");
            dto.setRejectionReason("Insufficient documents");
            Set<ConstraintViolation<DriverApprovalDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Null driverId fails")
        void nullDriverId_shouldFail() {
            DriverApprovalDTO dto = new DriverApprovalDTO();
            dto.setStatus("APPROVED");
            Set<ConstraintViolation<DriverApprovalDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Driver ID is required");
        }

        @Test
        @DisplayName("Blank status fails")
        void blankStatus_shouldFail() {
            DriverApprovalDTO dto = new DriverApprovalDTO();
            dto.setDriverId(1L);
            dto.setStatus("");
            Set<ConstraintViolation<DriverApprovalDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Status is required");
        }

        @Test
        @DisplayName("Invalid status value fails")
        void invalidStatus_shouldFail() {
            DriverApprovalDTO dto = new DriverApprovalDTO();
            dto.setDriverId(1L);
            dto.setStatus("PENDING");
            Set<ConstraintViolation<DriverApprovalDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Status must be either APPROVED or REJECTED");
        }

        @Test
        @DisplayName("Rejection reason over max length fails")
        void rejectionReasonTooLong_shouldFail() {
            DriverApprovalDTO dto = new DriverApprovalDTO();
            dto.setDriverId(1L);
            dto.setStatus("REJECTED");
            dto.setRejectionReason("a".repeat(501));
            Set<ConstraintViolation<DriverApprovalDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Reason must not exceed 500 characters");
        }

        @Test
        @DisplayName("Jackson round-trip")
        void jacksonRoundTrip() throws Exception {
            DriverApprovalDTO dto = new DriverApprovalDTO();
            dto.setDriverId(42L);
            dto.setStatus("APPROVED");
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"driverId\":42"));
            assertTrue(json.contains("\"status\":\"APPROVED\""));

            DriverApprovalDTO deserialized = mapper.readValue(json, DriverApprovalDTO.class);
            assertEquals(Long.valueOf(42L), deserialized.getDriverId());
            assertEquals("APPROVED", deserialized.getStatus());
        }
    }

    // ================================================================
    // RouteDTO
    // ================================================================
    @Nested
    @DisplayName("RouteDTO")
    class RouteDTOTests {

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            RouteDTO dto = new RouteDTO(null, "Mumbai", "Pune", 150.0, 1200.0, true);
            Set<ConstraintViolation<RouteDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty(), "Violations: " + violations);
        }

        @Test
        @DisplayName("Blank fromCity fails")
        void blankFromCity_shouldFail() {
            RouteDTO dto = new RouteDTO(null, "", "Pune", 150.0, 1200.0, true);
            Set<ConstraintViolation<RouteDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "From city is required");
        }

        @Test
        @DisplayName("Blank toCity fails")
        void blankToCity_shouldFail() {
            RouteDTO dto = new RouteDTO(null, "Mumbai", "", 150.0, 1200.0, true);
            Set<ConstraintViolation<RouteDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "To city is required");
        }

        @Test
        @DisplayName("Null distance fails")
        void nullDistance_shouldFail() {
            RouteDTO dto = new RouteDTO(null, "Mumbai", "Pune", null, 1200.0, true);
            Set<ConstraintViolation<RouteDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Distance is required");
        }

        @Test
        @DisplayName("Zero distance fails decimal-min")
        void zeroDistance_shouldFail() {
            RouteDTO dto = new RouteDTO(null, "Mumbai", "Pune", 0.0, 1200.0, true);
            Set<ConstraintViolation<RouteDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("Null fixedPrice fails")
        void nullFixedPrice_shouldFail() {
            RouteDTO dto = new RouteDTO(null, "Mumbai", "Pune", 150.0, null, true);
            Set<ConstraintViolation<RouteDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Fixed price is required");
        }

        @Test
        @DisplayName("Null isPopular fails")
        void nullIsPopular_shouldFail() {
            RouteDTO dto = new RouteDTO(null, "Mumbai", "Pune", 150.0, 1200.0, null);
            Set<ConstraintViolation<RouteDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Is popular field is required");
        }

        @Test
        @DisplayName("Jackson round-trip")
        void jacksonRoundTrip() throws Exception {
            RouteDTO dto = new RouteDTO(null, "Delhi", "Agra", 233.0, 2500.0, true);
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"fromCity\":\"Delhi\""));
            assertTrue(json.contains("\"fixedPrice\":2500.0"));

            RouteDTO deserialized = mapper.readValue(json, RouteDTO.class);
            assertEquals(dto.getFromCity(), deserialized.getFromCity());
            assertEquals(dto.getDistance(), deserialized.getDistance());
            assertEquals(dto.getFixedPrice(), deserialized.getFixedPrice());
            assertEquals(dto.getIsPopular(), deserialized.getIsPopular());
        }
    }

    // ================================================================
    // RefreshTokenRequestDTO
    // ================================================================
    @Nested
    @DisplayName("RefreshTokenRequestDTO")
    class RefreshTokenRequestDTOTests {

        @Test
        @DisplayName("Valid DTO passes validation")
        void validDto_shouldPass() {
            RefreshTokenRequestDTO dto = new RefreshTokenRequestDTO("some-valid-refresh-token-value");
            Set<ConstraintViolation<RefreshTokenRequestDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Blank refreshToken fails")
        void blankRefreshToken_shouldFail() {
            RefreshTokenRequestDTO dto = new RefreshTokenRequestDTO("");
            Set<ConstraintViolation<RefreshTokenRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Refresh token is required");
        }

        @Test
        @DisplayName("Null refreshToken fails (setter path)")
        void nullRefreshToken_shouldFail() {
            RefreshTokenRequestDTO dto = new RefreshTokenRequestDTO();
            dto.setRefreshToken(null);
            Set<ConstraintViolation<RefreshTokenRequestDTO>> violations = validator.validate(dto);
            assertViolationMessage(violations, "Refresh token is required");
        }

        @Test
        @DisplayName("Jackson round-trip")
        void jacksonRoundTrip() throws Exception {
            RefreshTokenRequestDTO dto = new RefreshTokenRequestDTO("my-refresh-token-abc123");
            String json = mapper.writeValueAsString(dto);
            assertTrue(json.contains("\"refreshToken\":\"my-refresh-token-abc123\""));

            RefreshTokenRequestDTO deserialized = mapper.readValue(json, RefreshTokenRequestDTO.class);
            assertEquals(dto.getRefreshToken(), deserialized.getRefreshToken());
        }
    }
}
