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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
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

        validateNoOverlappingSlots(request.getAvailableSlots());

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
        validateNoOverlappingSlots(request.getAvailableSlots());

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

        existingSlots.clear();
        existingSlots.addAll(bookedSlots);
        existingSlots.addAll(newSlots);

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

        if (!slotRequest.getStartTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot create or update a slot in the past");
        }
    }

    private void validateNoOverlappingSlots(List<AvailableSlotRequest> slotRequests) {
        if (slotRequests == null || slotRequests.size() < 2) {
            return;
        }

        List<AvailableSlotRequest> sortedSlots = new ArrayList<>(slotRequests);
        sortedSlots.sort(Comparator.comparing(AvailableSlotRequest::getStartTime));

        for (int i = 0; i < sortedSlots.size() - 1; i++) {
            AvailableSlotRequest current = sortedSlots.get(i);
            AvailableSlotRequest next = sortedSlots.get(i + 1);

            if (current.getEndTime().isAfter(next.getStartTime())) {
                throw new IllegalArgumentException("Available slots must not overlap");
            }
        }
    }
}