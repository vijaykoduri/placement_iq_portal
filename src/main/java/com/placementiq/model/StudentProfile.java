package com.placementiq.model;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    private Double cgpa = 0.0;
    private Integer dsaRating = 0; 
    private Integer projectsCount = 0;
    private Integer internshipsCount = 0;
    private Integer certificationsCount = 0;
    private Integer communicationScore = 0; 

    private Integer placementReadinessScore = 0;
    private Integer resumeScore = 0;
    private Integer codingScore = 0;

    @Column(columnDefinition = "TEXT")
    private String skills = ""; 

    private String bio = "";

    private Integer solvedChallengesCount = 0;
    private Integer currentStreak = 0;

    @Column(columnDefinition = "TEXT")
    private String badges = "";
    
    public int getProfileCompletionPercentage() {
        int filledFields = 0;
        int totalFields = 7;
        if (cgpa != null && cgpa > 0) filledFields++;
        if (dsaRating != null && dsaRating > 0) filledFields++;
        if (projectsCount != null && projectsCount > 0) filledFields++;
        if (internshipsCount != null && internshipsCount > 0) filledFields++;
        if (certificationsCount != null && certificationsCount > 0) filledFields++;
        if (communicationScore != null && communicationScore > 0) filledFields++;
        if (skills != null && !skills.trim().isEmpty()) filledFields++;
        return (filledFields * 100) / totalFields;
    }
}
