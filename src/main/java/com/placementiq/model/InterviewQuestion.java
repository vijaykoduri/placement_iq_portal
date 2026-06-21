package com.placementiq.model;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

@Entity
@Table(name = "interview_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category; 
    private String difficulty; 
    
    @Column(columnDefinition = "TEXT")
    private String question;
    
    @Column(columnDefinition = "TEXT")
    private String answer;
    
    private String companyName; 

    @Column(columnDefinition = "TEXT")
    private String optionA;

    @Column(columnDefinition = "TEXT")
    private String optionB;

    @Column(columnDefinition = "TEXT")
    private String optionC;

    @Column(columnDefinition = "TEXT")
    private String optionD;

    private String correctOption; // "A", "B", "C", or "D"

    @Column(columnDefinition = "TEXT")
    private String explanation;

    public InterviewQuestion(Long id, String category, String difficulty, String question, String answer, String companyName) {
        this.id = id;
        this.category = category;
        this.difficulty = difficulty;
        this.question = question;
        this.answer = answer;
        this.companyName = companyName;

        String optCorrect = answer;
        String optWrong1 = "It is an outdated utility to compile source code directly into native machine instructions to bypass runtime checks.";
        String optWrong2 = "It is a strict security mechanism that prevents unauthorized remote memory access or thread scheduling.";
        String optWrong3 = "It is a design pattern used to optimize database schemas and automatically normalize relational tables.";

        List<String> opts = new ArrayList<>(Arrays.asList(optCorrect, optWrong1, optWrong2, optWrong3));
        Collections.shuffle(opts);

        this.optionA = opts.get(0);
        this.optionB = opts.get(1);
        this.optionC = opts.get(2);
        this.optionD = opts.get(3);

        int correctIdx = opts.indexOf(optCorrect);
        this.correctOption = String.valueOf((char) ('A' + correctIdx));
        this.explanation = "The correct answer is " + this.correctOption + ": " + answer;
    }

    @PrePersist
    @PreUpdate
    public void ensureMcqOptions() {
        if (this.optionA == null || this.optionA.trim().isEmpty()) {
            String optCorrect = this.answer != null ? this.answer : "Correct definition";
            String optWrong1 = "It is an outdated utility to compile source code directly into native machine instructions to bypass runtime checks.";
            String optWrong2 = "It is a strict security mechanism that prevents unauthorized remote memory access or thread scheduling.";
            String optWrong3 = "It is a design pattern used to optimize database schemas and automatically normalize relational tables.";

            List<String> opts = new ArrayList<>(Arrays.asList(optCorrect, optWrong1, optWrong2, optWrong3));
            Collections.shuffle(opts);

            this.optionA = opts.get(0);
            this.optionB = opts.get(1);
            this.optionC = opts.get(2);
            this.optionD = opts.get(3);

            int correctIdx = opts.indexOf(optCorrect);
            this.correctOption = String.valueOf((char) ('A' + correctIdx));
        }
        if (this.explanation == null || this.explanation.trim().isEmpty()) {
            this.explanation = "The correct answer is " + this.correctOption + ": " + this.answer;
        }
    }
}
