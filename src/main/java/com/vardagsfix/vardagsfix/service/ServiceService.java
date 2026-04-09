package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.repository.ServiceRepository;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public ServiceService(ServiceRepository serviceRepository, UserRepository userRepository) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    public TaskService createWithUser(TaskService taskService, Long userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        taskService.setUser(user);
        return serviceRepository.save(taskService);
    }

    public List<TaskService> getAll() {
        return serviceRepository.findAll();
    }
}