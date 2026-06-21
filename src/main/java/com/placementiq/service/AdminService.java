package com.placementiq.service;

import com.placementiq.model.*;
import com.placementiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdminService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private InterviewQuestionRepository questionRepository;

    @Autowired
    private CodingChallengeRepository challengeRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company saveCompany(Company company) {
        return companyRepository.save(company);
    }

    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }

    public List<InterviewQuestion> getAllQuestions() {
        return questionRepository.findAll();
    }

    public InterviewQuestion saveQuestion(InterviewQuestion question) {
        return questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    public List<CodingChallenge> getAllChallenges() {
        return challengeRepository.findAll();
    }

    public CodingChallenge saveChallenge(CodingChallenge challenge) {
        return challengeRepository.save(challenge);
    }

    public void deleteChallenge(Long id) {
        challengeRepository.deleteById(id);
    }

    public List<StudentProfile> getAllStudents() {
        return profileRepository.findAll();
    }

    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", profileRepository.count());
        stats.put("totalCompanies", companyRepository.count());
        stats.put("totalQuestions", questionRepository.count());
        stats.put("totalChallenges", challengeRepository.count());
        return stats;
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    }

    public void deactivateUser(Long userId) {
        userRepository.findById(userId).ifPresent(user -> userRepository.delete(user));
    }
}
