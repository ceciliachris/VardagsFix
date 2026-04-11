package com.vardagsfix.vardagsfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vardagsfix.vardagsfix.dto.AvailableSlotRequest;
import com.vardagsfix.vardagsfix.dto.TaskServiceRequest;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.model.AvailableSlot;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.service.ServiceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ServiceController.class)
@AutoConfigureMockMvc(addFilters = false)
class ServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ServiceService serviceService;

    private TaskService taskService;
    private TaskServiceRequest request;

    @BeforeEach
    void setUp() {
        AppUser owner = new AppUser();
        owner.setId(1L);
        owner.setName("Cecilia");
        owner.setEmail("cecilia@test.com");

        AvailableSlot slot = new AvailableSlot();
        slot.setId(100L);
        slot.setStartTime(LocalDateTime.of(2026, 5, 1, 10, 0));
        slot.setEndTime(LocalDateTime.of(2026, 5, 1, 11, 0));
        slot.setBooked(false);

        taskService = new TaskService();
        taskService.setId(10L);
        taskService.setTitle("Hundpromenad");
        taskService.setDescription("En timmes promenad");
        taskService.setPrice(200.0);
        taskService.setUser(owner);
        taskService.setAvailableSlots(List.of(slot));

        slot.setTaskService(taskService);

        AvailableSlotRequest slotRequest = new AvailableSlotRequest();
        slotRequest.setStartTime(LocalDateTime.of(2026, 5, 1, 10, 0));
        slotRequest.setEndTime(LocalDateTime.of(2026, 5, 1, 11, 0));

        request = new TaskServiceRequest();
        request.setTitle("Hundpromenad");
        request.setDescription("En timmes promenad");
        request.setPrice(200.0);
        request.setAvailableSlots(List.of(slotRequest));
    }

    @Test
    void create_shouldReturnServiceResponse() throws Exception {
        when(serviceService.createForAuthenticatedUser(eq(request), eq("cecilia@test.com")))
                .thenReturn(taskService);

        mockMvc.perform(post("/services")
                        .principal(() -> "cecilia@test.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Hundpromenad"))
                .andExpect(jsonPath("$.description").value("En timmes promenad"))
                .andExpect(jsonPath("$.price").value(200.0))
                .andExpect(jsonPath("$.user.email").value("cecilia@test.com"))
                .andExpect(jsonPath("$.availableSlots[0].id").value(100))
                .andExpect(jsonPath("$.availableSlots[0].booked").value(false));

        verify(serviceService).createForAuthenticatedUser(eq(request), eq("cecilia@test.com"));
    }

    @Test
    void getAll_shouldReturnList() throws Exception {
        when(serviceService.getAll()).thenReturn(List.of(taskService));

        mockMvc.perform(get("/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].title").value("Hundpromenad"))
                .andExpect(jsonPath("$[0].user.name").value("Cecilia"))
                .andExpect(jsonPath("$[0].availableSlots[0].id").value(100));

        verify(serviceService).getAll();
    }

    @Test
    void getMyServices_shouldReturnList() throws Exception {
        when(serviceService.getByUser("cecilia@test.com"))
                .thenReturn(List.of(taskService));

        mockMvc.perform(get("/services/my")
                        .principal(() -> "cecilia@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].title").value("Hundpromenad"));

        verify(serviceService).getByUser("cecilia@test.com");
    }

    @Test
    void update_shouldReturnUpdatedService() throws Exception {
        when(serviceService.update(eq(10L), eq(request), eq("cecilia@test.com")))
                .thenReturn(taskService);

        mockMvc.perform(put("/services/10")
                        .principal(() -> "cecilia@test.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Hundpromenad"))
                .andExpect(jsonPath("$.availableSlots[0].id").value(100));

        verify(serviceService).update(eq(10L), eq(request), eq("cecilia@test.com"));
    }

    @Test
    void delete_shouldReturnOk() throws Exception {
        mockMvc.perform(delete("/services/10")
                        .principal(() -> "cecilia@test.com"))
                .andExpect(status().isOk());

        verify(serviceService).delete(10L, "cecilia@test.com");
    }
}