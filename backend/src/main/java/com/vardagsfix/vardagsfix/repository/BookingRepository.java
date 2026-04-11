package com.vardagsfix.vardagsfix.repository;

import com.vardagsfix.vardagsfix.model.Booking;
import com.vardagsfix.vardagsfix.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserEmail(String email);

    List<Booking> findByTaskService_User_Email(String email);

    boolean existsByTaskServiceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long serviceId,
            BookingStatus status,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    boolean existsByTaskServiceIdAndStatus(Long serviceId, BookingStatus status);
}