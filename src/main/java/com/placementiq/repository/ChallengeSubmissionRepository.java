package com.placementiq.repository;

import com.placementiq.model.ChallengeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChallengeSubmissionRepository extends JpaRepository<ChallengeSubmission, Long> {
    List<ChallengeSubmission> findByStudentProfileId(Long studentProfileId);
    List<ChallengeSubmission> findByStudentProfileIdAndChallengeId(Long studentProfileId, Long challengeId);
    long countByStudentProfileIdAndStatus(Long studentProfileId, String status);
}
