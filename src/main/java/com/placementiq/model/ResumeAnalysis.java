package com.placementiq.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resume_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    private Integer score; 

    @Column(columnDefinition = "TEXT")
    private String extractedSkills; 
    
    @Column(columnDefinition = "TEXT")
    private String extractedProjects; 
    
    @Column(columnDefinition = "TEXT")
    private String extractedCerts; 
    
    @Column(columnDefinition = "TEXT")
    private String missingSkills; 
    
    @Column(columnDefinition = "TEXT")
    private String recommendations; 
    
    private LocalDateTime analyzedAt;
}
