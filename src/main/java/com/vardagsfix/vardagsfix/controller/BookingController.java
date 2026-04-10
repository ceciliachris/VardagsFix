package com.vardagsfix.vardagsfix.controller;

import com.vardagsfix.vardagsfix.dto.BookingRequest;
import com.vardagsfix.vardagsfix.dto.BookingResponse;
import com.vardagsfix.vardagsfix.dto.UserResponse;
import com.vardagsfix.vardagsfix.model.Booking;
import com.vardagsfix.vardagsfix.service.BookingService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponse create(@RequestBody BookingRequest request, Authentication authentication) {
        String email = authentication.getName();
        Booking booking = bookingService.createBooking(request, email);
        return mapToResponse(booking);
    }

    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        String email = authentication.getName();
        return bookingService.getMyBookings(email).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        Booking booking = bookingService.cancelBooking(id, email);
        return mapToResponse(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setServiceId(booking.getTaskService().getId());
        response.setServiceTitle(booking.getTaskService().getTitle());
        response.setStatus(booking.getStatus());

        UserResponse userResponse = new UserResponse();
        userResponse.setId(booking.getUser().getId());
        userResponse.setName(booking.getUser().getName());
        userResponse.setEmail(booking.getUser().getEmail());
        response.setUser(userResponse);

        return response;
    }
}