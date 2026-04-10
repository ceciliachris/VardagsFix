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
        taskService.setDescription("Jag hjälper till med gräsklippning");
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
    }

    @Test
    void createBooking_shouldSaveBooking_whenRequestIsValid() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(bookingRepository.existsByTaskServiceIdAndStartTimeLessThanAndEndTimeGreaterThan(
                10L, request.getEndTime(), request.getStartTime()
        )).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking saved = bookingService.createBooking(request, "cecilia@test.com");

        assertEquals(bookingUser, saved.getUser());
        assertEquals(taskService, saved.getTaskService());
        assertEquals(request.getStartTime(), saved.getStartTime());
        assertEquals(request.getEndTime(), saved.getEndTime());

        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldThrowNotFound_whenUserDoesNotExist() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com"));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowNotFound_whenServiceDoesNotExist() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com"));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowUnauthorized_whenUserBooksOwnService() {
        taskService.setUser(bookingUser);

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(UnauthorizedActionException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com"));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowIllegalArgument_whenStartTimeIsNull() {
        request.setStartTime(null);

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com"));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowIllegalArgument_whenEndTimeIsNull() {
        request.setEndTime(null);

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com"));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowIllegalArgument_whenStartTimeIsAfterEndTime() {
        request.setStartTime(LocalDateTime.of(2026, 4, 11, 13, 0));
        request.setEndTime(LocalDateTime.of(2026, 4, 11, 12, 0));

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com"));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowIllegalArgument_whenTimeConflicts() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(bookingUser));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(bookingRepository.existsByTaskServiceIdAndStartTimeLessThanAndEndTimeGreaterThan(
                10L, request.getEndTime(), request.getStartTime()
        )).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com"));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void getMyBookings_shouldReturnBookingsForUser() {
        when(bookingRepository.findByUserEmail("cecilia@test.com")).thenReturn(List.of(booking));

        List<Booking> result = bookingService.getMyBookings("cecilia@test.com");

        assertEquals(1, result.size());
        assertEquals(booking, result.get(0));
        verify(bookingRepository).findByUserEmail("cecilia@test.com");
    }

    @Test
    void cancelBooking_shouldDeleteBooking_whenUserOwnsBooking() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        bookingService.cancelBooking(100L, "cecilia@test.com");

        verify(bookingRepository).delete(booking);
    }

    @Test
    void cancelBooking_shouldThrowUnauthorized_whenUserDoesNotOwnBooking() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertThrows(UnauthorizedActionException.class,
                () -> bookingService.cancelBooking(100L, "other@test.com"));

        verify(bookingRepository, never()).delete(any());
    }

    @Test
    void cancelBooking_shouldThrowNotFound_whenBookingDoesNotExist() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.cancelBooking(100L, "cecilia@test.com"));

        verify(bookingRepository, never()).delete(any());
    }
}