package com.vardagsfix.vardagsfix.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@NotBlank
@Email
@NotNull
@Positive
@Future
@Data
public class LoginRequest {
    private String email;
    private String password;
}
