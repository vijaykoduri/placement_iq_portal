package com.placementiq.repository;

import com.placementiq.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserUsername(String username);
    Optional<StudentProfile> findByUserId(Long userId);
}
