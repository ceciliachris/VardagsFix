package com.vardagsfix.vardagsfix.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@NotBlank
@Email
@NotNull
@Positive
@Future
@Data
public class TaskServiceRequest {
    private String title;
    private String description;
    private Double price;
}
