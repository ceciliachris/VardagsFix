package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.dto.BookingRequest;
import com.vardagsfix.vardagsfix.exception.ResourceNotFoundException;
import com.vardagsfix.vardagsfix.exception.UnauthorizedActionException;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.model.Booking;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.repository.BookingRepository;
import com.vardagsfix.vardagsfix.repository.ServiceRepository;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          ServiceRepository serviceRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
    }

    public Booking createBooking(BookingRequest request, String email) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TaskService taskService = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (taskService.getUser().getEmail().equals(email)) {
            throw new UnauthorizedActionException("You cannot book your own service");
        }

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        boolean hasConflict = bookingRepository
                .existsByTaskServiceIdAndStartTimeLessThanAndEndTimeGreaterThan(
                        request.getServiceId(),
                        request.getEndTime(),
                        request.getStartTime()
                );

        if (hasConflict) {
            throw new IllegalArgumentException("Booking time conflicts with an existing booking");
        }

        Booking booking = new Booking();
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setUser(user);
        booking.setTaskService(taskService);

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String email) {
        return bookingRepository.findByUserEmail(email);
    }

    public void cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getEmail().equals(email)) {
            throw new UnauthorizedActionException("You are not allowed to cancel this booking");
        }

        bookingRepository.delete(booking);
    }
}