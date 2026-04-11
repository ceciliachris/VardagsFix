package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.dto.AvailableSlotRequest;
import com.vardagsfix.vardagsfix.dto.TaskServiceRequest;
import com.vardagsfix.vardagsfix.exception.ResourceNotFoundException;
import com.vardagsfix.vardagsfix.exception.UnauthorizedActionException;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.model.AvailableSlot;
import com.vardagsfix.vardagsfix.model.BookingStatus;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.repository.BookingRepository;
import com.vardagsfix.vardagsfix.repository.ServiceRepository;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public List<TaskService> getAll() {
        return serviceRepository.findAll();
    }

    public List<TaskService> getByUser(String email) {
        return serviceRepository.findByUser_Email(email);
    }

    public TaskService createForAuthenticatedUser(TaskServiceRequest request, String email) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TaskService taskService = new TaskService();
        taskService.setTitle(request.getTitle());
        taskService.setDescription(request.getDescription());
        taskService.setPrice(request.getPrice());
        taskService.setLocation(request.getLocation());
        taskService.setUser(user);

        if (request.getAvailableSlots() != null) {
            for (AvailableSlotRequest slotRequest : request.getAvailableSlots()) {
                validateSlot(slotRequest);

                AvailableSlot slot = new AvailableSlot();
                slot.setStartTime(slotRequest.getStartTime());
                slot.setEndTime(slotRequest.getEndTime());
                slot.setBooked(false);
                slot.setTaskService(taskService);

                taskService.getAvailableSlots().add(slot);
            }
        }

        return serviceRepository.save(taskService);
    }

    public TaskService update(Long id, TaskServiceRequest request, String email) {
        TaskService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        validateOwner(service, email);

        service.setTitle(request.getTitle());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setLocation(request.getLocation());

        List<AvailableSlot> existingSlots = service.getAvailableSlots();

        List<AvailableSlot> bookedSlots = existingSlots.stream()
                .filter(AvailableSlot::isBooked)
                .toList();

        List<AvailableSlot> newSlots = new ArrayList<>();

        if (request.getAvailableSlots() != null) {
            for (AvailableSlotRequest slotRequest : request.getAvailableSlots()) {
                validateSlot(slotRequest);

                AvailableSlot slot = new AvailableSlot();
                slot.setStartTime(slotRequest.getStartTime());
                slot.setEndTime(slotRequest.getEndTime());
                slot.setBooked(false);
                slot.setTaskService(service);

                newSlots.add(slot);
            }
        }

        List<AvailableSlot> finalSlots = new ArrayList<>();
        finalSlots.addAll(bookedSlots);
        finalSlots.addAll(newSlots);

        service.setAvailableSlots(finalSlots);

        return serviceRepository.save(service);
    }

    public void delete(Long id, String email) {
        TaskService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!service.getUser().getEmail().equals(email)) {
            throw new UnauthorizedActionException("You are not allowed to delete this service");
        }

        if (bookingRepository.existsByTaskServiceIdAndStatus(id, BookingStatus.BOOKED)) {
            throw new IllegalArgumentException("Cannot delete service with active bookings");
        }

        serviceRepository.delete(service);
    }

    private void validateOwner(TaskService service, String email) {
        if (!service.getUser().getEmail().equals(email)) {
            throw new UnauthorizedActionException("You are not allowed to modify this service");
        }
    }

    private void validateSlot(AvailableSlotRequest slotRequest) {
        if (slotRequest.getStartTime() == null || slotRequest.getEndTime() == null) {
            throw new IllegalArgumentException("Slot start time and end time are required");
        }

        if (!slotRequest.getStartTime().isBefore(slotRequest.getEndTime())) {
            throw new IllegalArgumentException("Slot start time must be before end time");
        }
    }
}