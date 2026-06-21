package com.placementiq.util;

import com.placementiq.model.StudentProfile;
import com.placementiq.model.InterviewQuestion;
import java.util.*;

public class DsaHelper {

    // 1. HashMap: Skill frequency tracking & keyword analysis
    public static Map<String, Integer> analyzeSkillFrequency(String resumeText, Set<String> skillLibrary) {
        Map<String, Integer> frequencies = new HashMap<>();
        if (resumeText == null || resumeText.trim().isEmpty() || skillLibrary == null) {
            return frequencies;
        }
        
        String lowerText = resumeText.toLowerCase();
        for (String skill : skillLibrary) {
            String lowerSkill = skill.toLowerCase();
            int count = 0;
            int idx = 0;
            while ((idx = lowerText.indexOf(lowerSkill, idx)) != -1) {
                count++;
                idx += lowerSkill.length();
            }
            if (count > 0) {
                frequencies.put(skill, count);
            }
        }
        return frequencies;
    }

    // 2. HashSet: Skill gap detection
    public static Set<String> detectSkillGap(Set<String> studentSkills, Set<String> companyRequiredSkills) {
        Set<String> gap = new HashSet<>(companyRequiredSkills);
        Set<String> normalizedStudent = new HashSet<>();
        for (String s : studentSkills) {
            if (s != null) {
                normalizedStudent.add(s.trim().toLowerCase());
            }
        }
        
        gap.removeIf(skill -> skill == null || normalizedStudent.contains(skill.trim().toLowerCase()));
        return gap;
    }

    // 3. Sorting: Leaderboard ranking & Student ranking
    public static void rankStudents(List<StudentProfile> profiles) {
        Collections.sort(profiles, new Comparator<StudentProfile>() {
            @Override
            public int compare(StudentProfile p1, StudentProfile p2) {
                int codingComp = Integer.compare(p2.getCodingScore(), p1.getCodingScore());
                if (codingComp != 0) return codingComp;
                
                int readinessComp = Integer.compare(p2.getPlacementReadinessScore(), p1.getPlacementReadinessScore());
                if (readinessComp != 0) return readinessComp;
                
                return Double.compare(p2.getCgpa(), p1.getCgpa());
            }
        });
    }

    // 4. Tree: Interview question categorization
    public static class CategoryNode {
        private String name;
        private Map<String, CategoryNode> children = new HashMap<>();
        private List<InterviewQuestion> questions = new ArrayList<>();

        public CategoryNode(String name) {
            this.name = name;
        }

        public String getName() { return name; }
        public Map<String, CategoryNode> getChildren() { return children; }
        public List<InterviewQuestion> getQuestions() { return questions; }

        public void insert(String[] path, int index, InterviewQuestion question) {
            if (index == path.length) {
                questions.add(question);
                return;
            }
            String part = path[index];
            children.putIfAbsent(part, new CategoryNode(part));
            children.get(part).insert(path, index + 1, question);
        }

        public List<InterviewQuestion> getAllQuestionsUnder() {
            List<InterviewQuestion> all = new ArrayList<>(questions);
            for (CategoryNode child : children.values()) {
                all.addAll(child.getAllQuestionsUnder());
            }
            return all;
        }
    }

    public static CategoryNode buildQuestionTree(List<InterviewQuestion> questions) {
        CategoryNode root = new CategoryNode("Root");
        for (InterviewQuestion q : questions) {
            String cat = q.getCategory() != null ? q.getCategory() : "General";
            String[] path = cat.split("/");
            root.insert(path, 0, q);
        }
        return root;
    }

    // 5. Priority Queue: Top performers
    public static List<StudentProfile> getTopKPerformers(List<StudentProfile> profiles, int k) {
        if (profiles == null || profiles.isEmpty() || k <= 0) {
            return new ArrayList<>();
        }
        PriorityQueue<StudentProfile> pq = new PriorityQueue<>(k, new Comparator<StudentProfile>() {
            @Override
            public int compare(StudentProfile p1, StudentProfile p2) {
                int codingComp = Integer.compare(p1.getCodingScore(), p2.getCodingScore());
                if (codingComp != 0) return codingComp;
                return Double.compare(p1.getCgpa(), p2.getCgpa());
            }
        });

        for (StudentProfile profile : profiles) {
            pq.offer(profile);
            if (pq.size() > k) {
                pq.poll(); 
            }
        }

        List<StudentProfile> topPerformers = new ArrayList<>(pq);
        topPerformers.sort((p1, p2) -> Integer.compare(p2.getCodingScore(), p1.getCodingScore()));
        return topPerformers;
    }

    // 6. Dynamic Programming: Learning roadmap optimization
    public static class RoadmapTopic {
        public String name;
        public int daysRequired;
        public int priorityScore; 
        public int estimatedWeekOrder; 

        public RoadmapTopic(String name, int daysRequired, int priorityScore, int estimatedWeekOrder) {
            this.name = name;
            this.daysRequired = daysRequired;
            this.priorityScore = priorityScore;
            this.estimatedWeekOrder = estimatedWeekOrder;
        }
    }

    public static List<RoadmapTopic> getOptimalRoadmapTopics(int availableDays, List<RoadmapTopic> allTopics) {
        int n = allTopics.size();
        int[][] dp = new int[n + 1][availableDays + 1];

        for (int i = 1; i <= n; i++) {
            RoadmapTopic topic = allTopics.get(i - 1);
            for (int w = 0; w <= availableDays; w++) {
                if (topic.daysRequired <= w) {
                    dp[i][w] = Math.max(
                        dp[i - 1][w],
                        dp[i - 1][w - topic.daysRequired] + topic.priorityScore
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        List<RoadmapTopic> selected = new ArrayList<>();
        int w = availableDays;
        for (int i = n; i > 0; i--) {
            if (dp[i][w] != dp[i - 1][w]) {
                RoadmapTopic topic = allTopics.get(i - 1);
                selected.add(topic);
                w -= topic.daysRequired;
            }
        }

        selected.sort(Comparator.comparingInt(t -> t.estimatedWeekOrder));
        return selected;
    }
}
