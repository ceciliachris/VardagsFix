package com.vardagsfix.vardagsfix.dto;

import lombok.Data;

@Data
public class BookingRequest {

    private Long serviceId;
    private Long slotId;
    private String message;
}