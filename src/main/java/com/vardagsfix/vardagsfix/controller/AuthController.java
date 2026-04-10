package com.vardagsfix.vardagsfix.controller;

import com.vardagsfix.vardagsfix.dto.LoginRequest;
import com.vardagsfix.vardagsfix.dto.RegisterRequest;
import com.vardagsfix.vardagsfix.dto.UserResponse;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {

        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        AppUser savedUser = authService.register(user);

        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());

        return response;
    }

    @PostMapping("/signin")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }
}
