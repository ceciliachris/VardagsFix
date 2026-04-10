package com.vardagsfix.vardagsfix.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@NotBlank
@Email
@NotNull
@Positive
@Future
@Data
public class BookingRequest {
    private Long serviceId;

    @Schema(example = "2026-04-11T10:00:00")
    private LocalDateTime startTime;

    @Schema(example = "2026-04-11T12:00:00")
    private LocalDateTime endTime;
}