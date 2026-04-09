package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

@Data
public class TaskServiceResponse {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private UserResponse user;
}
