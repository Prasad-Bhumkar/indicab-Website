package com.indicab.config;

import com.indicab.filter.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private UserDetailService userDetailService;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Configure CSRF protection: disabled for API endpoints (JWT-based), enabled for form-based endpoints
        http.csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                // Ignore CSRF for REST API endpoints (use JWT tokens instead)
                .ignoringRequestMatchers("/api/**", "/v1/**")
        )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints - public access for login, register, refresh, logout
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/v1/auth/**").permitAll()
                        // Public booking status checks
                        .requestMatchers("/api/v1/bookings/*/public").permitAll()
                        .requestMatchers("/v1/bookings/*/public").permitAll()
                        // Public GET endpoints for homepage and public pages
                        .requestMatchers(HttpMethod.GET, "/api/v1/blogs/published").permitAll()
                        .requestMatchers(HttpMethod.GET, "/v1/blogs/published").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/routes").permitAll()
                        .requestMatchers(HttpMethod.GET, "/v1/routes").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/service-cities").permitAll()
                        .requestMatchers(HttpMethod.GET, "/v1/service-cities").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/recommendations").permitAll()
                        .requestMatchers(HttpMethod.GET, "/v1/recommendations").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/vehicles").permitAll()
                        .requestMatchers(HttpMethod.GET, "/v1/vehicles").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/packages").permitAll()
                        .requestMatchers(HttpMethod.GET, "/v1/packages").permitAll()
                        // Health check endpoint for Docker
                        .requestMatchers("/actuator/health").permitAll()
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .userDetailsService(userDetailService);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow origins defined via configuration (comma-separated). If none are configured,
        // allow all origins for development convenience.
        if (allowedOrigins == null || allowedOrigins.isBlank()) {
            configuration.setAllowedOriginPatterns(List.of("*"));
        } else {
            configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        }

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
