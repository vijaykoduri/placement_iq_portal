package com.placementiq.service;

import com.placementiq.model.ResumeAnalysis;
import com.placementiq.model.Resume;
import com.placementiq.model.StudentProfile;
import com.placementiq.repository.ResumeAnalysisRepository;
import com.placementiq.repository.ResumeRepository;
import com.placementiq.repository.StudentProfileRepository;
import com.placementiq.util.DsaHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ResumeService {

    @Autowired
    private ResumeAnalysisRepository analysisRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    // Library of recognized technical skills
    private static final Set<String> SKILL_LIBRARY = new HashSet<>(Arrays.asList(
            "Java", "Spring Boot", "SQL", "MySQL", "JavaScript", "HTML", "CSS", "Bootstrap",
            "React", "Angular", "Vue", "Node.js", "Python", "Django", "C++", "C#", "Git", "GitHub",
            "Docker", "Kubernetes", "AWS", "Google Cloud", "Machine Learning", "Data Structures",
            "Algorithms", "DBMS", "Operating Systems", "REST API", "Microservices"
    ));

    // Core developer baseline skills we expect to see
    private static final Set<String> CORE_DEVELOPER_SKILLS = new HashSet<>(Arrays.asList(
            "Java", "Spring Boot", "SQL", "Git", "Data Structures", "Algorithms"
    ));

    public ResumeAnalysis analyzeResume(String username, String resumeText) {
        StudentProfile profile = profileRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Profile not found for " + username));

        // 1. Keyword analysis using HashMap (Skill frequency tracking)
        Map<String, Integer> skillFrequencies = DsaHelper.analyzeSkillFrequency(resumeText, SKILL_LIBRARY);

        // Extracted Skills
        Set<String> extractedSkills = skillFrequencies.keySet();

        // 2. Skill Gap Detection using HashSet (Checking what core dev skills are missing)
        Set<String> missingSkills = DsaHelper.detectSkillGap(extractedSkills, CORE_DEVELOPER_SKILLS);

        // Simple mock extraction of projects and certs based on word matches
        int projectCount = countOccurrences(resumeText.toLowerCase(), "project");
        int certCount = countOccurrences(resumeText.toLowerCase(), "certif");
        
        List<String> extractedProjects = new ArrayList<>();
        if (projectCount > 0) {
            extractedProjects.add("Extracted " + Math.min(projectCount, 3) + " projects from text pattern.");
        } else {
            extractedProjects.add("No explicit project keyword sections detected.");
        }

        List<String> extractedCerts = new ArrayList<>();
        if (certCount > 0) {
            extractedCerts.add("Extracted " + Math.min(certCount, 3) + " certifications from text pattern.");
        } else {
            extractedCerts.add("No explicit certification keyword sections detected.");
        }

        // Scoring Formula
        // - Skills: 5 points each (max 40)
        // - Projects: 15 points each (max 30)
        // - Certifications: 15 points each (max 30)
        int skillsScore = Math.min(extractedSkills.size() * 5, 40);
        int projectsScore = Math.min(Math.max(1, projectCount) * 15, 30);
        int certsScore = Math.min(certCount * 15, 30);
        int totalScore = skillsScore + projectsScore + certsScore;
        totalScore = Math.max(30, Math.min(100, totalScore)); // Bound to 30-100 to reward baseline uploads

        // Generate recommendations
        List<String> recs = new ArrayList<>();
        if (extractedSkills.size() < 5) {
            recs.add("Your resume contains few technical skills. Add modern framework skills like React, Node.js, or Spring Boot.");
        }
        if (projectCount == 0) {
            recs.add("No projects found. Add at least two core engineering projects detailing tech stack and your individual contribution.");
        } else {
            recs.add("Quantify your project metrics (e.g. 'Improved query latency by 20%' or 'Reduced bundle size by 15%') to draw recruiter attention.");
        }
        if (certCount == 0) {
            recs.add("No certifications found. Consider getting certified in professional clouds (AWS, GCP) or core programming languages.");
        }
        if (!missingSkills.isEmpty()) {
            recs.add("Your resume lacks these industry-standard core developer skills: " + String.join(", ", missingSkills));
        }

        // Save or update analysis
        Optional<ResumeAnalysis> existingOpt = analysisRepository.findByStudentProfileId(profile.getId());
        ResumeAnalysis analysis = existingOpt.orElse(new ResumeAnalysis());

        analysis.setStudentProfile(profile);
        analysis.setScore(totalScore);
        analysis.setExtractedSkills(String.join(",", extractedSkills));
        analysis.setExtractedProjects(String.join("; ", extractedProjects));
        analysis.setExtractedCerts(String.join("; ", extractedCerts));
        analysis.setMissingSkills(String.join(",", missingSkills));
        analysis.setRecommendations(String.join("\n", recs));
        analysis.setAnalyzedAt(LocalDateTime.now());

        analysisRepository.save(analysis);

        // Update StudentProfile's resume score
        profile.setResumeScore(totalScore);
        
        // Append missing skills to student skills library automatically if profile has no skills yet to help student get started
        if (profile.getSkills() == null || profile.getSkills().trim().isEmpty()) {
            profile.setSkills(String.join(",", extractedSkills));
        }

        profileRepository.save(profile);

        return analysis;
    }

    private int countOccurrences(String text, String word) {
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(word, idx)) != -1) {
            count++;
            idx += word.length();
        }
        return count;
    }

    public ResumeAnalysis analyzeAndSaveResumeFile(String username, String filename, String resumeText) {
        ResumeAnalysis analysis = analyzeResume(username, resumeText);
        
        StudentProfile profile = profileRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Profile not found for " + username));
                
        Optional<Resume> existingOpt = resumeRepository.findByStudentProfileId(profile.getId());
        Resume resume = existingOpt.orElse(new Resume());
        
        resume.setStudentProfile(profile);
        resume.setFileName(filename);
        resume.setFileContent(resumeText);
        resume.setUploadedAt(LocalDateTime.now());
        
        resumeRepository.save(resume);
        return analysis;
    }
}
