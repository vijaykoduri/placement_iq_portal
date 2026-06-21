package com.placementiq.repository;

import com.placementiq.model.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    Optional<Leaderboard> findByStudentProfileId(Long studentProfileId);
    List<Leaderboard> findAllByOrderByRankAsc();
    void deleteByStudentProfileId(Long studentProfileId);
}
