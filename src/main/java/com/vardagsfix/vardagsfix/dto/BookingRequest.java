package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Long serviceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}