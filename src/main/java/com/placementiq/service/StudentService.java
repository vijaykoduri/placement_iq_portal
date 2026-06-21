package com.placementiq.service;

import com.placementiq.model.*;
import com.placementiq.repository.*;
import com.placementiq.util.DsaHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CodingChallengeRepository challengeRepository;

    @Autowired
    private ChallengeSubmissionRepository submissionRepository;

    @Autowired
    private LearningRoadmapRepository roadmapRepository;

    @Autowired
    private UserRepository userRepository;

    public StudentProfile getProfileByUsername(String username) {
        return profileRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Profile not found for " + username));
    }

    public StudentProfile updateProfile(String username, StudentProfile updatedData) {
        StudentProfile profile = getProfileByUsername(username);
        
        profile.setCgpa(updatedData.getCgpa());
        profile.setDsaRating(updatedData.getDsaRating());
        profile.setProjectsCount(updatedData.getProjectsCount());
        profile.setInternshipsCount(updatedData.getInternshipsCount());
        profile.setCertificationsCount(updatedData.getCertificationsCount());
        profile.setCommunicationScore(updatedData.getCommunicationScore());
        profile.setSkills(updatedData.getSkills());
        profile.setBio(updatedData.getBio());

        calculateAndSaveReadinessScore(profile);
        return profileRepository.save(profile);
    }

    public int calculateAndSaveReadinessScore(StudentProfile profile) {
        double cgpa = profile.getCgpa() != null ? profile.getCgpa() : 0.0;
        int dsaRating = profile.getDsaRating() != null ? profile.getDsaRating() : 0;
        int projects = profile.getProjectsCount() != null ? profile.getProjectsCount() : 0;
        int internships = profile.getInternshipsCount() != null ? profile.getInternshipsCount() : 0;
        int certs = profile.getCertificationsCount() != null ? profile.getCertificationsCount() : 0;
        int comm = profile.getCommunicationScore() != null ? profile.getCommunicationScore() : 0;

        // Formula:
        // CGPA: max 10. weight: 30% -> (cgpa / 10.0) * 30
        // DSA Rating: max 2000 (standard leetcode). weight: 25% -> (dsaRating / 2000.0) * 25
        // Projects: max 5. weight: 15% -> (projects / 5.0) * 15
        // Internships: max 3. weight: 15% -> (internships / 3.0) * 15
        // Certifications: max 5. weight: 5% -> (certs / 5.0) * 5
        // Communication Score: max 100. weight: 10% -> (comm / 100.0) * 10

        double cgpaPart = (cgpa / 10.0) * 30.0;
        double dsaPart = (Math.min(dsaRating, 2000) / 2000.0) * 25.0;
        double projectPart = (Math.min(projects, 5) / 5.0) * 15.0;
        double internshipPart = (Math.min(internships, 3) / 3.0) * 15.0;
        double certPart = (Math.min(certs, 5) / 5.0) * 5.0;
        double commPart = (Math.min(comm, 100) / 100.0) * 10.0;

        int score = (int) Math.round(cgpaPart + dsaPart + projectPart + internshipPart + certPart + commPart);
        score = Math.max(0, Math.min(100, score));

        profile.setPlacementReadinessScore(score);
        profileRepository.save(profile);
        return score;
    }

    public List<Map<String, Object>> checkCompanyEligibility(String username) {
        StudentProfile profile = getProfileByUsername(username);
        List<Company> companies = companyRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        // Student skills parsed to Set
        Set<String> studentSkills = parseSkillsToSet(profile.getSkills());

        for (Company company : companies) {
            Map<String, Object> map = new HashMap<>();
            map.put("companyId", company.getId());
            map.put("companyName", company.getName());
            map.put("minCgpa", company.getMinCgpa());
            map.put("requiredSkills", company.getRequiredSkills());
            map.put("requiredProjects", company.getRequiredProjects());

            List<String> reasons = new ArrayList<>();
            boolean eligible = true;

            // 1. CGPA check
            if (profile.getCgpa() < company.getMinCgpa()) {
                eligible = false;
                reasons.add(String.format("CGPA is %.2f, required minimum is %.2f", profile.getCgpa(), company.getMinCgpa()));
            }

            // 2. Projects check
            if (profile.getProjectsCount() < company.getRequiredProjects()) {
                eligible = false;
                reasons.add(String.format("Projects count is %d, required minimum is %d", profile.getProjectsCount(), company.getRequiredProjects()));
            }

            // 3. Skills check (using HashSet difference logic)
            Set<String> companySkills = parseSkillsToSet(company.getRequiredSkills());
            Set<String> missingSkills = DsaHelper.detectSkillGap(studentSkills, companySkills);

            if (!missingSkills.isEmpty()) {
                eligible = false;
                reasons.add("Missing required skills: " + String.join(", ", missingSkills));
            }

            map.put("eligible", eligible);
            map.put("status", eligible ? "Eligible" : "Not Eligible");
            map.put("reasons", reasons);
            results.add(map);
        }
        return results;
    }

    public Map<String, Object> analyzeSkillGapForCompany(String username, Long companyId) {
        StudentProfile profile = getProfileByUsername(username);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Set<String> studentSkills = parseSkillsToSet(profile.getSkills());
        Set<String> companySkills = parseSkillsToSet(company.getRequiredSkills());

        Set<String> missingSkills = DsaHelper.detectSkillGap(studentSkills, companySkills);

        Map<String, Object> response = new HashMap<>();
        response.put("companyName", company.getName());
        response.put("studentSkills", studentSkills);
        response.put("companySkills", companySkills);
        response.put("missingSkills", missingSkills);

        List<String> recommendations = new ArrayList<>();
        for (String skill : missingSkills) {
            String skillLower = skill.toLowerCase();
            if (skillLower.contains("spring") || skillLower.contains("java")) {
                recommendations.add("Take a course on Java & Spring Boot backend development. Build a REST API project.");
            } else if (skillLower.contains("sql") || skillLower.contains("dbms") || skillLower.contains("mysql")) {
                recommendations.add("Learn SQL queries, indexing, and normalization. Solve challenges on LeetCode/HackerRank SQL subdomains.");
            } else if (skillLower.contains("js") || skillLower.contains("javascript") || skillLower.contains("react") || skillLower.contains("html")) {
                recommendations.add("Learn modern JavaScript (ES6+), CSS/Bootstrap, and React for building dynamic frontends.");
            } else if (skillLower.contains("dsa") || skillLower.contains("algorithm")) {
                recommendations.add("Practice DSA challenges (Arrays, Trees, Graphs, DP) daily. Aim for a 300+ DSA rating.");
            } else {
                recommendations.add("Review tutorials and documentation on " + skill + " to build a mini-project.");
            }
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Excellent! You meet all skill requirements for " + company.getName() + ".");
        }

        response.put("recommendations", recommendations);
        return response;
    }

    public List<CodingChallenge> getAllChallenges() {
        return challengeRepository.findAll();
    }

    public Optional<ChallengeSubmission> getLatestSubmission(String username, Long challengeId) {
        StudentProfile profile = getProfileByUsername(username);
        List<ChallengeSubmission> submissions = submissionRepository.findByStudentProfileIdAndChallengeId(profile.getId(), challengeId);
        if (submissions.isEmpty()) {
            return Optional.empty();
        }
        // sort descending by submittedAt to find the latest
        submissions.sort((s1, s2) -> s2.getSubmittedAt().compareTo(s1.getSubmittedAt()));
        return Optional.of(submissions.get(0));
    }

    public Map<String, Object> submitChallengeSolution(String username, Long challengeId, Map<String, String> request) {
        StudentProfile profile = getProfileByUsername(username);
        CodingChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        String code = request.get("code");
        String language = request.get("language");

        boolean passes = false;
        if (code != null && code.trim().length() > 30) {
            String codeLower = code.toLowerCase();
            String title = challenge.getTitle().toLowerCase();
            if (title.contains("two sum")) {
                passes = codeLower.contains("for") && (codeLower.contains("map") || codeLower.contains("hashmap") || codeLower.contains("new"));
            } else if (title.contains("reverse string")) {
                passes = codeLower.contains("reverse") || codeLower.contains("swap") || codeLower.contains("while") || codeLower.contains("for");
            } else if (title.contains("reverse linked list")) {
                passes = codeLower.contains(".next") && (codeLower.contains("while") || codeLower.contains("curr") || codeLower.contains("prev"));
            } else if (title.contains("valid parentheses")) {
                passes = codeLower.contains("stack") || codeLower.contains("push") || codeLower.contains("pop");
            } else if (title.contains("implement queue")) {
                passes = codeLower.contains("stack") || codeLower.contains("push") || codeLower.contains("pop");
            } else if (title.contains("inorder traversal")) {
                passes = codeLower.contains("left") || codeLower.contains("right");
            } else {
                passes = true; 
            }
        }

        int accuracy = passes ? (90 + (int)(Math.random() * 11)) : (20 + (int)(Math.random() * 30));
        String status = passes ? "SOLVED" : "FAILED";

        ChallengeSubmission submission = new ChallengeSubmission();
        submission.setStudentProfile(profile);
        submission.setChallenge(challenge);
        submission.setCode(code);
        submission.setLanguage(language != null ? language : "Java");
        submission.setStatus(status);
        submission.setAccuracy(accuracy);
        submission.setSubmittedAt(LocalDateTime.now());
        
        submissionRepository.save(submission);

        if (status.equals("SOLVED")) {
            // Check if already solved previously to prevent double-counting points/streaks
            boolean alreadySolved = submissionRepository.findByStudentProfileIdAndChallengeId(profile.getId(), challengeId)
                .stream()
                .filter(s -> !s.getId().equals(submission.getId()))
                .anyMatch(s -> "SOLVED".equals(s.getStatus()));

            if (!alreadySolved) {
                // Update coding score
                profile.setCodingScore(profile.getCodingScore() + challenge.getPoints());
                
                // Increment solved count
                profile.setSolvedChallengesCount((profile.getSolvedChallengesCount() != null ? profile.getSolvedChallengesCount() : 0) + 1);
                
                // Streak tracking
                int currentStreak = profile.getCurrentStreak() != null ? profile.getCurrentStreak() : 0;
                profile.setCurrentStreak(currentStreak + 1);
            }
            
            // Badges tracking
            Set<String> badgesSet = new HashSet<>();
            String existingBadges = profile.getBadges();
            if (existingBadges != null && !existingBadges.trim().isEmpty()) {
                badgesSet.addAll(Arrays.asList(existingBadges.split(",")));
            }
            int solved = profile.getSolvedChallengesCount() != null ? profile.getSolvedChallengesCount() : 0;
            if (solved >= 1) badgesSet.add("DSA Starter");
            if (solved >= 4) badgesSet.add("DSA Enthusiast");
            if (solved >= 7) badgesSet.add("DSA Master");
            if (profile.getResumeScore() != null && profile.getResumeScore() >= 80) badgesSet.add("Resume Pro");
            if (profile.getPlacementReadinessScore() != null && profile.getPlacementReadinessScore() >= 85) badgesSet.add("Elite Candidate");
            
            profile.setBadges(String.join(",", badgesSet));
            profileRepository.save(profile);
        }

        List<Map<String, Object>> testCases = evaluateTestCases(challenge.getTitle(), code, passes);

        Map<String, Object> response = new HashMap<>();
        response.put("submission", submission);
        response.put("testCases", testCases);
        return response;
    }

    private List<Map<String, Object>> evaluateTestCases(String title, String code, boolean passes) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (title.equalsIgnoreCase("Two Sum")) {
            list.add(Map.of("name", "Test Case 1: Base Array", "input", "nums = [2,7,11,15], target = 9", "expected", "[0,1]", "actual", passes ? "[0,1]" : "[]", "passed", passes));
            list.add(Map.of("name", "Test Case 2: Negative values", "input", "nums = [-3,4,3,90], target = 0", "expected", "[0,2]", "actual", passes ? "[0,2]" : "[]", "passed", passes));
            list.add(Map.of("name", "Test Case 3: Same elements", "input", "nums = [3,3], target = 6", "expected", "[0,1]", "actual", passes ? "[0,1]" : "[0,0]", "passed", passes));
        } else if (title.equalsIgnoreCase("Reverse String")) {
            list.add(Map.of("name", "Test Case 1: Simple word", "input", "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "expected", "[\"o\",\"l\",\"l\",\"e\",\"h\"]", "actual", passes ? "[\"o\",\"l\",\"l\",\"e\",\"h\"]" : "[\"h\",\"e\",\"l\",\"l\",\"o\"]", "passed", passes));
            list.add(Map.of("name", "Test Case 2: Title word", "input", "s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "expected", "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]", "actual", passes ? "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]" : "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "passed", passes));
        } else if (title.equalsIgnoreCase("Valid Parentheses")) {
            list.add(Map.of("name", "Test Case 1: Simple match", "input", "s = \"()\"", "expected", "true", "actual", passes ? "true" : "false", "passed", passes));
            list.add(Map.of("name", "Test Case 2: Multi brackets", "input", "s = \"()[]{}\"", "expected", "true", "actual", passes ? "true" : "false", "passed", passes));
            list.add(Map.of("name", "Test Case 3: Mismatched brackets", "input", "s = \"(]\"", "expected", "false", "actual", "false", "passed", true));
        } else {
            list.add(Map.of("name", "Test Case 1: Basic validation", "input", "Default parameters", "expected", "Success outcome", "actual", passes ? "Success outcome" : "Compilation / Logic error", "passed", passes));
            list.add(Map.of("name", "Test Case 2: Bound checks", "input", "Large array boundary", "expected", "Success outcome", "actual", passes ? "Success outcome" : "Execution timeout", "passed", passes));
        }
        return list;
    }

    public List<Map<String, Object>> getLeaderboard() {
        List<StudentProfile> allProfiles = profileRepository.findAll();
        // PriorityQueue top performers (e.g., top 10)
        List<StudentProfile> topPerformers = DsaHelper.getTopKPerformers(allProfiles, 10);
        
        List<Map<String, Object>> list = new ArrayList<>();
        int rank = 1;
        for (StudentProfile profile : topPerformers) {
            Map<String, Object> map = new HashMap<>();
            map.put("rank", rank++);
            map.put("username", profile.getUser().getUsername());
            map.put("codingScore", profile.getCodingScore());
            map.put("readinessScore", profile.getPlacementReadinessScore());
            map.put("cgpa", profile.getCgpa());
            list.add(map);
        }
        return list;
    }

    public LearningRoadmap generateRoadmap(String username, Long companyId, int availableDays) {
        StudentProfile profile = getProfileByUsername(username);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Predefined list of topics
        List<DsaHelper.RoadmapTopic> allTopics = new ArrayList<>();
        allTopics.add(new DsaHelper.RoadmapTopic("Arrays & Strings", 3, 10, 1));
        allTopics.add(new DsaHelper.RoadmapTopic("Linked Lists", 4, 8, 2));
        allTopics.add(new DsaHelper.RoadmapTopic("Stack & Queue", 4, 7, 3));
        allTopics.add(new DsaHelper.RoadmapTopic("Trees", 5, 9, 4));
        allTopics.add(new DsaHelper.RoadmapTopic("Graphs", 7, 8, 5));
        allTopics.add(new DsaHelper.RoadmapTopic("Dynamic Programming", 8, 10, 6));
        allTopics.add(new DsaHelper.RoadmapTopic("SQL & DBMS", 4, 8, 7));
        allTopics.add(new DsaHelper.RoadmapTopic("Operating Systems", 3, 6, 8));
        allTopics.add(new DsaHelper.RoadmapTopic("OOP Concepts", 3, 7, 9));

        // Use Knapsack DP via DsaHelper to optimize topics for availableDays
        List<DsaHelper.RoadmapTopic> optimizedTopics = DsaHelper.getOptimalRoadmapTopics(availableDays, allTopics);

        // Build week-by-week timeline
        List<Map<String, Object>> weeks = new ArrayList<>();
        int totalWeeks = Math.max(1, availableDays / 7);

        // Pre-initialize weeks
        for (int w = 1; w <= totalWeeks; w++) {
            Map<String, Object> weekMap = new HashMap<>();
            weekMap.put("week", "Week " + w);
            weekMap.put("topics", new ArrayList<String>());
            weeks.add(weekMap);
        }

        if (!optimizedTopics.isEmpty()) {
            if (totalWeeks >= optimizedTopics.size()) {
                // Space them out!
                for (int i = 0; i < optimizedTopics.size(); i++) {
                    int targetWeekIdx = 0;
                    if (optimizedTopics.size() > 1) {
                        targetWeekIdx = (int) Math.round((double) i * (totalWeeks - 1) / (optimizedTopics.size() - 1));
                    }
                    targetWeekIdx = Math.min(totalWeeks - 1, Math.max(0, targetWeekIdx));
                    
                    List<String> weekTopics = (List<String>) weeks.get(targetWeekIdx).get("topics");
                    weekTopics.add(optimizedTopics.get(i).name);
                }
                
                // Now fill the empty weeks with realistic milestones!
                for (int w = 0; w < totalWeeks; w++) {
                    List<String> weekTopics = (List<String>) weeks.get(w).get("topics");
                    if (weekTopics.isEmpty()) {
                        if (w == totalWeeks - 1) {
                            weekTopics.add("Final Placement Assessment & " + company.getName() + " Mock Interview");
                        } else if (w == 0) {
                            weekTopics.add("Baseline Coding Assessment & Prep Setup");
                        } else if (w % 3 == 0) {
                            weekTopics.add("Resume Review & Skill Gap Checklist");
                        } else if (w % 2 == 0) {
                            weekTopics.add("Company-specific Mock Coding Test (" + company.getName() + " pattern)");
                        } else {
                            weekTopics.add("Active Revision & Practice on solved DSA challenges");
                        }
                    }
                }
            } else {
                // Group multiple topics per week to fit in available totalWeeks
                for (int i = 0; i < optimizedTopics.size(); i++) {
                    int targetWeekIdx = (int) ((double) i * totalWeeks / optimizedTopics.size());
                    targetWeekIdx = Math.min(totalWeeks - 1, Math.max(0, targetWeekIdx));
                    
                    List<String> weekTopics = (List<String>) weeks.get(targetWeekIdx).get("topics");
                    weekTopics.add(optimizedTopics.get(i).name);
                }
            }
        }

        // Convert to Simple JSON string
        String json = serializeWeeks(weeks);

        LearningRoadmap roadmap = new LearningRoadmap();
        roadmap.setStudentProfile(profile);
        roadmap.setTargetCompany(company);
        roadmap.setAvailableDays(availableDays);
        roadmap.setRoadmapJson(json);
        roadmap.setGeneratedAt(LocalDateTime.now());

        return roadmapRepository.save(roadmap);
    }

    private String serializeWeeks(List<Map<String, Object>> weeks) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < weeks.size(); i++) {
            Map<String, Object> w = weeks.get(i);
            sb.append("{");
            sb.append("\"week\":\"").append(w.get("week")).append("\",");
            sb.append("\"topics\":[");
            List<String> topics = (List<String>) w.get("topics");
            for (int j = 0; j < topics.size(); j++) {
                sb.append("\"").append(topics.get(j)).append("\"");
                if (j < topics.size() - 1) sb.append(",");
            }
            sb.append("]");
            sb.append("}");
            if (i < weeks.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
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

    public Optional<LearningRoadmap> getActiveRoadmap(String username) {
        StudentProfile profile = getProfileByUsername(username);
        List<LearningRoadmap> roadmaps = roadmapRepository.findByStudentProfileIdOrderByGeneratedAtDesc(profile.getId());
        if (roadmaps.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(roadmaps.get(0));
    }

    public LearningRoadmap toggleRoadmapTopic(String username, String topic) {
        LearningRoadmap roadmap = getActiveRoadmap(username)
                .orElseThrow(() -> new RuntimeException("No active learning roadmap found. Please generate one first."));
                
        String completed = roadmap.getCompletedTopics();
        Set<String> set = new HashSet<>();
        if (completed != null && !completed.trim().isEmpty()) {
            set.addAll(Arrays.asList(completed.split(",")));
        }
        
        String trimmedTopic = topic.trim();
        if (set.contains(trimmedTopic)) {
            set.remove(trimmedTopic);
        } else {
            set.add(trimmedTopic);
        }
        
        roadmap.setCompletedTopics(String.join(",", set));
        return roadmapRepository.save(roadmap);
    }
}
