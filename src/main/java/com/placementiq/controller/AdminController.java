package com.placementiq.controller;

import com.placementiq.model.*;
import com.placementiq.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import com.placementiq.util.DsaHelper;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/companies")
    public ResponseEntity<?> getCompanies() {
        return ResponseEntity.ok(adminService.getAllCompanies());
    }

    @PostMapping("/companies")
    public ResponseEntity<?> saveCompany(@RequestBody Company company) {
        try {
            Company saved = adminService.saveCompany(company);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        try {
            adminService.deleteCompany(id);
            return ResponseEntity.ok(Map.of("message", "Company deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions() {
        return ResponseEntity.ok(adminService.getAllQuestions());
    }

    @PostMapping("/questions")
    public ResponseEntity<?> saveQuestion(@RequestBody InterviewQuestion question) {
        try {
            InterviewQuestion saved = adminService.saveQuestion(question);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        try {
            adminService.deleteQuestion(id);
            return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/challenges")
    public ResponseEntity<?> getChallenges() {
        return ResponseEntity.ok(adminService.getAllChallenges());
    }

    @PostMapping("/challenges")
    public ResponseEntity<?> saveChallenge(@RequestBody CodingChallenge challenge) {
        try {
            CodingChallenge saved = adminService.saveChallenge(challenge);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/challenges/{id}")
    public ResponseEntity<?> deleteChallenge(@PathVariable Long id) {
        try {
            adminService.deleteChallenge(id);
            return ResponseEntity.ok(Map.of("message", "Challenge deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        List<StudentProfile> students = adminService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @PostMapping("/students/{id}/deactivate")
    public ResponseEntity<?> deactivateStudent(@PathVariable Long id) {
        try {
            adminService.deactivateUser(id);
            return ResponseEntity.ok(Map.of("message", "Student deactivated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/companies/{companyId}/eligible/export")
    public ResponseEntity<String> exportEligibleStudents(@PathVariable Long companyId) {
        try {
            Company company = adminService.getCompanyById(companyId);
            List<StudentProfile> students = adminService.getAllStudents();
            
            StringBuilder csv = new StringBuilder();
            csv.append("Student ID,Username,Email,CGPA,Projects Count,Skills,Readiness Score,Coding Score\n");

            Set<String> companySkills = parseSkillsToSet(company.getRequiredSkills());

            for (StudentProfile profile : students) {
                if (profile.getUser().getRole() != Role.STUDENT) continue;
                
                boolean eligible = true;
                
                if (profile.getCgpa() < company.getMinCgpa()) {
                    eligible = false;
                }
                
                if (profile.getProjectsCount() < company.getRequiredProjects()) {
                    eligible = false;
                }
                
                Set<String> studentSkills = parseSkillsToSet(profile.getSkills());
                Set<String> missingSkills = DsaHelper.detectSkillGap(studentSkills, companySkills);
                if (!missingSkills.isEmpty()) {
                    eligible = false;
                }

                if (eligible) {
                    String cleanSkills = profile.getSkills() != null ? profile.getSkills() : "";
                    csv.append(profile.getId()).append(",")
                       .append(profile.getUser().getUsername()).append(",")
                       .append(profile.getUser().getEmail()).append(",")
                       .append(profile.getCgpa()).append(",")
                       .append(profile.getProjectsCount()).append(",")
                       .append("\"").append(cleanSkills.replace("\"", "\"\"")).append("\",")
                       .append(profile.getPlacementReadinessScore()).append(",")
                       .append(profile.getCodingScore()).append("\n");
                }
            }

            String filename = "eligible_students_" + company.getName().replaceAll("[^a-zA-Z0-9]", "_") + ".csv";
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + filename)
                    .header("Content-Type", "text/csv; charset=UTF-8")
                    .body(csv.toString());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error exporting eligible students: " + e.getMessage());
        }
    }

    private Set<String> parseSkillsToSet(String skillsStr) {
        Set<String> set = new HashSet<>();
        if (skillsStr == null || skillsStr.trim().isEmpty()) {
            return set;
        }
        String[] arr = skillsStr.split(",");
        for (String s : arr) {
            if (!s.trim().isEmpty()) {
                set.add(s.trim());
            }
        }
        return set;
    }
}
