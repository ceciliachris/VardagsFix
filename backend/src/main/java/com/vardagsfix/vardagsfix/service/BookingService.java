package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.dto.BookingRequest;
import com.vardagsfix.vardagsfix.exception.ResourceNotFoundException;
import com.vardagsfix.vardagsfix.exception.UnauthorizedActionException;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.model.AvailableSlot;
import com.vardagsfix.vardagsfix.model.Booking;
import com.vardagsfix.vardagsfix.model.BookingStatus;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.repository.AvailableSlotRepository;
import com.vardagsfix.vardagsfix.repository.BookingRepository;
import com.vardagsfix.vardagsfix.repository.ServiceRepository;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final AvailableSlotRepository availableSlotRepository;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          ServiceRepository serviceRepository,
                          AvailableSlotRepository availableSlotRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.availableSlotRepository = availableSlotRepository;
    }

    public Booking createBooking(BookingRequest request, String email) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TaskService taskService = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (taskService.getUser().getEmail().equals(email)) {
            throw new UnauthorizedActionException("You cannot book your own service");
        }

        if (request.getSlotId() == null) {
            throw new IllegalArgumentException("Slot id is required");
        }

        AvailableSlot slot = availableSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Available slot not found"));

        if (!slot.getTaskService().getId().equals(taskService.getId())) {
            throw new IllegalArgumentException("Selected slot does not belong to this service");
        }

        if (slot.isBooked()) {
            throw new IllegalArgumentException("Selected slot is already booked");
        }

        if (!slot.getStartTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("You cannot book a time that has already started or passed");
        }

        boolean hasConflict =
                bookingRepository.existsByTaskServiceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                        request.getServiceId(),
                        BookingStatus.BOOKED,
                        slot.getEndTime(),
                        slot.getStartTime()
                );

        if (hasConflict) {
            throw new IllegalArgumentException("Booking time conflicts with an existing booking");
        }

        Booking booking = new Booking();
        booking.setStartTime(slot.getStartTime());
        booking.setEndTime(slot.getEndTime());
        booking.setStatus(BookingStatus.BOOKED);
        booking.setUser(user);
        booking.setTaskService(taskService);
        booking.setAvailableSlot(slot);
        booking.setMessage(request.getMessage());

        slot.setBooked(true);
        availableSlotRepository.save(slot);

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String email) {
        return bookingRepository.findByUserEmail(email);
    }

    public List<Booking> getBookingsForMyServices(String email) {
        return bookingRepository.findByTaskService_User_Email(email);
    }

    public Booking cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isBooker = booking.getUser().getEmail().equals(email);
        boolean isServiceOwner = booking.getTaskService().getUser().getEmail().equals(email);

        if (!isBooker && !isServiceOwner) {
            throw new UnauthorizedActionException("You are not allowed to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        if (booking.getAvailableSlot() != null) {
            AvailableSlot slot = booking.getAvailableSlot();
            slot.setBooked(false);
            availableSlotRepository.save(slot);
        }

        return bookingRepository.save(booking);
    }
}