package com.vardagsfix.vardagsfix.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class TaskService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Double price;

    @ManyToOne
    private AppUser user;

    @OneToMany(mappedBy = "taskService", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvailableSlot> availableSlots = new ArrayList<>();
}