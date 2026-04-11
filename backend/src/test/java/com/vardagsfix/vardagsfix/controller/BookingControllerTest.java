package com.vardagsfix.vardagsfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vardagsfix.vardagsfix.dto.BookingRequest;
import com.vardagsfix.vardagsfix.model.AppUser;
import com.vardagsfix.vardagsfix.model.AvailableSlot;
import com.vardagsfix.vardagsfix.model.Booking;
import com.vardagsfix.vardagsfix.model.BookingStatus;
import com.vardagsfix.vardagsfix.model.TaskService;
import com.vardagsfix.vardagsfix.service.BookingService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BookingService bookingService;

    private Booking booking;
    private BookingRequest bookingRequest;

    @BeforeEach
    void setUp() {
        AppUser serviceOwner = new AppUser();
        serviceOwner.setId(1L);
        serviceOwner.setName("Cecilia");
        serviceOwner.setEmail("cecilia@test.com");

        AppUser booker = new AppUser();
        booker.setId(2L);
        booker.setName("Olle");
        booker.setEmail("olle@test.com");

        TaskService taskService = new TaskService();
        taskService.setId(10L);
        taskService.setTitle("Hundpromenad");
        taskService.setDescription("En timmes promenad");
        taskService.setPrice(200.0);
        taskService.setUser(serviceOwner);

        AvailableSlot slot = new AvailableSlot();
        slot.setId(100L);
        slot.setStartTime(LocalDateTime.of(2026, 5, 10, 10, 0));
        slot.setEndTime(LocalDateTime.of(2026, 5, 10, 11, 0));
        slot.setBooked(true);
        slot.setTaskService(taskService);

        taskService.setAvailableSlots(List.of(slot));

        booking = new Booking();
        booking.setId(50L);
        booking.setStartTime(LocalDateTime.of(2026, 5, 10, 10, 0));
        booking.setEndTime(LocalDateTime.of(2026, 5, 10, 11, 0));
        booking.setStatus(BookingStatus.BOOKED);
        booking.setMessage("Hej! Jag vill boka denna tid.");
        booking.setUser(booker);
        booking.setTaskService(taskService);
        booking.setAvailableSlot(slot);

        bookingRequest = new BookingRequest();
        bookingRequest.setServiceId(10L);
        bookingRequest.setSlotId(100L);
        bookingRequest.setMessage("Hej! Jag vill boka denna tid.");
    }

    @Test
    void create_shouldReturnBookingResponse() throws Exception {
        when(bookingService.createBooking(eq(bookingRequest), eq("olle@test.com")))
                .thenReturn(booking);

        mockMvc.perform(post("/bookings")
                        .principal(() -> "olle@test.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(50))
                .andExpect(jsonPath("$.status").value("BOOKED"))
                .andExpect(jsonPath("$.message").value("Hej! Jag vill boka denna tid."))
                .andExpect(jsonPath("$.service.id").value(10))
                .andExpect(jsonPath("$.service.title").value("Hundpromenad"))
                .andExpect(jsonPath("$.service.user.email").value("cecilia@test.com"))
                .andExpect(jsonPath("$.user.email").value("olle@test.com"))
                .andExpect(jsonPath("$.service.availableSlots[0].id").value(100))
                .andExpect(jsonPath("$.service.availableSlots[0].booked").value(true));

        verify(bookingService).createBooking(eq(bookingRequest), eq("olle@test.com"));
    }

    @Test
    void getMyBookings_shouldReturnList() throws Exception {
        when(bookingService.getMyBookings("olle@test.com"))
                .thenReturn(List.of(booking));

        mockMvc.perform(get("/bookings/my")
                        .principal(() -> "olle@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(50))
                .andExpect(jsonPath("$[0].status").value("BOOKED"))
                .andExpect(jsonPath("$[0].service.title").value("Hundpromenad"))
                .andExpect(jsonPath("$[0].user.email").value("olle@test.com"));

        verify(bookingService).getMyBookings("olle@test.com");
    }

    @Test
    void getBookingsForMyServices_shouldReturnList() throws Exception {
        when(bookingService.getBookingsForMyServices("cecilia@test.com"))
                .thenReturn(List.of(booking));

        mockMvc.perform(get("/bookings/my-services")
                        .principal(() -> "cecilia@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(50))
                .andExpect(jsonPath("$[0].service.title").value("Hundpromenad"))
                .andExpect(jsonPath("$[0].user.name").value("Olle"));

        verify(bookingService).getBookingsForMyServices("cecilia@test.com");
    }

    @Test
    void cancel_shouldReturnUpdatedBooking() throws Exception {
        booking.setStatus(BookingStatus.CANCELLED);

        when(bookingService.cancelBooking(50L, "olle@test.com"))
                .thenReturn(booking);

        mockMvc.perform(patch("/bookings/50/cancel")
                        .principal(() -> "olle@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(50))
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(bookingService).cancelBooking(50L, "olle@test.com");
    }
}