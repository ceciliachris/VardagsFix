package com.vardagsfix.vardagsfix.controller;

import com.vardagsfix.vardagsfix.dto.AvailableSlotResponse;
import com.vardagsfix.vardagsfix.dto.TaskServiceRequest;
import com.vardagsfix.vardagsfix.dto.TaskServiceResponse;
import com.vardagsfix.vardagsfix.dto.UserResponse;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.service.ServiceService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Valid
@RestController
@RequestMapping("/services")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping
    public TaskServiceResponse create(@RequestBody TaskServiceRequest request, Authentication authentication) {
        String email = authentication.getName();
        TaskService savedService = serviceService.createForAuthenticatedUser(request, email);
        return mapToResponse(savedService);
    }

    @GetMapping
    public List<TaskServiceResponse> getAll() {
        return serviceService.getAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @PutMapping("/{id}")
    public TaskServiceResponse update(
            @PathVariable Long id,
            @RequestBody TaskServiceRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        TaskService updated = serviceService.update(id, request, email);
        return mapToResponse(updated);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        serviceService.delete(id, email);
    }

    @GetMapping("/my")
    public List<TaskServiceResponse> getMyServices(Authentication authentication) {
        String email = authentication.getName();

        return serviceService.getByUser(email).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TaskServiceResponse mapToResponse(TaskService taskService) {
        TaskServiceResponse response = new TaskServiceResponse();
        response.setId(taskService.getId());
        response.setTitle(taskService.getTitle());
        response.setDescription(taskService.getDescription());
        response.setPrice(taskService.getPrice());
        response.setLocation(taskService.getLocation());

        if (taskService.getUser() != null) {
            UserResponse userResponse = new UserResponse();
            userResponse.setId(taskService.getUser().getId());
            userResponse.setName(taskService.getUser().getName());
            userResponse.setEmail(taskService.getUser().getEmail());
            response.setUser(userResponse);
        }

        if (taskService.getAvailableSlots() != null) {
            List<AvailableSlotResponse> slotResponses = taskService.getAvailableSlots().stream()
                    .map(slot -> {
                        AvailableSlotResponse slotResponse = new AvailableSlotResponse();
                        slotResponse.setId(slot.getId());
                        slotResponse.setStartTime(slot.getStartTime());
                        slotResponse.setEndTime(slot.getEndTime());
                        slotResponse.setBooked(slot.isBooked());
                        return slotResponse;
                    })
                    .toList();

            response.setAvailableSlots(slotResponses);
        }

        return response;
    }
}