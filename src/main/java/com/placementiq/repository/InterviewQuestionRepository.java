package com.placementiq.repository;

import com.placementiq.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByCategoryIgnoreCase(String category);
    List<InterviewQuestion> findByCompanyNameIgnoreCase(String companyName);
    List<InterviewQuestion> findByQuestionContainingIgnoreCaseOrAnswerContainingIgnoreCase(String query1, String query2);
}
