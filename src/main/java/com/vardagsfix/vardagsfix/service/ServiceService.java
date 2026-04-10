package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.dto.TaskServiceRequest;
import com.vardagsfix.vardagsfix.exception.ResourceNotFoundException;
import com.vardagsfix.vardagsfix.exception.UnauthorizedActionException;
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

    public List<TaskService> getAll() {
        return serviceRepository.findAll();
    }

    public TaskService createForAuthenticatedUser(TaskService taskService, String email) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        taskService.setUser(user);
        return serviceRepository.save(taskService);
    }

    public TaskService update(Long id, TaskServiceRequest request, String email) {
        TaskService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        validateOwner(service, email);

        service.setTitle(request.getTitle());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());

        return serviceRepository.save(service);
    }

    public void delete(Long id, String email) {
        TaskService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        validateOwner(service, email);

        serviceRepository.delete(service);
    }

    private void validateOwner(TaskService service, String email) {
        if (!service.getUser().getEmail().equals(email)) {
            throw new UnauthorizedActionException("You are not allowed to modify this service");
        }
    }
}