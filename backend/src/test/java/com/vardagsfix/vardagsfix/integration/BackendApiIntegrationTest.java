package com.vardagsfix.vardagsfix.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vardagsfix.vardagsfix.repository.AvailableSlotRepository;
import com.vardagsfix.vardagsfix.repository.BookingRepository;
import com.vardagsfix.vardagsfix.repository.ServiceRepository;
import com.vardagsfix.vardagsfix.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "jwt.secret=test-secret-key-for-integration-tests-that-is-long-enough",
        "spring.datasource.url=jdbc:h2:mem:vardagsfix-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "logging.level.org.springframework.security=WARN"
})
class BackendApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AvailableSlotRepository availableSlotRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void protectedEndpoint_shouldReturnClientError_whenTokenIsMissing() throws Exception {
        mockMvc.perform(get("/services"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void createService_shouldReturnBadRequest_whenSlotsOverlap() throws Exception {
        clearDatabase();

        String ownerToken = registerAndLogin("Owner", uniqueEmail("owner"));

        String requestBody = """
                {
                  "title": "Hundpromenad",
                  "description": "Promenerar hund i området",
                  "price": 200,
                  "location": "Malmö",
                  "availableSlots": [
                    {
                      "startTime": "2035-05-01T10:00:00",
                      "endTime": "2035-05-01T11:00:00"
                    },
                    {
                      "startTime": "2035-05-01T10:30:00",
                      "endTime": "2035-05-01T11:30:00"
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/services")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message", containsString("overlap")));
    }

    @Test
    void createService_shouldReturnBadRequest_whenSlotIsInPast() throws Exception {
        clearDatabase();

        String ownerToken = registerAndLogin("Owner", uniqueEmail("owner"));

        String requestBody = """
                {
                  "title": "Hundpromenad",
                  "description": "Promenerar hund i området",
                  "price": 200,
                  "location": "Malmö",
                  "availableSlots": [
                    {
                      "startTime": "2020-05-01T10:00:00",
                      "endTime": "2020-05-01T11:00:00"
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/services")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void createBooking_shouldCreateBookingAndReturnBookedStatus_whenRequestIsValid() throws Exception {
        clearDatabase();

        String ownerToken = registerAndLogin("Owner", uniqueEmail("owner"));
        String bookerToken = registerAndLogin("Booker", uniqueEmail("booker"));

        JsonNode serviceJson = createService(ownerToken);
        long serviceId = serviceJson.get("id").asLong();
        long slotId = serviceJson.get("availableSlots").get(0).get("id").asLong();

        String bookingRequest = """
                {
                  "serviceId": %d,
                  "slotId": %d,
                  "message": "Hej! Jag vill boka denna tid."
                }
                """.formatted(serviceId, slotId);

        mockMvc.perform(post("/bookings")
                        .header("Authorization", bearer(bookerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BOOKED"))
                .andExpect(jsonPath("$.message").value("Hej! Jag vill boka denna tid."))
                .andExpect(jsonPath("$.service.id").value(serviceId))
                .andExpect(jsonPath("$.service.title").value("Hundpromenad"));
    }

    @Test
    void createBooking_shouldReturnForbidden_whenUserBooksOwnService() throws Exception {
        clearDatabase();

        String ownerToken = registerAndLogin("Owner", uniqueEmail("owner"));

        JsonNode serviceJson = createService(ownerToken);
        long serviceId = serviceJson.get("id").asLong();
        long slotId = serviceJson.get("availableSlots").get(0).get("id").asLong();

        String bookingRequest = """
                {
                  "serviceId": %d,
                  "slotId": %d,
                  "message": "Jag försöker boka min egen tjänst."
                }
                """.formatted(serviceId, slotId);

        mockMvc.perform(post("/bookings")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingRequest))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void createBooking_shouldReturnBadRequest_whenSlotIsAlreadyBooked() throws Exception {
        clearDatabase();

        String ownerToken = registerAndLogin("Owner", uniqueEmail("owner"));
        String firstBookerToken = registerAndLogin("First Booker", uniqueEmail("first-booker"));
        String secondBookerToken = registerAndLogin("Second Booker", uniqueEmail("second-booker"));

        JsonNode serviceJson = createService(ownerToken);
        long serviceId = serviceJson.get("id").asLong();
        long slotId = serviceJson.get("availableSlots").get(0).get("id").asLong();

        String bookingRequest = """
                {
                  "serviceId": %d,
                  "slotId": %d,
                  "message": "Jag vill boka tiden."
                }
                """.formatted(serviceId, slotId);

        mockMvc.perform(post("/bookings")
                        .header("Authorization", bearer(firstBookerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BOOKED"));

        mockMvc.perform(post("/bookings")
                        .header("Authorization", bearer(secondBookerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingRequest))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message", containsString("already booked")));
    }

    private JsonNode createService(String token) throws Exception {
        String requestBody = """
                {
                  "title": "Hundpromenad",
                  "description": "Promenerar hund i området",
                  "price": 200,
                  "location": "Malmö",
                  "availableSlots": [
                    {
                      "startTime": "2035-05-01T10:00:00",
                      "endTime": "2035-05-01T11:00:00"
                    }
                  ]
                }
                """;

        MvcResult result = mockMvc.perform(post("/services")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String registerAndLogin(String name, String email) throws Exception {
        String password = "password123";

        String registerRequest = """
                {
                  "name": "%s",
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(name, email, password);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isOk());

        String loginRequest = """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password);

        MvcResult loginResult = mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk())
                .andReturn();

        return loginResult.getResponse().getContentAsString();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.com";
    }

    private void clearDatabase() {
        bookingRepository.deleteAll();
        availableSlotRepository.deleteAll();
        serviceRepository.deleteAll();
        userRepository.deleteAll();
    }
}