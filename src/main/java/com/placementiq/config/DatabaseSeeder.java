package com.placementiq.config;

import com.placementiq.model.*;
import com.placementiq.repository.*;
import com.placementiq.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private InterviewQuestionRepository questionRepository;

    @Autowired
    private CodingChallengeRepository challengeRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StudentService studentService;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUsers();
            seedCompanies();
            seedSkills();
            seedQuestions();
            seedChallenges();
            System.out.println("--- Database Seeded Successfully ---");
        }
    }

    private void seedUsers() {
        // Default Student
        User studentUser = new User();
        studentUser.setUsername("student");
        studentUser.setPassword(passwordEncoder.encode("student123"));
        studentUser.setEmail("student@placementiq.com");
        studentUser.setRole(Role.STUDENT);
        User savedStudent = userRepository.save(studentUser);

        StudentProfile studentProfile = new StudentProfile();
        studentProfile.setUser(savedStudent);
        studentProfile.setCgpa(8.2);
        studentProfile.setDsaRating(1450);
        studentProfile.setProjectsCount(3);
        studentProfile.setInternshipsCount(1);
        studentProfile.setCertificationsCount(2);
        studentProfile.setCommunicationScore(85);
        studentProfile.setSkills("Java,SQL,Git,HTML,CSS,REST API,Data Structures,Algorithms");
        studentProfile.setBio("Final year Computer Science student passionate about software engineering and problem-solving.");
        
        studentService.calculateAndSaveReadinessScore(studentProfile);

        // Default Admin
        User adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setEmail("admin@placementiq.com");
        adminUser.setRole(Role.ADMIN);
        userRepository.save(adminUser);
    }

    private void seedCompanies() {
        List<Company> companies = Arrays.asList(
            new Company(null, "TCS", 6.0, "Java,SQL,HTML", 1, "Tata Consultancy Services - Global IT services and consulting company."),
            new Company(null, "Infosys", 6.2, "Java,JavaScript,CSS", 1, "Infosys - Next-generation digital services and consulting leader."),
            new Company(null, "Wipro", 6.0, "Java,SQL,CSS", 1, "Wipro Limited - Information technology, consulting and business process services."),
            new Company(null, "Accenture", 6.5, "Java,Spring Boot,SQL", 2, "Accenture - Global professional services company with leading digital, cloud and security capabilities."),
            new Company(null, "Capgemini", 6.5, "Java,SQL,Git", 1, "Capgemini - Global leader in consulting, technology services and digital transformation."),
            new Company(null, "Cognizant", 6.3, "Java,SQL,HTML", 1, "Cognizant - Transforming clients' business, operating and technology models for the digital era."),
            new Company(null, "Amazon", 7.5, "Java,Data Structures,Algorithms,Git,REST API", 3, "Amazon.com Inc. - Tech giant specializing in e-commerce, cloud computing, and AI."),
            new Company(null, "Google", 8.0, "Data Structures,Algorithms,C++,Git", 3, "Google LLC - Global technology leader focusing on search engine, advertising, cloud, and software."),
            new Company(null, "Microsoft", 7.8, "Java,Data Structures,Algorithms,Git,REST API", 3, "Microsoft Corporation - Computing, software, cloud, and gaming services pioneer.")
        );
        companyRepository.saveAll(companies);
    }

    private void seedSkills() {
        List<Skill> skills = Arrays.asList(
            new Skill(null, "Java", "Programming Language"),
            new Skill(null, "Spring Boot", "Backend Framework"),
            new Skill(null, "SQL", "Database"),
            new Skill(null, "MySQL", "Database"),
            new Skill(null, "JavaScript", "Programming Language"),
            new Skill(null, "HTML", "Frontend"),
            new Skill(null, "CSS", "Frontend"),
            new Skill(null, "Bootstrap", "Frontend Framework"),
            new Skill(null, "React", "Frontend Framework"),
            new Skill(null, "Node.js", "Backend Framework"),
            new Skill(null, "Python", "Programming Language"),
            new Skill(null, "Git", "DevOps"),
            new Skill(null, "Docker", "DevOps"),
            new Skill(null, "AWS", "Cloud Services"),
            new Skill(null, "Data Structures", "Algorithms"),
            new Skill(null, "Algorithms", "Algorithms"),
            new Skill(null, "REST API", "Backend Architecture")
        );
        skillRepository.saveAll(skills);
    }

    private void seedQuestions() {
        List<InterviewQuestion> questions = new ArrayList<>();
        
        // Manual Seed Base Questions
        questions.add(new InterviewQuestion(null, "Java", "Easy", "What is the difference between equals() and == in Java?", "== compares references (memory addresses), while equals() compares the contents or values of objects.", "General"));
        questions.add(new InterviewQuestion(null, "Java", "Medium", "What is the difference between ArrayList and LinkedList?", "ArrayList uses a dynamic array internally, offering O(1) random access but O(N) insertion/deletion. LinkedList uses a doubly-linked list, providing O(1) insert/delete but O(N) access.", "General"));
        questions.add(new InterviewQuestion(null, "Java", "Hard", "Explain the Java Memory Model (Heap vs Stack).", "Stack stores local variables and method call executions in LIFO order (fast, thread-safe). Heap stores objects and instance variables (slower, garbage collected, shared across threads).", "Amazon"));
        questions.add(new InterviewQuestion(null, "Java", "Easy", "What is the 'final' keyword used for in Java?", "final variables cannot be reassigned; final methods cannot be overridden; final classes cannot be inherited.", "TCS"));
        questions.add(new InterviewQuestion(null, "JavaScript", "Easy", "What is the difference between 'let', 'const', and 'var'?", "var is function-scoped and hoisted. let and const are block-scoped. const variables cannot be reassigned.", "Infosys"));
        questions.add(new InterviewQuestion(null, "JavaScript", "Medium", "Explain closures in JavaScript.", "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment), allowing access to outer scope variables even after execution.", "Google"));
        questions.add(new InterviewQuestion(null, "JavaScript", "Hard", "What is the event loop and how does JavaScript handle async tasks?", "The event loop manages the execution of multiple chunks of code, listening to the Call Stack and processing the Callback Queue (or Microtask Queue) asynchronously.", "Microsoft"));
        questions.add(new InterviewQuestion(null, "DSA", "Easy", "What is the time complexity of searching in a Hash Map?", "Average time complexity is O(1) due to hashing. Worst case is O(N) if many hash collisions occur.", "General"));
        questions.add(new InterviewQuestion(null, "DSA", "Medium", "What is the difference between BFS and DFS on a graph?", "BFS uses a Queue and searches level-by-level (finds shortest paths). DFS uses a Stack (or recursion) and explores as deep as possible before backtracking.", "Amazon"));
        questions.add(new InterviewQuestion(null, "DSA", "Hard", "What is Dynamic Programming (DP) and when should it be used?", "DP is an optimization technique that solves complex problems by breaking them into overlapping subproblems, solving them once, and storing their solutions (memoization/tabulation).", "Google"));
        questions.add(new InterviewQuestion(null, "SQL", "Easy", "What is the difference between INNER JOIN and LEFT JOIN?", "INNER JOIN returns rows with matching values in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right table.", "Wipro"));
        questions.add(new InterviewQuestion(null, "SQL", "Medium", "Explain SQL database normalization and its normal forms.", "Normalization is the process of organizing database tables to reduce redundancy. 1NF removes duplicates; 2NF requires 1NF and full functional dependency; 3NF requires 2NF and removes transitive dependencies.", "Accenture"));
        questions.add(new InterviewQuestion(null, "SQL", "Hard", "What are database Indexes and how do they work?", "Indexes are data structures (typically B-Trees) that speed up data retrieval operations on a table at the cost of slower writes and additional storage.", "Microsoft"));
        questions.add(new InterviewQuestion(null, "OOP", "Easy", "What are the four pillars of Object-Oriented Programming?", "The four pillars are Encapsulation (hiding data), Inheritance (reusing code), Polymorphism (multiple forms), and Abstraction (hiding implementation details).", "Capgemini"));
        questions.add(new InterviewQuestion(null, "OOP", "Medium", "What is the difference between Method Overloading and Method Overriding?", "Overloading happens in the same class with same method name but different signatures (compile-time). Overriding happens in sub-classes with same name and signature (runtime).", "Cognizant"));
        questions.add(new InterviewQuestion(null, "DBMS", "Medium", "Explain ACID properties in database transactions.", "Atomicity (all or nothing), Consistency (preserves integrity), Isolation (concurrent execution protection), and Durability (permanence).", "General"));
        questions.add(new InterviewQuestion(null, "Operating Systems", "Medium", "What is a deadlock and what are the conditions for it?", "A deadlock is a state where threads are blocked waiting for resources held by each other. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.", "General"));

        // Generate 560 programmatically categorized and tagged questions
        String[] categories = {"Java", "JavaScript", "DSA", "SQL", "OOP", "DBMS", "Operating Systems"};
        String[][] topics = {
            {"Garbage Collection", "Exception Handling", "Collections Framework", "Multithreading & Concurrency", "Java 8 Features", "JVM Architecture", "Serialization & Cloning", "Generics", "JVM performance tuning", "Strings in Java"},
            {"Scope & Closures", "Promises & Async/Await", "Prototype Inheritance", "Event Loop", "ES6+ Modern Features", "DOM Performance", "V8 Engine Internals", "Variable Hoisting", "Node.js Fundamentals", "CORS & Security"},
            {"Arrays & Search", "String Processing", "Linked Lists", "Stack & Queue Applications", "Binary Trees & Traversals", "Binary Search Trees", "Graph Algorithms (BFS/DFS)", "Dynamic Programming", "Greedy Algorithms", "Sorting Complexities"},
            {"SQL Joins & Unions", "Database Indexing", "Aggregations & Grouping", "Normal Forms & Schema Design", "Subqueries & CTEs", "Transactions isolation levels", "Triggers & Stored Procs", "SQL Views", "NoSQL vs Relational", "Database Partitioning"},
            {"Encapsulation", "Inheritance vs Composition", "Interface vs Abstract Class", "Polymorphism Types", "SOLID Principles", "Singleton & Factory Patterns", "Coupling & Cohesion", "Dynamic Binding", "OOP Code Reusability", "Abstraction benefits"},
            {"ER Diagrams", "Database Anomalies", "Concurrency Control & Locks", "Crash Recovery & Logging", "Relational Algebra", "File Structures & B-Trees", "Query Processing steps", "Distributed Databases", "Data Warehousing", "DBMS Security"},
            {"Process vs Thread", "CPU Scheduling algorithms", "Process Synchronization", "Semaphores & Mutex", "Virtual Memory & Paging", "Deadlock Prevention", "System Calls", "File Systems layout", "I/O Disk Scheduling", "Containers & Virtualization"}
        };
        
        String[] difficulties = {"Easy", "Medium", "Hard"};
        String[] companies = {"TCS", "Infosys", "Wipro", "Accenture", "Capgemini", "Cognizant", "Amazon", "Google", "Microsoft", "General"};

        for (int catIdx = 0; catIdx < categories.length; catIdx++) {
            String category = categories[catIdx];
            String[] catTopics = topics[catIdx];
            
            for (String topic : catTopics) {
                for (int var = 1; var <= 8; var++) {
                    String difficulty = difficulties[var % difficulties.length];
                    int indexVal = catIdx + topic.hashCode() + var;
                    int companyIdx = ((indexVal % companies.length) + companies.length) % companies.length;
                    String company = companies[companyIdx];
                    
                    String qText = "";
                    String qAnswer = "";
                    
                    switch(var) {
                        case 1:
                            qText = "Explain the fundamental concept of " + topic + " in " + category + ". Why is it important?";
                            qAnswer = topic + " is a core concept in " + category + " that provides critical capability. It is primarily used to manage complexity, improve performance, and ensure robust runtime execution in modern software projects.";
                            break;
                        case 2:
                            qText = "Detail a real-world production example where you implemented or resolved issues with " + topic + ".";
                            qAnswer = "In a production web service, misconfigured " + topic + " led to high response latency. By refactoring the logic and applying best practices for " + topic + ", we reduced database/CPU overhead, increasing throughput by 25% under load.";
                            break;
                        case 3:
                            qText = "What are the internal mechanisms and data structures supporting " + topic + " in " + category + "?";
                            qAnswer = "Internally, " + topic + " relies on underlying runtime structures (e.g., heaps, maps, process queues, or indexes). The compiler/database engine schedules operations to process execution frames, optimizing lookup times to O(1) or O(log N).";
                            break;
                        case 4:
                            qText = "Compare " + topic + " with its primary alternatives. What are the key architectural trade-offs?";
                            qAnswer = "While " + topic + " offers benefits like simplicity or faster read times, its alternatives might offer lower memory footprint or thread-safety. Architects must trade off write performance and storage overhead when selecting " + topic + ".";
                            break;
                        case 5:
                            qText = "Identify the top 3 common anti-patterns or bugs associated with " + topic + " and how to avoid them.";
                            qAnswer = "Common issues with " + topic + " include resource leaks (e.g. unclosed handles), concurrency deadlocks, and boundary condition errors. These can be resolved by using try-with-resources blocks, proper synchronization locks, and writing defensive validation checks.";
                            break;
                        case 6:
                            qText = "How do you diagnose and debug memory leaks or resource exhaustion related to " + topic + "?";
                            qAnswer = "Diagnosis is performed using profiling tools (like JProfiler, Chrome DevTools, or query analyzer logs). Look for memory profiles that grow linearly, analyze thread dump stacks, and locate un-garbage-collected allocations pointing back to " + topic + ".";
                            break;
                        case 7:
                            qText = "How does " + topic + " scale under high-concurrency environments? Detail synchronization mechanisms.";
                            qAnswer = "To scale " + topic + " in multi-threaded/concurrent systems, use non-blocking synchronization, concurrent queues, or read-write locks. In database contexts, adjust isolation levels (e.g., read committed) and implement query indexes to avoid table locks.";
                            break;
                        case 8:
                            qText = "Design a scalable architecture that utilizes " + topic + " to handle millions of transactions per second.";
                            qAnswer = "The architecture should use a distributed processing pattern: (1) An API gateway routes traffic. (2) A message broker buffers requests. (3) Background worker nodes utilize optimized " + topic + " algorithms. (4) Caching layers minimize state transitions, keeping latency under 15ms.";
                            break;
                    }
                    
                    questions.add(new InterviewQuestion(null, category, difficulty, qText, qAnswer, company));
                }
            }
        }
        
        questionRepository.saveAll(questions);
    }

    private void seedChallenges() {
        List<CodingChallenge> challenges = Arrays.asList(
            new CodingChallenge(null, "Two Sum", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", "Easy", 10, "Arrays"),
            new CodingChallenge(null, "Reverse String", "Write a function that reverses a string. The input string is given as an array of characters.", "Easy", 5, "Strings"),
            new CodingChallenge(null, "Reverse Linked List", "Given the head of a singly linked list, reverse the list, and return the reversed list.", "Medium", 15, "Linked Lists"),
            new CodingChallenge(null, "Valid Parentheses", "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", "Easy", 10, "Stack"),
            new CodingChallenge(null, "Implement Queue using Stacks", "Implement a first in first out (FIFO) queue using only two stacks.", "Medium", 15, "Queue"),
            new CodingChallenge(null, "Inorder Traversal", "Given the root of a binary tree, return the inorder traversal of its nodes' values.", "Easy", 10, "Trees"),
            new CodingChallenge(null, "Find Center of Star Graph", "There is an undirected star graph consisting of n nodes. Find the center node.", "Medium", 15, "Graphs"),
            new CodingChallenge(null, "0/1 Knapsack Problem", "Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value.", "Hard", 30, "Dynamic Programming")
        );
        challengeRepository.saveAll(challenges);
    }
}
