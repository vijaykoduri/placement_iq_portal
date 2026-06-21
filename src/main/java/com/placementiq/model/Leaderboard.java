package com.placementiq.model;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Leaderboard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", referencedColumnName = "id", nullable = false)
    private StudentProfile studentProfile;

    @Column(name = "rank_val", nullable = false)
    private int rank;

    @Column(name = "coding_score", nullable = false)
    private int codingScore;

    @Column(name = "readiness_score", nullable = false)
    private int readinessScore;

    private LocalDateTime updatedAt;
}
