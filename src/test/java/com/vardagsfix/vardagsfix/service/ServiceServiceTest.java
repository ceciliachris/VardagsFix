package com.vardagsfix.vardagsfix.service;

import com.vardagsfix.vardagsfix.dto.TaskServiceRequest;
import com.vardagsfix.vardagsfix.exception.ResourceNotFoundException;
import com.vardagsfix.vardagsfix.exception.UnauthorizedActionException;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.repository.ServiceRepository;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private UserRepository userRepository;

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
        taskService.setUser(owner);

        request = new TaskServiceRequest();
        request.setTitle("Ny titel");
        request.setDescription("Ny beskrivning");
        request.setPrice(500.0);
    }

    @Test
    void createForAuthenticatedUser_shouldAttachUserAndSave() {
        TaskService newService = new TaskService();
        newService.setTitle("Hundpromenad");
        newService.setDescription("Promenerar hund");
        newService.setPrice(200.0);

        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.of(owner));
        when(serviceRepository.save(any(TaskService.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskService saved = serviceService.createForAuthenticatedUser(newService, "cecilia@test.com");

        assertEquals(owner, saved.getUser());
        assertEquals("Hundpromenad", saved.getTitle());
        verify(serviceRepository).save(newService);
    }

    @Test
    void createForAuthenticatedUser_shouldThrowNotFound_whenUserDoesNotExist() {
        TaskService newService = new TaskService();
        when(userRepository.findByEmail("cecilia@test.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> serviceService.createForAuthenticatedUser(newService, "cecilia@test.com"));

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void update_shouldUpdateService_whenUserIsOwner() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));
        when(serviceRepository.save(any(TaskService.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskService updated = serviceService.update(10L, request, "cecilia@test.com");

        assertEquals("Ny titel", updated.getTitle());
        assertEquals("Ny beskrivning", updated.getDescription());
        assertEquals(500.0, updated.getPrice());
        verify(serviceRepository).save(taskService);
    }

    @Test
    void update_shouldThrowUnauthorized_whenUserIsNotOwner() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(UnauthorizedActionException.class,
                () -> serviceService.update(10L, request, "annan@test.com"));

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void update_shouldThrowNotFound_whenServiceDoesNotExist() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> serviceService.update(10L, request, "cecilia@test.com"));

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void delete_shouldDeleteService_whenUserIsOwner() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        serviceService.delete(10L, "cecilia@test.com");

        verify(serviceRepository).delete(taskService);
    }

    @Test
    void delete_shouldThrowUnauthorized_whenUserIsNotOwner() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(taskService));

        assertThrows(UnauthorizedActionException.class,
                () -> serviceService.delete(10L, "annan@test.com"));

        verify(serviceRepository, never()).delete(any());
    }

    @Test
    void delete_shouldThrowNotFound_whenServiceDoesNotExist() {
        when(serviceRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> serviceService.delete(10L, "cecilia@test.com"));

        verify(serviceRepository, never()).delete(any());
    }
}