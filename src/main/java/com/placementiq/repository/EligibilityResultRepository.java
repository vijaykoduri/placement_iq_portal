package com.placementiq.repository;

import com.placementiq.model.EligibilityResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EligibilityResultRepository extends JpaRepository<EligibilityResult, Long> {
    List<EligibilityResult> findByStudentProfileId(Long studentProfileId);
    Optional<EligibilityResult> findByStudentProfileIdAndCompanyId(Long studentProfileId, Long companyId);
    void deleteByStudentProfileId(Long studentProfileId);
}
