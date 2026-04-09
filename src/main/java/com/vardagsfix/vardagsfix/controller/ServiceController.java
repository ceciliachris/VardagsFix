package com.vardagsfix.vardagsfix.controller;

import com.vardagsfix.vardagsfix.dto.TaskServiceRequest;
import com.vardagsfix.vardagsfix.dto.TaskServiceResponse;
import com.vardagsfix.vardagsfix.dto.UserResponse;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.service.ServiceService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping
    public TaskServiceResponse create(@RequestBody TaskServiceRequest request, Authentication authentication) {
        TaskService taskService = new TaskService();
        taskService.setTitle(request.getTitle());
        taskService.setDescription(request.getDescription());
        taskService.setPrice(request.getPrice());

        String email = authentication.getName();

        TaskService savedService = serviceService.createForAuthenticatedUser(taskService, email);
        return mapToResponse(savedService);
    }

    @GetMapping
    public List<TaskServiceResponse> getAll() {
        return serviceService.getAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TaskServiceResponse mapToResponse(TaskService taskService) {
        TaskServiceResponse response = new TaskServiceResponse();
        response.setId(taskService.getId());
        response.setTitle(taskService.getTitle());
        response.setDescription(taskService.getDescription());
        response.setPrice(taskService.getPrice());

        if (taskService.getUser() != null) {
            UserResponse userResponse = new UserResponse();
            userResponse.setId(taskService.getUser().getId());
            userResponse.setName(taskService.getUser().getName());
            userResponse.setEmail(taskService.getUser().getEmail());
            response.setUser(userResponse);
        }

        return response;
    }
}