package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

@Data
public class TaskServiceRequest {
    private String title;
    private String description;
    private Double price;
    private Long userId;
}
