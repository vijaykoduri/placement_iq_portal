package com.placementiq.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "learning_roadmaps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningRoadmap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    @JsonIgnore
    private StudentProfile studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_company_id", nullable = false)
    @JsonIgnore
    private Company targetCompany;

    private Integer availableDays;

    @Column(columnDefinition = "TEXT")
    private String roadmapJson; 
    
    @Column(columnDefinition = "TEXT")
    private String completedTopics = "";

    private LocalDateTime generatedAt;
}
