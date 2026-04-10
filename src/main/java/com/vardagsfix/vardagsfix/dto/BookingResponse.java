package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long serviceId;
    private String serviceTitle;
    private UserResponse user;
}