package com.vardagsfix.vardagsfix.repository;

import com.vardagsfix.vardagsfix.model.TaskService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<TaskService, Long> {
}
