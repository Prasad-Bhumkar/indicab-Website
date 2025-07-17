# Indicab

This project is a ride-booking application consisting of a Spring Boot backend and a React frontend.

## Project Structure

```
.
├── indicab-backend
│   ├── .mvn
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── indicab
│   │   │   │           ├── config
│   │   │   │           ├── controller
│   │   │   │           │   ├── BookingController.java
│   │   │   │           │   ├── RecommendationController.java
│   │   │   │           │   ├── RouteController.java
│   │   │   │           │   └── ServiceCityController.java
│   │   │   │           ├── entity
│   │   │   │           │   ├── Booking.java
│   │   │   │           │   ├── Recommendation.java
│   │   │   │           │   ├── Route.java
│   │   │   │           │   ├── RouteId.java
│   │   │   │           │   └── ServiceCity.java
│   │   │   │           ├── repository
│   │   │   │           │   ├── BookingRepository.java
│   │   │   │           │   ├── RecommendationRepository.java
│   │   │   │           │   ├── RouteRepository.java
│   │   │   │           │   └── ServiceCityRepository.java
│   │   │   │           └── IndicabApplication.java
│   │   │   └── resources
│   │   └── test
│   ├── .classpath
│   ├── .gitattributes
│   ├── .gitignore
│   ├── .project
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
└── indicab-frontend
    ├── src
    │   ├── app
    │   ├── assets
    │   ├── components
    │   │   ├── AppSection.jsx
    │   │   ├── BookingConfirmationModal.jsx
    │   │   ├── BookingForm.jsx
    │   │   ├── BookingHistory.jsx
    │   │   ├── Header.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── PopularRoutes.jsx
    │   │   ├── Recommendations.jsx
    │   │   ├── RideTracker.jsx
    │   │   └── ServiceCities.jsx
    │   ├── features
    │   │   ├── appSection
    │   │   ├── bookingConfirmationModal
    │   │   ├── bookingHistory
    │   │   ├── mockRoutes
    │   │   ├── popularRoutes
    │   │   ├── recommendations
    │   │   └── serviceCities
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .gitignore
    ├── DEVELOPMENT_PROGRESS.md
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── vite.config.js
```

## Feature Status

This table provides a high-level overview of the project's features and their implementation status.

| Feature                   | Status      | Backend API                               | Frontend Components                                |
| ------------------------- | ----------- | ----------------------------------------- | -------------------------------------------------- |
| **User Authentication**   | Not Started | -                                         | -                                                  |
| **Ride Booking**          | Completed   | `BookingController`                       | `BookingForm`, `BookingConfirmationModal`          |
| **Booking History**       | Completed   | `BookingController`                       | `BookingHistory`                                   |
| **Ride Tracking**         | Completed   | -                                         | `RideTracker`                                      |
| **Service Cities**        | Completed   | `ServiceCityController`                   | `ServiceCities`                                    |
| **Popular Routes**        | Completed   | `RouteController`                         | `PopularRoutes`                                    |
| **Recommendations**       | Completed   | `RecommendationController`                | `Recommendations`                                  |
| **User Profile**          | Not Started | -                                         | -                                                  |
| **Payment Integration**   | Not Started | -                                         | -                                                  |
| **Driver Management**     | Not Started | -                                         | -                                                  |
| **Admin Dashboard**       | Not Started | -                                         | -                                                  |

## Planned Features

The following features are planned for future development:

*   **User Authentication:** User registration, login, and session management.
*   **User Profile:** A page for users to view and edit their profile information.
*   **Payment Integration:** Integration with a payment gateway to process ride payments.
*   **Driver Management:** A system for drivers to register, manage their vehicles, and accept ride requests.
*   **Admin Dashboard:** A dashboard for administrators to manage users, drivers, bookings, and other aspects of the application.

## Backend (`indicab-backend`)

The backend is a Spring Boot application that provides the API for the ride-booking service.

*   **`src/main/java/com/indicab/`**: The root package for the application's source code.
*   **`config/`**: Contains configuration classes for the application (e.g., security, database).
*   **`controller/`**: Contains the REST controllers that handle incoming HTTP requests.
*   **`entity/`**: Contains the JPA entity classes that map to database tables.
*   **`repository/`**: Contains the Spring Data JPA repositories for database access.
*   **`IndicabApplication.java`**: The main entry point for the Spring Boot application.
*   **`pom.xml`**: The Maven project configuration file, which defines dependencies and build settings.

## Frontend (`indicab-frontend`)

The frontend is a React application that provides the user interface for the ride-booking service.

*   **`src/`**: Contains the main source code for the React application.
*   **`src/components/`**: Contains reusable React components that make up the UI.
*   **`src/features/`**: Contains the Redux Toolkit "slices" for managing the state of different application features.
*   **`src/App.jsx`**: The main application component, which defines the layout and routing.
*   **`src/main.jsx`**: The entry point for the React application.
*   **`package.json`**: The Node.js project configuration file, which defines dependencies and scripts.
*   **`DEVELOPMENT_PROGRESS.md`**: Tracks the development status of the main features.
