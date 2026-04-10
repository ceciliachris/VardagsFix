package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.dto.BookingRequest;
import com.vardagsfix.vardagsfix.exception.ResourceNotFoundException;
import com.vardagsfix.vardagsfix.exception.UnauthorizedActionException;
import com.vardagsfix.vardagsfix.model.*;
import com.vardagsfix.vardagsfix.repository.BookingRepository;
import com.vardagsfix.vardagsfix.repository.ServiceRepository;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private BookingService bookingService;

    private AppUser bookingUser;
    private AppUser serviceOwner;
    private TaskService taskService;
    private BookingRequest request;
    private Booking booking;

    @BeforeEach
    void setUp() {
        bookingUser = new AppUser();
        bookingUser.setId(1L);
        bookingUser.setName("Cecilia");
        bookingUser.setEmail("cecilia@test.com");

        serviceOwner = new AppUser();
        serviceOwner.setId(2L);
        serviceOwner.setName("Owner");
        serviceOwner.setEmail("owner@test.com");

        taskService = new TaskService();
        taskService.setId(10L);
        taskService.setTitle("Gräsklippning");
        taskService.setDescription("...");
        taskService.setPrice(300.0);
        taskService.setUser(serviceOwner);

        request = new BookingRequest();
        request.setServiceId(10L);
        request.setStartTime(LocalDateTime.of(2026, 4, 11, 10, 0));
        request.setEndTime(LocalDateTime.of(2026, 4, 11, 12, 0));

        booking = new Booking();
        booking.setId(100L);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setUser(bookingUser);
        booking.setTaskService(taskService);
        booking.setStatus(BookingStatus.BOOKED);
    }

    @Test
    void createBooking_shouldSaveBooking_whenRequestIsValid() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(bookingRepository.existsByTaskServiceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                10L, BookingStatus.BOOKED, request.getEndTime(), request.getStartTime()
        )).thenReturn(false);

        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking saved = bookingService.createBooking(request, "cecilia@test.com");

        assertEquals(BookingStatus.BOOKED, saved.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldThrowIllegalArgument_whenTimeConflicts() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(bookingRepository.existsByTaskServiceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                10L, BookingStatus.BOOKED, request.getEndTime(), request.getStartTime()
        )).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com"));
    }

    @Test
    void getMyBookings_shouldReturnBookingsForUser() {
        when(bookingRepository.findByUserEmail("cecilia@test.com"))
                .thenReturn(List.of(booking));

        List<Booking> result = bookingService.getMyBookings("cecilia@test.com");

        assertEquals(1, result.size());
        verify(bookingRepository).findByUserEmail("cecilia@test.com");
    }

    @Test
    void cancelBooking_shouldSetStatusCancelled_whenUserIsBooker() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any())).thenReturn(booking);

        Booking result = bookingService.cancelBooking(100L, "cecilia@test.com");

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBooking_shouldSetStatusCancelled_whenUserIsServiceOwner() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any())).thenReturn(booking);

        Booking result = bookingService.cancelBooking(100L, "owner@test.com");

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBooking_shouldThrowUnauthorized_whenUserNotAllowed() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertThrows(UnauthorizedActionException.class,
                () -> bookingService.cancelBooking(100L, "other@test.com"));
    }

    @Test
    void cancelBooking_shouldThrowIllegalArgument_whenAlreadyCancelled() {
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertThrows(IllegalArgumentException.class,
                () -> bookingService.cancelBooking(100L, "cecilia@test.com"));
    }

    @Test
    void cancelBooking_shouldThrowNotFound_whenBookingDoesNotExist() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.cancelBooking(100L, "cecilia@test.com"));
    }
}