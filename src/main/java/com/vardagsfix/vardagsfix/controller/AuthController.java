package com.vardagsfix.vardagsfix.controller;

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
    public UserResponse register(@RequestBody AppUser user) {
        AppUser savedUser = authService.register(user);

        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());

        return response;
    }

    @PostMapping("/signin")
    public String login(@RequestBody AppUser user) {
        return authService.login(user.getEmail(), user.getPassword());
    }
}
