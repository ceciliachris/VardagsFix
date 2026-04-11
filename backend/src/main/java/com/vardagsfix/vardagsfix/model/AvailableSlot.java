package com.vardagsfix.vardagsfix.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "available_slots")
@Data
public class AvailableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Column(nullable = false)
    private boolean booked = false;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private TaskService taskService;
}