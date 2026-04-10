package com.vardagsfix.vardagsfix.model;

import jakarta.persistence.*;
import lombok.Data;

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
}
