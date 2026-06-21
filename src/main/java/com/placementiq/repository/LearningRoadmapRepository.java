package com.placementiq.repository;

import com.placementiq.model.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, Long> {
    List<LearningRoadmap> findByStudentProfileId(Long studentProfileId);
    List<LearningRoadmap> findByStudentProfileIdAndTargetCompanyId(Long studentProfileId, Long targetCompanyId);
    List<LearningRoadmap> findByStudentProfileIdOrderByGeneratedAtDesc(Long studentProfileId);
}
