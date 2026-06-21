package com.placementiq.controller;

import com.placementiq.model.*;
import com.placementiq.repository.InterviewQuestionRepository;
import com.placementiq.repository.ResumeAnalysisRepository;
import com.placementiq.service.ResumeService;
import com.placementiq.service.StudentService;
import com.placementiq.util.DsaHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private InterviewQuestionRepository questionRepository;

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    private String getAuthenticatedUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            StudentProfile profile = studentService.getProfileByUsername(getAuthenticatedUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("profile", profile);
            response.put("profileCompletion", profile.getProfileCompletionPercentage());
            
            Optional<ResumeAnalysis> analysis = resumeAnalysisRepository.findByStudentProfileId(profile.getId());
            response.put("resumeAnalysis", analysis.orElse(null));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody StudentProfile profileData) {
        try {
            StudentProfile updated = studentService.updateProfile(getAuthenticatedUsername(), profileData);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/readiness")
    public ResponseEntity<?> calculateReadiness() {
        try {
            StudentProfile profile = studentService.getProfileByUsername(getAuthenticatedUsername());
            int score = studentService.calculateAndSaveReadinessScore(profile);
            return ResponseEntity.ok(Map.of("placementReadinessScore", score));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resume/analyze")
    public ResponseEntity<?> analyzeResume(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("resumeText");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Resume text is empty"));
            }
            ResumeAnalysis analysis = resumeService.analyzeResume(getAuthenticatedUsername(), text);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resume/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty"));
            }
            
            String filename = file.getOriginalFilename();
            String extractedText = "";

            if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    extractedText = stripper.getText(document);
                }
            } else {
                extractedText = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            }

            if (extractedText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Could not extract any text from the file"));
            }

            ResumeAnalysis analysis = resumeService.analyzeAndSaveResumeFile(getAuthenticatedUsername(), filename, extractedText);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to process resume: " + e.getMessage()));
        }
    }

    @GetMapping("/eligibility")
    public ResponseEntity<?> checkEligibility() {
        try {
            List<Map<String, Object>> eligibility = studentService.checkCompanyEligibility(getAuthenticatedUsername());
            return ResponseEntity.ok(eligibility);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/gap/{companyId}")
    public ResponseEntity<?> checkSkillGap(@PathVariable Long companyId) {
        try {
            Map<String, Object> gap = studentService.analyzeSkillGapForCompany(getAuthenticatedUsername(), companyId);
            return ResponseEntity.ok(gap);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(@RequestParam(required = false) String category,
                                          @RequestParam(required = false) String search) {
        try {
            List<InterviewQuestion> questions;
            if (search != null && !search.trim().isEmpty()) {
                questions = questionRepository.findByQuestionContainingIgnoreCaseOrAnswerContainingIgnoreCase(search, search);
            } else if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) {
                List<InterviewQuestion> allQuestions = questionRepository.findAll();
                DsaHelper.CategoryNode root = DsaHelper.buildQuestionTree(allQuestions);
                
                String[] path = category.split("/");
                DsaHelper.CategoryNode current = root;
                for (String part : path) {
                    if (current != null) {
                        current = current.getChildren().get(part);
                    }
                }
                
                if (current != null) {
                    questions = current.getAllQuestionsUnder();
                } else {
                    questions = questionRepository.findByCategoryIgnoreCase(category);
                }
            } else {
                questions = questionRepository.findAll();
            }
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/challenges")
    public ResponseEntity<?> getChallenges() {
        try {
            List<CodingChallenge> challenges = studentService.getAllChallenges();
            return ResponseEntity.ok(challenges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/challenges/{id}/latest")
    public ResponseEntity<?> getLatestSubmission(@PathVariable Long id) {
        try {
            Optional<ChallengeSubmission> submissionOpt = studentService.getLatestSubmission(getAuthenticatedUsername(), id);
            return ResponseEntity.ok(submissionOpt.orElse(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/challenges/{id}/submit")
    public ResponseEntity<?> submitSolution(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Map<String, Object> result = studentService.submitChallengeSolution(getAuthenticatedUsername(), id, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        try {
            List<Map<String, Object>> leaderboard = studentService.getLeaderboard();
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/roadmap")
    public ResponseEntity<?> generateRoadmap(@RequestBody Map<String, Object> request) {
        try {
            Long companyId = Long.parseLong(request.get("companyId").toString());
            int availableDays = Integer.parseInt(request.get("availableDays").toString());
            LearningRoadmap roadmap = studentService.generateRoadmap(getAuthenticatedUsername(), companyId, availableDays);
            return ResponseEntity.ok(roadmap);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/roadmap")
    public ResponseEntity<?> getActiveRoadmap() {
        try {
            Optional<LearningRoadmap> roadmapOpt = studentService.getActiveRoadmap(getAuthenticatedUsername());
            return ResponseEntity.ok(roadmapOpt.orElse(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/roadmap/toggle")
    public ResponseEntity<?> toggleRoadmapTopic(@RequestBody Map<String, String> request) {
        try {
            String topic = request.get("topic");
            if (topic == null || topic.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Topic name is empty"));
            }
            LearningRoadmap updated = studentService.toggleRoadmapTopic(getAuthenticatedUsername(), topic);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
