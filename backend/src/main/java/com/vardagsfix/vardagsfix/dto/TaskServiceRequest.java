package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

import java.util.List;

@Data
public class TaskServiceRequest {
    private String title;
    private String description;
    private Double price;
    private List<AvailableSlotRequest> availableSlots;
}