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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ServiceService serviceService;

    private AppUser owner;
    private TaskService taskService;
    private TaskServiceRequest request;

    @BeforeEach
    void setUp() {
        owner = new AppUser();
        owner.setId(1L);
        owner.setName("Cecilia");
        owner.setEmail("cecilia@test.com");

        taskService = new TaskService();
        taskService.setId(10L);
        taskService.setTitle("Gräsklippning");
        taskService.setDescription("Original beskrivning");
        taskService.setPrice(300.0);
        taskService.setLocation("Malmö");
        taskService.setUser(owner);
        taskService.setAvailableSlots(new ArrayList<>());

        request = new TaskServiceRequest();
        request.setTitle("Ny titel");
        request.setDescription("Ny beskrivning");
        request.setPrice(500.0);
        request.setLocation("Lund");
        request.setAvailableSlots(List.of(
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 1, 10, 0),
                        LocalDateTime.of(2026, 5, 1, 11, 0)
                )
        ));
    }

    @Test
    void createForAuthenticatedUser_shouldAttachUserSlotsAndSave() {
        TaskServiceRequest createRequest = new TaskServiceRequest();
        createRequest.setTitle("Hundpromenad");
        createRequest.setDescription("Promenerar hund");
        createRequest.setPrice(200.0);
        createRequest.setLocation("Malmö");
        createRequest.setAvailableSlots(List.of(
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 2, 9, 0),
                        LocalDateTime.of(2026, 5, 2, 10, 0)
                ),
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 3, 14, 0),
                        LocalDateTime.of(2026, 5, 3, 15, 0)
                )
        ));

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(owner));
        when(serviceRepository.save(any(TaskService.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskService saved = serviceService.createForAuthenticatedUser(createRequest, "cecilia@test.com");

        assertEquals(owner, saved.getUser());
        assertEquals("Hundpromenad", saved.getTitle());
        assertEquals("Promenerar hund", saved.getDescription());
        assertEquals(200.0, saved.getPrice());
        assertEquals("Malmö", saved.getLocation());
        assertEquals(2, saved.getAvailableSlots().size());
        assertFalse(saved.getAvailableSlots().get(0).isBooked());
        assertEquals(saved, saved.getAvailableSlots().get(0).getTaskService());

        verify(serviceRepository).save(any(TaskService.class));
    }

    @Test
    void createForAuthenticatedUser_shouldThrowNotFound_whenUserDoesNotExist() {
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> serviceService.createForAuthenticatedUser(request, "cecilia@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void createForAuthenticatedUser_shouldThrowIllegalArgumentException_whenSlotHasInvalidTimeRange() {
        TaskServiceRequest createRequest = createRequestWithSlots(List.of(
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 2, 10, 0),
                        LocalDateTime.of(2026, 5, 2, 9, 0)
                )
        ));

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(owner));

        assertThrows(
                IllegalArgumentException.class,
                () -> serviceService.createForAuthenticatedUser(createRequest, "cecilia@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void createForAuthenticatedUser_shouldThrowIllegalArgumentException_whenSlotIsInPast() {
        TaskServiceRequest createRequest = createRequestWithSlots(List.of(
                createSlotRequest(
                        LocalDateTime.now().minusDays(1),
                        LocalDateTime.now().minusDays(1).plusHours(1)
                )
        ));

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(owner));

        assertThrows(
                IllegalArgumentException.class,
                () -> serviceService.createForAuthenticatedUser(createRequest, "cecilia@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void createForAuthenticatedUser_shouldThrowIllegalArgumentException_whenSlotsOverlap() {
        TaskServiceRequest createRequest = createRequestWithSlots(List.of(
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 2, 10, 0),
                        LocalDateTime.of(2026, 5, 2, 11, 0)
                ),
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 2, 10, 30),
                        LocalDateTime.of(2026, 5, 2, 11, 30)
                )
        ));

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(owner));

        assertThrows(
                IllegalArgumentException.class,
                () -> serviceService.createForAuthenticatedUser(createRequest, "cecilia@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void createForAuthenticatedUser_shouldAllowSlotsThatStartWhenPreviousEnds() {
        TaskServiceRequest createRequest = createRequestWithSlots(List.of(
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 2, 10, 0),
                        LocalDateTime.of(2026, 5, 2, 11, 0)
                ),
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 2, 11, 0),
                        LocalDateTime.of(2026, 5, 2, 12, 0)
                )
        ));

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(owner));
        when(serviceRepository.save(any(TaskService.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskService saved = serviceService.createForAuthenticatedUser(createRequest, "cecilia@test.com");

        assertEquals(2, saved.getAvailableSlots().size());

        verify(serviceRepository).save(any(TaskService.class));
    }

    @Test
    void update_shouldUpdateServiceAndReplaceUnbookedSlots_whenUserIsOwner() {
        AvailableSlot bookedSlot = new AvailableSlot();
        bookedSlot.setId(100L);
        bookedSlot.setStartTime(LocalDateTime.of(2026, 5, 4, 10, 0));
        bookedSlot.setEndTime(LocalDateTime.of(2026, 5, 4, 11, 0));
        bookedSlot.setBooked(true);
        bookedSlot.setTaskService(taskService);

        AvailableSlot unbookedSlot = new AvailableSlot();
        unbookedSlot.setId(101L);
        unbookedSlot.setStartTime(LocalDateTime.of(2026, 5, 5, 10, 0));
        unbookedSlot.setEndTime(LocalDateTime.of(2026, 5, 5, 11, 0));
        unbookedSlot.setBooked(false);
        unbookedSlot.setTaskService(taskService);

        taskService.setAvailableSlots(new ArrayList<>(List.of(bookedSlot, unbookedSlot)));

        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(serviceRepository.save(any(TaskService.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskService updated = serviceService.update(10L, request, "cecilia@test.com");

        assertEquals("Ny titel", updated.getTitle());
        assertEquals("Ny beskrivning", updated.getDescription());
        assertEquals(500.0, updated.getPrice());
        assertEquals("Lund", updated.getLocation());

        assertEquals(2, updated.getAvailableSlots().size());
        assertTrue(updated.getAvailableSlots().stream().anyMatch(AvailableSlot::isBooked));
        assertTrue(updated.getAvailableSlots().stream().anyMatch(slot ->
                !slot.isBooked()
                        && slot.getStartTime().equals(LocalDateTime.of(2026, 5, 1, 10, 0))
                        && slot.getEndTime().equals(LocalDateTime.of(2026, 5, 1, 11, 0))
        ));

        verify(serviceRepository).save(taskService);
    }

    @Test
    void update_shouldThrowUnauthorized_whenUserIsNotOwner() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(
                UnauthorizedActionException.class,
                () -> serviceService.update(10L, request, "annan@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void update_shouldThrowNotFound_whenServiceDoesNotExist() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> serviceService.update(10L, request, "cecilia@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void update_shouldThrowIllegalArgumentException_whenNewSlotHasInvalidTimeRange() {
        TaskServiceRequest invalidRequest = createRequestWithSlots(List.of(
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 10, 12, 0),
                        LocalDateTime.of(2026, 5, 10, 11, 0)
                )
        ));

        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(
                IllegalArgumentException.class,
                () -> serviceService.update(10L, invalidRequest, "cecilia@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void update_shouldThrowIllegalArgumentException_whenNewSlotIsInPast() {
        TaskServiceRequest invalidRequest = createRequestWithSlots(List.of(
                createSlotRequest(
                        LocalDateTime.now().minusDays(1),
                        LocalDateTime.now().minusDays(1).plusHours(1)
                )
        ));

        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(
                IllegalArgumentException.class,
                () -> serviceService.update(10L, invalidRequest, "cecilia@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void update_shouldThrowIllegalArgumentException_whenNewSlotsOverlap() {
        TaskServiceRequest invalidRequest = createRequestWithSlots(List.of(
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 10, 10, 0),
                        LocalDateTime.of(2026, 5, 10, 11, 0)
                ),
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 10, 10, 30),
                        LocalDateTime.of(2026, 5, 10, 11, 30)
                )
        ));

        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(
                IllegalArgumentException.class,
                () -> serviceService.update(10L, invalidRequest, "cecilia@test.com")
        );

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void update_shouldAllowNewSlotsThatStartWhenPreviousEnds() {
        TaskServiceRequest validRequest = createRequestWithSlots(List.of(
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 10, 10, 0),
                        LocalDateTime.of(2026, 5, 10, 11, 0)
                ),
                createSlotRequest(
                        LocalDateTime.of(2026, 5, 10, 11, 0),
                        LocalDateTime.of(2026, 5, 10, 12, 0)
                )
        ));

        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(serviceRepository.save(any(TaskService.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskService updated = serviceService.update(10L, validRequest, "cecilia@test.com");

        assertEquals(2, updated.getAvailableSlots().size());

        verify(serviceRepository).save(taskService);
    }

    @Test
    void delete_shouldDeleteService_whenUserIsOwnerAndNoActiveBookings() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(bookingRepository.existsByTaskServiceIdAndStatus(10L, BookingStatus.BOOKED)).thenReturn(false);

        serviceService.delete(10L, "cecilia@test.com");

        verify(serviceRepository).delete(taskService);
    }

    @Test
    void delete_shouldThrowUnauthorized_whenUserIsNotOwner() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(
                UnauthorizedActionException.class,
                () -> serviceService.delete(10L, "annan@test.com")
        );

        verify(serviceRepository, never()).delete(any());
    }

    @Test
    void delete_shouldThrowNotFound_whenServiceDoesNotExist() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> serviceService.delete(10L, "cecilia@test.com")
        );

        verify(serviceRepository, never()).delete(any());
    }

    @Test
    void delete_shouldThrowIllegalArgumentException_whenServiceHasActiveBookings() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(bookingRepository.existsByTaskServiceIdAndStatus(10L, BookingStatus.BOOKED)).thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () -> serviceService.delete(10L, "cecilia@test.com")
        );

        verify(serviceRepository, never()).delete(any());
    }

    private TaskServiceRequest createRequestWithSlots(List<AvailableSlotRequest> slots) {
        TaskServiceRequest request = new TaskServiceRequest();
        request.setTitle("Hundpromenad");
        request.setDescription("Promenerar hund");
        request.setPrice(200.0);
        request.setLocation("Malmö");
        request.setAvailableSlots(slots);
        return request;
    }

    private AvailableSlotRequest createSlotRequest(LocalDateTime startTime, LocalDateTime endTime) {
        AvailableSlotRequest slotRequest = new AvailableSlotRequest();
        slotRequest.setStartTime(startTime);
        slotRequest.setEndTime(endTime);
        return slotRequest;
    }
}