package com.vardagsfix.vardagsfix.repository;

import com.vardagsfix.vardagsfix.model.TaskService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<TaskService, Long> {

    List<TaskService> findByUser_Email(String email);
}
