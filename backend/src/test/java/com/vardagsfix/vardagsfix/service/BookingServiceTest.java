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

    @Mock
    private AvailableSlotRepository availableSlotRepository;

    @InjectMocks
    private BookingService bookingService;

    private AppUser booker;
    private AppUser owner;
    private TaskService taskService;
    private AvailableSlot availableSlot;
    private BookingRequest request;
    private Booking booking;

    @BeforeEach
    void setUp() {
        booker = new AppUser();
        booker.setId(1L);
        booker.setName("Olle");
        booker.setEmail("olle@test.com");

        owner = new AppUser();
        owner.setId(2L);
        owner.setName("Cecilia");
        owner.setEmail("cecilia@test.com");

        taskService = new TaskService();
        taskService.setId(10L);
        taskService.setTitle("Hundpromenad");
        taskService.setDescription("En timmes promenad");
        taskService.setPrice(200.0);
        taskService.setUser(owner);

        availableSlot = new AvailableSlot();
        availableSlot.setId(100L);
        availableSlot.setStartTime(LocalDateTime.of(2026, 5, 10, 10, 0));
        availableSlot.setEndTime(LocalDateTime.of(2026, 5, 10, 11, 0));
        availableSlot.setBooked(false);
        availableSlot.setTaskService(taskService);

        request = new BookingRequest();
        request.setServiceId(10L);
        request.setSlotId(100L);
        request.setMessage("Hej! Jag vill boka denna tid.");

        booking = new Booking();
        booking.setId(50L);
        booking.setStartTime(availableSlot.getStartTime());
        booking.setEndTime(availableSlot.getEndTime());
        booking.setStatus(BookingStatus.BOOKED);
        booking.setUser(booker);
        booking.setTaskService(taskService);
        booking.setAvailableSlot(availableSlot);
        booking.setMessage("Hej! Jag vill boka denna tid.");
    }

    @Test
    void createBooking_shouldCreateBookingAndMarkSlotBooked_whenValid() {
        when(userRepository.findByEmail("olle@test.com")).thenReturn(Optional.of(booker));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(availableSlotRepository.findById(100L)).thenReturn(Optional.of(availableSlot));
        when(bookingRepository.existsByTaskServiceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                10L,
                BookingStatus.BOOKED,
                availableSlot.getEndTime(),
                availableSlot.getStartTime()
        )).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking saved = bookingService.createBooking(request, "olle@test.com");

        assertEquals(BookingStatus.BOOKED, saved.getStatus());
        assertEquals(booker, saved.getUser());
        assertEquals(taskService, saved.getTaskService());
        assertEquals(availableSlot, saved.getAvailableSlot());
        assertEquals(availableSlot.getStartTime(), saved.getStartTime());
        assertEquals(availableSlot.getEndTime(), saved.getEndTime());
        assertEquals("Hej! Jag vill boka denna tid.", saved.getMessage());
        assertTrue(availableSlot.isBooked());

        verify(availableSlotRepository).save(availableSlot);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldThrowNotFound_whenUserDoesNotExist() {
        when(userRepository.findByEmail("olle@test.com")).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> bookingService.createBooking(request, "olle@test.com")
        );

        verify(serviceRepository, never()).findById(anyLong());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowNotFound_whenServiceDoesNotExist() {
        when(userRepository.findByEmail("olle@test.com")).thenReturn(Optional.of(booker));
        when(serviceRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> bookingService.createBooking(request, "olle@test.com")
        );

        verify(availableSlotRepository, never()).findById(anyLong());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowUnauthorized_whenUserBooksOwnService() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(owner));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(
                UnauthorizedActionException.class,
                () -> bookingService.createBooking(request, "cecilia@test.com")
        );

        verify(availableSlotRepository, never()).findById(anyLong());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowIllegalArgumentException_whenSlotIdIsMissing() {
        request.setSlotId(null);

        when(userRepository.findByEmail("olle@test.com")).thenReturn(Optional.of(booker));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "olle@test.com")
        );

        verify(availableSlotRepository, never()).findById(anyLong());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowNotFound_whenSlotDoesNotExist() {
        when(userRepository.findByEmail("olle@test.com")).thenReturn(Optional.of(booker));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(availableSlotRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> bookingService.createBooking(request, "olle@test.com")
        );

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowIllegalArgumentException_whenSlotBelongsToAnotherService() {
        TaskService anotherService = new TaskService();
        anotherService.setId(99L);

        availableSlot.setTaskService(anotherService);

        when(userRepository.findByEmail("olle@test.com")).thenReturn(Optional.of(booker));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(availableSlotRepository.findById(100L)).thenReturn(Optional.of(availableSlot));

        assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "olle@test.com")
        );

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowIllegalArgumentException_whenSlotAlreadyBooked() {
        availableSlot.setBooked(true);

        when(userRepository.findByEmail("olle@test.com")).thenReturn(Optional.of(booker));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(availableSlotRepository.findById(100L)).thenReturn(Optional.of(availableSlot));

        assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "olle@test.com")
        );

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_shouldThrowIllegalArgumentException_whenBookingConflicts() {
        when(userRepository.findByEmail("olle@test.com")).thenReturn(Optional.of(booker));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(availableSlotRepository.findById(100L)).thenReturn(Optional.of(availableSlot));
        when(bookingRepository.existsByTaskServiceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                10L,
                BookingStatus.BOOKED,
                availableSlot.getEndTime(),
                availableSlot.getStartTime()
        )).thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "olle@test.com")
        );

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void getMyBookings_shouldReturnBookingsForUser() {
        when(bookingRepository.findByUserEmail("olle@test.com")).thenReturn(List.of(booking));

        List<Booking> result = bookingService.getMyBookings("olle@test.com");

        assertEquals(1, result.size());
        assertEquals(booking, result.get(0));
    }

    @Test
    void getBookingsForMyServices_shouldReturnBookingsForOwnedServices() {
        when(bookingRepository.findByTaskService_User_Email("cecilia@test.com"))
                .thenReturn(List.of(booking));

        List<Booking> result = bookingService.getBookingsForMyServices("cecilia@test.com");

        assertEquals(1, result.size());
        assertEquals(booking, result.get(0));
    }

    @Test
    void cancelBooking_shouldCancelBookingAndFreeSlot_whenBookerCancels() {
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking cancelled = bookingService.cancelBooking(50L, "olle@test.com");

        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());
        assertFalse(availableSlot.isBooked());

        verify(availableSlotRepository).save(availableSlot);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBooking_shouldCancelBookingAndFreeSlot_whenServiceOwnerCancels() {
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking cancelled = bookingService.cancelBooking(50L, "cecilia@test.com");

        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());
        assertFalse(availableSlot.isBooked());

        verify(availableSlotRepository).save(availableSlot);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBooking_shouldThrowNotFound_whenBookingDoesNotExist() {
        when(bookingRepository.findById(50L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> bookingService.cancelBooking(50L, "olle@test.com")
        );

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBooking_shouldThrowUnauthorized_whenUserIsNotBookerOrOwner() {
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThrows(
                UnauthorizedActionException.class,
                () -> bookingService.cancelBooking(50L, "annan@test.com")
        );

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBooking_shouldThrowIllegalArgumentException_whenBookingAlreadyCancelled() {
        booking.setStatus(BookingStatus.CANCELLED);

        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.cancelBooking(50L, "olle@test.com")
        );

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBooking_shouldCancelBookingWithoutSlot_whenAvailableSlotIsNull() {
        booking.setAvailableSlot(null);

        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking cancelled = bookingService.cancelBooking(50L, "olle@test.com");

        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());

        verify(availableSlotRepository, never()).save(any());
        verify(bookingRepository).save(booking);
    }
}