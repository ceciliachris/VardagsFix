package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.exception.ResourceNotFoundException;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import com.vardagsfix.vardagsfix.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private AppUser user;

    @BeforeEach
    void setUp() {
        user = new AppUser();
        user.setId(1L);
        user.setName("Cecilia");
        user.setEmail("cecilia@test.com");
        user.setPassword("123456");
    }

    @Test
    void register_shouldEncodePasswordAndSaveUser() {
        when(passwordEncoder.encode("123456")).thenReturn("encodedPassword");
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppUser savedUser = authService.register(user);

        assertEquals("encodedPassword", savedUser.getPassword());
        verify(passwordEncoder).encode("123456");
        verify(userRepository).save(user);
    }

    @Test
    void login_shouldReturnToken_whenCredentialsAreValid() {
        AppUser savedUser = new AppUser();
        savedUser.setId(1L);
        savedUser.setName("Cecilia");
        savedUser.setEmail("cecilia@test.com");
        savedUser.setPassword("encodedPassword");

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("123456", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken("cecilia@test.com")).thenReturn("mocked-jwt-token");

        String token = authService.login("cecilia@test.com", "123456");

        assertEquals("mocked-jwt-token", token);
        verify(userRepository).findByEmail("cecilia@test.com");
        verify(passwordEncoder).matches("123456", "encodedPassword");
        verify(jwtService).generateToken("cecilia@test.com");
    }

    @Test
    void login_shouldThrowNotFound_whenUserDoesNotExist() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> authService.login("cecilia@test.com", "123456"));

        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).generateToken(anyString());
    }

    @Test
    void login_shouldThrowIllegalArgument_whenPasswordIsIncorrect() {
        AppUser savedUser = new AppUser();
        savedUser.setId(1L);
        savedUser.setName("Cecilia");
        savedUser.setEmail("cecilia@test.com");
        savedUser.setPassword("encodedPassword");

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> authService.login("cecilia@test.com", "wrongPassword"));

        verify(jwtService, never()).generateToken(anyString());
    }
}