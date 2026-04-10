package com.vardagsfix.vardagsfix.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@NotBlank
@Email
@NotNull
@Positive
@Future
@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
}
