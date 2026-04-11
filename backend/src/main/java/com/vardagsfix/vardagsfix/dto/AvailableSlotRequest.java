package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AvailableSlotRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}