package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import com.vardagsfix.vardagsfix.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AppUser register(AppUser appUser) {
        appUser.setEmail(appUser.getEmail().trim().toLowerCase());
        appUser.setPassword(passwordEncoder.encode(appUser.getPassword()));
        return userRepository.save(appUser);
    }

    public String login(String email, String password) {
        email = email.trim().toLowerCase();

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return jwtService.generateToken(user.getEmail());
    }
}
