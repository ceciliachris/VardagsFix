package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

import java.util.List;

@Data
public class TaskServiceResponse {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private UserResponse user;
    private List<AvailableSlotResponse> availableSlots;
}