package com.indicab.filter;

import com.indicab.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtRequestFilter Tests")
class JwtRequestFilterTest {

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private JwtRequestFilter filter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain chain;

    private static final String VALID_TOKEN = "valid.jwt.token";
    private static final String USERNAME = "testuser@example.com";
    private static final String PASSWORD = "password";
    private static final String ROLE_USER = "ROLE_USER";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        chain = mock(FilterChain.class);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should authenticate with valid JWT and set SecurityContext")
    void testValidJwtSetsAuthentication() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        UserDetails userDetails = new User(USERNAME, PASSWORD,
                Collections.singletonList(new SimpleGrantedAuthority(ROLE_USER)));

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn(USERNAME);
        when(userDetailsService.loadUserByUsername(USERNAME)).thenReturn(userDetails);
        when(jwtUtil.validateToken(VALID_TOKEN, userDetails)).thenReturn(true);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isEqualTo(userDetails);
        assertThat(auth.getAuthorities())
                .extracting("authority")
                .contains(ROLE_USER);
    }

    @Test
    @DisplayName("Should authenticate with valid JWT for admin user")
    void testValidJwtAdminAuthentication() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        UserDetails adminDetails = new User(USERNAME, PASSWORD,
                Collections.singletonList(new SimpleGrantedAuthority(ROLE_ADMIN)));

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn(USERNAME);
        when(userDetailsService.loadUserByUsername(USERNAME)).thenReturn(adminDetails);
        when(jwtUtil.validateToken(VALID_TOKEN, adminDetails)).thenReturn(true);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getAuthorities())
                .extracting("authority")
                .contains(ROLE_ADMIN);
    }

    @Test
    @DisplayName("Should do nothing when no Authorization header is present")
    void testNoAuthorizationHeader() throws Exception {
        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtUtil, userDetailsService);
    }

    @Test
    @DisplayName("Should do nothing when Authorization header is empty")
    void testEmptyAuthorizationHeader() throws Exception {
        request.addHeader("Authorization", "");

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtUtil, userDetailsService);
    }

    @Test
    @DisplayName("Should do nothing when Authorization header does not start with Bearer")
    void testNonBearerAuthorizationHeader() throws Exception {
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtUtil, userDetailsService);
    }

    @Test
    @DisplayName("Should do nothing when token extraction returns null username")
    void testNullUsernameFromToken() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn(null);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(userDetailsService);
    }

    @Test
    @DisplayName("Should not set authentication when SecurityContext already has auth")
    void testAlreadyAuthenticated() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        UserDetails existingAuth = new User(USERNAME, PASSWORD,
                Collections.singletonList(new SimpleGrantedAuthority(ROLE_USER)));
        SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        existingAuth, null, existingAuth.getAuthorities()));

        // Even though token is valid, should skip because already authenticated
        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn(USERNAME);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        // Should not try to load user details since already authenticated
        verifyNoInteractions(userDetailsService);
    }

    @Test
    @DisplayName("Should not set authentication when token is invalid")
    void testInvalidToken() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        UserDetails userDetails = new User(USERNAME, PASSWORD,
                Collections.singletonList(new SimpleGrantedAuthority(ROLE_USER)));

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn(USERNAME);
        when(userDetailsService.loadUserByUsername(USERNAME)).thenReturn(userDetails);
        when(jwtUtil.validateToken(VALID_TOKEN, userDetails)).thenReturn(false);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should handle malformed token gracefully")
    void testMalformedToken() throws Exception {
        request.addHeader("Authorization", "Bearer invalid-token");

        when(jwtUtil.getUsernameFromToken("invalid-token")).thenThrow(new RuntimeException("Malformed JWT"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> filter.doFilterInternal(request, response, chain));
        assertThat(ex.getMessage()).isEqualTo("Malformed JWT");

        verify(chain, never()).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should handle userDetailsService throwing exception")
    void testUserDetailsServiceException() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn(USERNAME);
        when(userDetailsService.loadUserByUsername(USERNAME)).thenThrow(new RuntimeException("User not found"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> filter.doFilterInternal(request, response, chain));
        assertThat(ex.getMessage()).isEqualTo("User not found");

        verify(chain, never()).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should handle token with empty subject claim")
    void testEmptySubjectInToken() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn("");

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);

        // username is "" (not null), so filter calls loadUserByUsername("")
        verify(userDetailsService).loadUserByUsername("");
        // But authentication should still be null (no security context set for empty username)
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should set WebAuthenticationDetails on the token")
    void testWebAuthenticationDetailsSet() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);
        request.setRemoteAddr("10.0.0.1");
        request.setServerName("example.com");

        UserDetails userDetails = new User(USERNAME, PASSWORD,
                Collections.singletonList(new SimpleGrantedAuthority(ROLE_USER)));

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn(USERNAME);
        when(userDetailsService.loadUserByUsername(USERNAME)).thenReturn(userDetails);
        when(jwtUtil.validateToken(VALID_TOKEN, userDetails)).thenReturn(true);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth.getDetails()).isNotNull();
    }

    @Test
    @DisplayName("Should propagate exception when token parsing fails")
    void testTokenParsingExceptionPropagates() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenThrow(new RuntimeException("Unexpected error"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> filter.doFilterInternal(request, response, chain));
        assertThat(ex.getMessage()).isEqualTo("Unexpected error");

        verify(chain, never()).doFilter(request, response);
    }

    @Test
    @DisplayName("Should not set security context for invalid token even with existing auth")
    void testInvalidTokenWithExistingAuthLeavesOriginalAuth() throws Exception {
        request.addHeader("Authorization", "Bearer " + VALID_TOKEN);

        UserDetails originalPrincipal = new User("original@test.com", PASSWORD,
                Collections.singletonList(new SimpleGrantedAuthority(ROLE_USER)));
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken originalAuth =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        originalPrincipal, null, originalPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(originalAuth);

        when(jwtUtil.getUsernameFromToken(VALID_TOKEN)).thenReturn(USERNAME);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(((UserDetails) auth.getPrincipal()).getUsername()).isEqualTo("original@test.com");
    }
}
