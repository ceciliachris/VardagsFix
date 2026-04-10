package com.vardagsfix.vardagsfix.repository;

import com.vardagsfix.vardagsfix.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

}
