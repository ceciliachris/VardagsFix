package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AvailableSlotResponse {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean booked;
}