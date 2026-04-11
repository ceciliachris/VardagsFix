package com.vardagsfix.vardagsfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vardagsfix.vardagsfix.dto.LoginRequest;
import com.vardagsfix.vardagsfix.dto.RegisterRequest;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private AppUser savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("Cecilia");
        registerRequest.setEmail("cecilia@test.com");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("cecilia@test.com");
        loginRequest.setPassword("password123");

        savedUser = new AppUser();
        savedUser.setId(1L);
        savedUser.setName("Cecilia");
        savedUser.setEmail("cecilia@test.com");
    }

    @Test
    void register_shouldReturnUserResponse() throws Exception {
        when(authService.register(any(AppUser.class))).thenReturn(savedUser);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Cecilia"))
                .andExpect(jsonPath("$.email").value("cecilia@test.com"));

        verify(authService).register(any(AppUser.class));
    }

    @Test
    void login_shouldReturnToken() throws Exception {
        when(authService.login("cecilia@test.com", "password123"))
                .thenReturn("mocked-jwt-token");

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string("mocked-jwt-token"));

        verify(authService).login(
                eq("cecilia@test.com"),
                eq("password123")
        );
    }
}