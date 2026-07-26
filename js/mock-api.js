// mock-api.js - Client-Side Mock Backend Engine for GitHub Pages
(function () {
    // Helper to compute Java-like String hashcode for category indexing
    function hashCode(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (31 * h + str.charCodeAt(i)) | 0;
        }
        return h;
    }

    // Initialize Mock Database in localStorage
    function initDatabase() {
        if (localStorage.getItem("placement_iq_db_initialized")) {
            return;
        }

        console.log("Initializing Mock Database in LocalStorage...");

        // 1. Seed Users
        const users = [
            { id: 1, username: "student", password: "student123", email: "student@placementiq.com", role: "STUDENT" },
            { id: 2, username: "admin", password: "admin123", email: "admin@placementiq.com", role: "ADMIN" }
        ];

        // 2. Seed Student Profiles
        const profiles = [
            {
                id: 1,
                username: "student",
                cgpa: 8.2,
                dsaRating: 1450,
                projectsCount: 3,
                internshipsCount: 1,
                certificationsCount: 2,
                communicationScore: 85,
                skills: "Java,SQL,Git,HTML,CSS,REST API,Data Structures,Algorithms",
                bio: "Final year Computer Science student passionate about software engineering and problem-solving.",
                codingScore: 0,
                solvedChallengesCount: 0,
                currentStreak: 0,
                badges: "",
                placementReadinessScore: 78,
                resumeScore: 0
            }
        ];

        // 3. Seed Companies
        const companies = [
            { id: 1, name: "TCS", minCgpa: 6.0, requiredSkills: "Java,SQL,HTML", requiredProjects: 1, description: "Tata Consultancy Services - Global IT services and consulting company." },
            { id: 2, name: "Infosys", minCgpa: 6.2, requiredSkills: "Java,JavaScript,CSS", requiredProjects: 1, description: "Infosys - Next-generation digital services and consulting leader." },
            { id: 3, name: "Wipro", minCgpa: 6.0, requiredSkills: "Java,SQL,CSS", requiredProjects: 1, description: "Wipro Limited - Information technology, consulting and business process services." },
            { id: 4, name: "Accenture", minCgpa: 6.5, requiredSkills: "Java,Spring Boot,SQL", requiredProjects: 2, description: "Accenture - Global professional services company with leading digital, cloud and security capabilities." },
            { id: 5, name: "Capgemini", minCgpa: 6.5, requiredSkills: "Java,SQL,Git", requiredProjects: 1, description: "Capgemini - Global leader in consulting, technology services and digital transformation." },
            { id: 6, name: "Cognizant", minCgpa: 6.3, requiredSkills: "Java,SQL,HTML", requiredProjects: 1, description: "Cognizant - Transforming clients' business, operating and technology models for the digital era." },
            { id: 7, name: "Amazon", minCgpa: 7.5, requiredSkills: "Java,Data Structures,Algorithms,Git,REST API", requiredProjects: 3, description: "Amazon.com Inc. - Tech giant specializing in e-commerce, cloud computing, and AI." },
            { id: 8, name: "Google", minCgpa: 8.0, requiredSkills: "Data Structures,Algorithms,C++,Git", requiredProjects: 3, description: "Google LLC - Global technology leader focusing on search engine, advertising, cloud, and software." },
            { id: 9, name: "Microsoft", minCgpa: 7.8, requiredSkills: "Java,Data Structures,Algorithms,Git,REST API", requiredProjects: 3, description: "Microsoft Corporation - Computing, software, cloud, and gaming services pioneer." }
        ];

        // 4. Seed Skills
        const skills = [
            { id: 1, name: "Java", category: "Programming Language" },
            { id: 2, name: "Spring Boot", category: "Backend Framework" },
            { id: 3, name: "SQL", category: "Database" },
            { id: 4, name: "MySQL", category: "Database" },
            { id: 5, name: "JavaScript", category: "Programming Language" },
            { id: 6, name: "HTML", category: "Frontend" },
            { id: 7, name: "CSS", category: "Frontend" },
            { id: 8, name: "Bootstrap", category: "Frontend Framework" },
            { id: 9, name: "React", category: "Frontend Framework" },
            { id: 10, name: "Node.js", category: "Backend Framework" },
            { id: 11, name: "Python", category: "Programming Language" },
            { id: 12, name: "Git", category: "DevOps" },
            { id: 13, name: "Docker", category: "DevOps" },
            { id: 14, name: "AWS", category: "Cloud Services" },
            { id: 15, name: "Data Structures", category: "Algorithms" },
            { id: 16, name: "Algorithms", category: "Algorithms" },
            { id: 17, name: "REST API", category: "Backend Architecture" }
        ];

        // 5. Seed Coding Challenges
        const challenges = [
            { id: 1, title: "Two Sum", description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", difficulty: "Easy", points: 10, topic: "Arrays" },
            { id: 2, title: "Reverse String", description: "Write a function that reverses a string. The input string is given as an array of characters.", difficulty: "Easy", points: 5, topic: "Strings" },
            { id: 3, title: "Reverse Linked List", description: "Given the head of a singly linked list, reverse the list, and return the reversed list.", difficulty: "Medium", points: 15, topic: "Linked Lists" },
            { id: 4, title: "Valid Parentheses", description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", difficulty: "Easy", points: 10, topic: "Stack" },
            { id: 5, title: "Implement Queue using Stacks", description: "Implement a first in first out (FIFO) queue using only two stacks.", difficulty: "Medium", points: 15, topic: "Queue" },
            { id: 6, title: "Inorder Traversal", description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.", difficulty: "Easy", points: 10, topic: "Trees" },
            { id: 7, title: "Find Center of Star Graph", description: "There is an undirected star graph consisting of n nodes. Find the center node.", difficulty: "Medium", points: 15, topic: "Graphs" },
            { id: 8, title: "0/1 Knapsack Problem", description: "Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value.", difficulty: "Hard", points: 30, topic: "Dynamic Programming" }
        ];

        // 6. Seed Interview Questions (17 custom + 560 programmatically generated)
        const questions = [
            { id: 1, category: "Java", difficulty: "Easy", question: "What is the difference between equals() and == in Java?", answer: "== compares references (memory addresses), while equals() compares the contents or values of objects.", company: "General" },
            { id: 2, category: "Java", difficulty: "Medium", question: "What is the difference between ArrayList and LinkedList?", answer: "ArrayList uses a dynamic array internally, offering O(1) random access but O(N) insertion/deletion. LinkedList uses a doubly-linked list, providing O(1) insert/delete but O(N) access.", company: "General" },
            { id: 3, category: "Java", difficulty: "Hard", question: "Explain the Java Memory Model (Heap vs Stack).", answer: "Stack stores local variables and method call executions in LIFO order (fast, thread-safe). Heap stores objects and instance variables (slower, garbage collected, shared across threads).", company: "Amazon" },
            { id: 4, category: "Java", difficulty: "Easy", question: "What is the 'final' keyword used for in Java?", answer: "final variables cannot be reassigned; final methods cannot be overridden; final classes cannot be inherited.", company: "TCS" },
            { id: 5, category: "JavaScript", difficulty: "Easy", question: "What is the difference between 'let', 'const', and 'var'?", answer: "var is function-scoped and hoisted. let and const are block-scoped. const variables cannot be reassigned.", company: "Infosys" },
            { id: 6, category: "JavaScript", difficulty: "Medium", question: "Explain closures in JavaScript.", answer: "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment), allowing access to outer scope variables even after execution.", company: "Google" },
            { id: 7, category: "JavaScript", difficulty: "Hard", question: "What is the event loop and how does JavaScript handle async tasks?", answer: "The event loop manages the execution of multiple chunks of code, listening to the Call Stack and processing the Callback Queue (or Microtask Queue) asynchronously.", company: "Microsoft" },
            { id: 8, category: "DSA", difficulty: "Easy", question: "What is the time complexity of searching in a Hash Map?", answer: "Average time complexity is O(1) due to hashing. Worst case is O(N) if many hash collisions occur.", company: "General" },
            { id: 9, category: "DSA", difficulty: "Medium", question: "What is the difference between BFS and DFS on a graph?", answer: "BFS uses a Queue and searches level-by-level (finds shortest paths). DFS uses a Stack (or recursion) and explores as deep as possible before backtracking.", company: "Amazon" },
            { id: 10, category: "DSA", difficulty: "Hard", question: "What is Dynamic Programming (DP) and when should it be used?", answer: "DP is an optimization technique that solves complex problems by breaking them into overlapping subproblems, solving them once, and storing their solutions (memoization/tabulation).", company: "Google" },
            { id: 11, category: "SQL", difficulty: "Easy", question: "What is the difference between INNER JOIN and LEFT JOIN?", answer: "INNER JOIN returns rows with matching values in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right table.", company: "Wipro" },
            { id: 12, category: "SQL", difficulty: "Medium", question: "Explain SQL database normalization and its normal forms.", answer: "Normalization is the process of organizing database tables to reduce redundancy. 1NF removes duplicates; 2NF requires 1NF and full functional dependency; 3NF requires 2NF and removes transitive dependencies.", company: "Accenture" },
            { id: 13, category: "SQL", difficulty: "Hard", question: "What are database Indexes and how do they work?", answer: "Indexes are data structures (typically B-Trees) that speed up data retrieval operations on a table at the cost of slower writes and additional storage.", company: "Microsoft" },
            { id: 14, category: "OOP", difficulty: "Easy", question: "What are the four pillars of Object-Oriented Programming?", answer: "The four pillars are Encapsulation (hiding data), Inheritance (reusing code), Polymorphism (multiple forms), and Abstraction (hiding implementation details).", company: "Capgemini" },
            { id: 15, category: "OOP", difficulty: "Medium", question: "What is the difference between Method Overloading and Method Overriding?", answer: "Overloading happens in the same class with same method name but different signatures (compile-time). Overriding happens in sub-classes with same name and signature (runtime).", company: "Cognizant" },
            { id: 16, category: "DBMS", difficulty: "Medium", question: "Explain ACID properties in database transactions.", answer: "Atomicity (all or nothing), Consistency (preserves integrity), Isolation (concurrent execution protection), and Durability (permanence).", company: "General" },
            { id: 17, category: "Operating Systems", difficulty: "Medium", question: "What is a deadlock and what are the conditions for it?", answer: "A deadlock is a state where threads are blocked waiting for resources held by each other. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.", company: "General" }
        ];

        // Generate 560 programmatically categorized and tagged questions
        const categoriesList = ["Java", "JavaScript", "DSA", "SQL", "OOP", "DBMS", "Operating Systems"];
        const topicsList = [
            ["Garbage Collection", "Exception Handling", "Collections Framework", "Multithreading & Concurrency", "Java 8 Features", "JVM Architecture", "Serialization & Cloning", "Generics", "JVM performance tuning", "Strings in Java"],
            ["Scope & Closures", "Promises & Async/Await", "Prototype Inheritance", "Event Loop", "ES6+ Modern Features", "DOM Performance", "V8 Engine Internals", "Variable Hoisting", "Node.js Fundamentals", "CORS & Security"],
            ["Arrays & Search", "String Processing", "Linked Lists", "Stack & Queue Applications", "Binary Trees & Traversals", "Binary Search Trees", "Graph Algorithms (BFS/DFS)", "Dynamic Programming", "Greedy Algorithms", "Sorting Complexities"],
            ["SQL Joins & Unions", "Database Indexing", "Aggregations & Grouping", "Normal Forms & Schema Design", "Subqueries & CTEs", "Transactions isolation levels", "Triggers & Stored Procs", "SQL Views", "NoSQL vs Relational", "Database Partitioning"],
            ["Encapsulation", "Inheritance vs Composition", "Interface vs Abstract Class", "Polymorphism Types", "SOLID Principles", "Singleton & Factory Patterns", "Coupling & Cohesion", "Dynamic Binding", "OOP Code Reusability", "Abstraction benefits"],
            ["ER Diagrams", "Database Anomalies", "Concurrency Control & Locks", "Crash Recovery & Logging", "Relational Algebra", "File Structures & B-Trees", "Query Processing steps", "Distributed Databases", "Data Warehousing", "DBMS Security"],
            ["Process vs Thread", "CPU Scheduling algorithms", "Process Synchronization", "Semaphores & Mutex", "Virtual Memory & Paging", "Deadlock Prevention", "System Calls", "File Systems layout", "I/O Disk Scheduling", "Containers & Virtualization"]
        ];
        const difficulties = ["Easy", "Medium", "Hard"];
        const companiesList = ["TCS", "Infosys", "Wipro", "Accenture", "Capgemini", "Cognizant", "Amazon", "Google", "Microsoft", "General"];

        let qId = 18;
        for (let catIdx = 0; catIdx < categoriesList.length; catIdx++) {
            const category = categoriesList[catIdx];
            const catTopics = topicsList[catIdx];

            for (const topic of catTopics) {
                for (let val = 1; val <= 8; val++) {
                    const difficulty = difficulties[val % difficulties.length];
                    const indexVal = catIdx + hashCode(topic) + val;
                    const companyIdx = ((indexVal % companiesList.length) + companiesList.length) % companiesList.length;
                    const company = companiesList[companyIdx];

                    let qText = "";
                    let qAnswer = "";

                    switch (val) {
                        case 1:
                            qText = `Explain the fundamental concept of ${topic} in ${category}. Why is it important?`;
                            qAnswer = `${topic} is a core concept in ${category} that provides critical capability. It is primarily used to manage complexity, improve performance, and ensure robust runtime execution in modern software projects.`;
                            break;
                        case 2:
                            qText = `Detail a real-world production example where you implemented or resolved issues with ${topic}.`;
                            qAnswer = `In a production web service, misconfigured ${topic} led to high response latency. By refactoring the logic and applying best practices for ${topic}, we reduced database/CPU overhead, increasing throughput by 25% under load.`;
                            break;
                        case 3:
                            qText = `What are the internal mechanisms and data structures supporting ${topic} in ${category}?`;
                            qAnswer = `Internally, ${topic} relies on underlying runtime structures (e.g., heaps, maps, process queues, or indexes). The compiler/database engine schedules operations to process execution frames, optimizing lookup times to O(1) or O(log N).`;
                            break;
                        case 4:
                            qText = `Compare ${topic} with its primary alternatives. What are the key architectural trade-offs?`;
                            qAnswer = `While ${topic} offers benefits like simplicity or faster read times, its alternatives might offer lower memory footprint or thread-safety. Architects must trade off write performance and storage overhead when selecting ${topic}.`;
                            break;
                        case 5:
                            qText = `Identify the top 3 common anti-patterns or bugs associated with ${topic} and how to avoid them.`;
                            qAnswer = `Common issues with ${topic} include resource leaks (e.g. unclosed handles), concurrency deadlocks, and boundary condition errors. These can be resolved by using try-with-resources blocks, proper synchronization locks, and writing defensive validation checks.`;
                            break;
                        case 6:
                            qText = `How do you diagnose and debug memory leaks or resource exhaustion related to ${topic}?`;
                            qAnswer = `Diagnosis is performed using profiling tools (like JProfiler, Chrome DevTools, or query analyzer logs). Look for memory profiles that grow linearly, analyze thread dump stacks, and locate un-garbage-collected allocations pointing back to ${topic}.`;
                            break;
                        case 7:
                            qText = `How does ${topic} scale under high-concurrency environments? Detail synchronization mechanisms.`;
                            qAnswer = `To scale ${topic} in multi-threaded/concurrent systems, use non-blocking synchronization, concurrent queues, or read-write locks. In database contexts, adjust isolation levels (e.g., read committed) and implement query indexes to avoid table locks.`;
                            break;
                        case 8:
                            qText = `Design a scalable architecture that utilizes ${topic} to handle millions of transactions per second.`;
                            qAnswer = `The architecture should use a distributed processing pattern: (1) An API gateway routes traffic. (2) A message broker buffers requests. (3) Background worker nodes utilize optimized ${topic} algorithms. (4) Caching layers minimize state transitions, keeping latency under 15ms.`;
                            break;
                    }

                    questions.push({
                        id: qId++,
                        category: category,
                        difficulty: difficulty,
                        question: qText,
                        answer: qAnswer,
                        company: company
                    });
                }
            }
        }

        // Save to localStorage
        localStorage.setItem("placement_iq_db_users", JSON.stringify(users));
        localStorage.setItem("placement_iq_db_profiles", JSON.stringify(profiles));
        localStorage.setItem("placement_iq_db_companies", JSON.stringify(companies));
        localStorage.setItem("placement_iq_db_skills", JSON.stringify(skills));
        localStorage.setItem("placement_iq_db_challenges", JSON.stringify(challenges));
        localStorage.setItem("placement_iq_db_questions", JSON.stringify(questions));
        localStorage.setItem("placement_iq_db_submissions", JSON.stringify([]));
        localStorage.setItem("placement_iq_db_roadmaps", JSON.stringify([]));
        localStorage.setItem("placement_iq_db_resume_analyses", JSON.stringify([]));

        localStorage.setItem("placement_iq_db_initialized", "true");
        console.log("Mock Database Seeded Successfully!");
    }

    // Helper functions to get/set data
    const getDB = (key) => JSON.parse(localStorage.getItem("placement_iq_db_" + key) || "[]");
    const saveDB = (key, data) => localStorage.setItem("placement_iq_db_" + key, JSON.stringify(data));

    // Initialize immediately
    initDatabase();

    // Helper to calculate student readiness score
    function calculateReadinessScore(profile) {
        const cgpa = profile.cgpa || 0.0;
        const dsaRating = profile.dsaRating || 0;
        const projects = profile.projectsCount || 0;
        const internships = profile.internshipsCount || 0;
        const certs = profile.certificationsCount || 0;
        const comm = profile.communicationScore || 0;

        const cgpaPart = (cgpa / 10.0) * 30.0;
        const dsaPart = (Math.min(dsaRating, 2000) / 2000.0) * 25.0;
        const projectPart = (Math.min(projects, 5) / 5.0) * 15.0;
        const internshipPart = (Math.min(internships, 3) / 3.0) * 15.0;
        const certPart = (Math.min(certs, 5) / 5.0) * 5.0;
        const commPart = (Math.min(comm, 100) / 100.0) * 10.0;

        let score = Math.round(cgpaPart + dsaPart + projectPart + internshipPart + certPart + commPart);
        score = Math.max(0, Math.min(100, score));

        profile.placementReadinessScore = score;
        return score;
    }

    // Helper to calculate profile completion
    function getProfileCompletionPercentage(profile) {
        let filledFields = 0;
        const totalFields = 7;
        if (profile.cgpa && profile.cgpa > 0) filledFields++;
        if (profile.dsaRating && profile.dsaRating > 0) filledFields++;
        if (profile.projectsCount && profile.projectsCount > 0) filledFields++;
        if (profile.internshipsCount && profile.internshipsCount > 0) filledFields++;
        if (profile.certificationsCount && profile.certificationsCount > 0) filledFields++;
        if (profile.communicationScore && profile.communicationScore > 0) filledFields++;
        if (profile.skills && profile.skills.trim().length > 0) filledFields++;
        return Math.floor((filledFields * 100) / totalFields);
    }

    // Intercept Fetch API
    const originalFetch = window.fetch;
    window.fetch = async function (resource, options = {}) {
        let url = typeof resource === "string" ? resource : resource.url;

        // Skip non-API requests (CSS, third party libraries, bootstrap etc)
        if (!url.includes("/api/")) {
            return originalFetch.apply(this, arguments);
        }

        console.log(`MockAPI Intercepted: ${options.method || "GET"} ${url}`, options);

        const method = (options.method || "GET").toUpperCase();
        const headers = options.headers || {};
        
        // Extract auth username
        let username = null;
        const authHeader = headers["Authorization"] || headers["authorization"];
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            if (token.startsWith("mock-jwt-token-for-")) {
                username = token.replace("mock-jwt-token-for-", "");
            }
        }

        // Parse Request Body if any
        let body = {};
        if (options.body) {
            if (typeof options.body === "string") {
                try {
                    body = JSON.parse(options.body);
                } catch (e) {
                    // might be FormData
                    body = options.body;
                }
            } else {
                body = options.body;
            }
        }

        // Response Builder Helper
        const jsonResponse = (data, status = 200) => {
            return Promise.resolve(new Response(JSON.stringify(data), {
                status: status,
                headers: { "Content-Type": "application/json" }
            }));
        };

        const errorResponse = (msg, status = 400) => {
            return jsonResponse({ error: msg }, status);
        };

        try {
            // ============================================
            // 1. AUTH ENDPOINTS
            // ============================================
            if (url.includes("/api/auth/login")) {
                const users = getDB("users");
                const user = users.find(u => u.username === body.username && u.password === body.password);
                if (!user) {
                    return errorResponse("Invalid username or password");
                }
                return jsonResponse({
                    token: "mock-jwt-token-for-" + user.username,
                    role: user.role,
                    username: user.username,
                    email: user.email
                });
            }

            if (url.includes("/api/auth/register")) {
                const users = getDB("users");
                if (users.some(u => u.username === body.username)) {
                    return errorResponse("Username already exists");
                }
                const newUser = {
                    id: users.length + 1,
                    username: body.username,
                    password: body.password,
                    email: body.email,
                    role: body.role || "STUDENT"
                };
                users.push(newUser);
                saveDB("users", users);

                if (newUser.role === "STUDENT") {
                    const profiles = getDB("profiles");
                    const newProfile = {
                        id: profiles.length + 1,
                        username: newUser.username,
                        cgpa: 0.0,
                        dsaRating: 0,
                        projectsCount: 0,
                        internshipsCount: 0,
                        certificationsCount: 0,
                        communicationScore: 0,
                        skills: "",
                        bio: "",
                        codingScore: 0,
                        solvedChallengesCount: 0,
                        currentStreak: 0,
                        badges: "",
                        placementReadinessScore: 0,
                        resumeScore: 0
                    };
                    profiles.push(newProfile);
                    saveDB("profiles", profiles);
                }

                return jsonResponse({
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                });
            }

            if (url.includes("/api/auth/forgot-password")) {
                const users = getDB("users");
                const user = users.find(u => u.username === body.username && u.email === body.email);
                if (!user) {
                    return errorResponse("User credentials do not match any records.");
                }
                user.password = body.newPassword;
                saveDB("users", users);
                return jsonResponse({ message: "Password reset successfully" });
            }

            // Verify authentication for remaining student/admin endpoints
            if (!username) {
                return errorResponse("Unauthorized: Missing or invalid token", 401);
            }

            // ============================================
            // 2. STUDENT PROFILE ENDPOINTS
            // ============================================
            if (url.endsWith("/api/student/profile") && method === "GET") {
                const profiles = getDB("profiles");
                const profile = profiles.find(p => p.username === username);
                if (!profile) return errorResponse("Profile not found");

                const resumeAnalyses = getDB("resume_analyses");
                const resumeAnalysis = resumeAnalyses.find(ra => ra.studentUsername === username) || null;

                return jsonResponse({
                    profile: profile,
                    profileCompletion: getProfileCompletionPercentage(profile),
                    resumeAnalysis: resumeAnalysis
                });
            }

            if (url.endsWith("/api/student/profile") && method === "PUT") {
                const profiles = getDB("profiles");
                const idx = profiles.findIndex(p => p.username === username);
                if (idx === -1) return errorResponse("Profile not found");

                // Update allowed profile fields
                const p = profiles[idx];
                p.cgpa = body.cgpa !== undefined ? parseFloat(body.cgpa) : p.cgpa;
                p.dsaRating = body.dsaRating !== undefined ? parseInt(body.dsaRating) : p.dsaRating;
                p.projectsCount = body.projectsCount !== undefined ? parseInt(body.projectsCount) : p.projectsCount;
                p.internshipsCount = body.internshipsCount !== undefined ? parseInt(body.internshipsCount) : p.internshipsCount;
                p.certificationsCount = body.certificationsCount !== undefined ? parseInt(body.certificationsCount) : p.certificationsCount;
                p.communicationScore = body.communicationScore !== undefined ? parseInt(body.communicationScore) : p.communicationScore;
                p.skills = body.skills !== undefined ? body.skills : p.skills;
                p.bio = body.bio !== undefined ? body.bio : p.bio;

                calculateReadinessScore(p);
                profiles[idx] = p;
                saveDB("profiles", profiles);

                return jsonResponse(p);
            }

            if (url.endsWith("/api/student/readiness") && method === "POST") {
                const profiles = getDB("profiles");
                const idx = profiles.findIndex(p => p.username === username);
                if (idx === -1) return errorResponse("Profile not found");

                const score = calculateReadinessScore(profiles[idx]);
                saveDB("profiles", profiles);
                return jsonResponse({ placementReadinessScore: score });
            }

            // ============================================
            // 3. SKILL GAP & ELIGIBILITY ENDPOINTS
            // ============================================
            if (url.endsWith("/api/student/eligibility") && method === "GET") {
                const profiles = getDB("profiles");
                const profile = profiles.find(p => p.username === username);
                if (!profile) return errorResponse("Profile not found");

                const companies = getDB("companies");
                const studentSkills = new Set((profile.skills || "").split(",").map(s => s.trim().toLowerCase()).filter(s => s));

                const results = companies.map(c => {
                    const companySkills = c.requiredSkills.split(",").map(s => s.trim());
                    const missingSkills = companySkills.filter(s => !studentSkills.has(s.trim().toLowerCase()));
                    const reasons = [];
                    let eligible = true;

                    if (profile.cgpa < c.minCgpa) {
                        eligible = false;
                        reasons.push(`CGPA is ${profile.cgpa.toFixed(2)}, required minimum is ${c.minCgpa.toFixed(2)}`);
                    }
                    if (profile.projectsCount < c.requiredProjects) {
                        eligible = false;
                        reasons.push(`Projects count is ${profile.projectsCount}, required minimum is ${c.requiredProjects}`);
                    }
                    if (missingSkills.length > 0) {
                        eligible = false;
                        reasons.push("Missing required skills: " + missingSkills.join(", "));
                    }

                    return {
                        companyId: c.id,
                        companyName: c.name,
                        minCgpa: c.minCgpa,
                        requiredSkills: c.requiredSkills,
                        requiredProjects: c.requiredProjects,
                        eligible: eligible,
                        status: eligible ? "Eligible" : "Not Eligible",
                        reasons: reasons
                    };
                });

                return jsonResponse(results);
            }

            if (url.includes("/api/student/gap/")) {
                const parts = url.split("/");
                const companyId = parseInt(parts[parts.length - 1]);
                const companies = getDB("companies");
                const company = companies.find(c => c.id === companyId);
                if (!company) return errorResponse("Company not found");

                const profiles = getDB("profiles");
                const profile = profiles.find(p => p.username === username);
                if (!profile) return errorResponse("Profile not found");

                const studentSkills = (profile.skills || "").split(",").map(s => s.trim()).filter(s => s);
                const companySkills = company.requiredSkills.split(",").map(s => s.trim()).filter(s => s);

                const studentSkillsSet = new Set(studentSkills.map(s => s.toLowerCase()));
                const missingSkills = companySkills.filter(s => !studentSkillsSet.has(s.toLowerCase()));

                const recommendations = [];
                missingSkills.forEach(skill => {
                    const skillLower = skill.toLowerCase();
                    if (skillLower.includes("spring") || skillLower.includes("java")) {
                        recommendations.push("Take a course on Java & Spring Boot backend development. Build a REST API project.");
                    } else if (skillLower.includes("sql") || skillLower.includes("dbms") || skillLower.includes("mysql")) {
                        recommendations.push("Learn SQL queries, indexing, and normalization. Solve challenges on LeetCode/HackerRank SQL subdomains.");
                    } else if (skillLower.includes("js") || skillLower.includes("javascript") || skillLower.includes("react") || skillLower.includes("html")) {
                        recommendations.push("Learn modern JavaScript (ES6+), CSS/Bootstrap, and React for building dynamic frontends.");
                    } else if (skillLower.includes("dsa") || skillLower.includes("algorithm")) {
                        recommendations.push("Practice DSA challenges (Arrays, Trees, Graphs, DP) daily. Aim for a 300+ DSA rating.");
                    } else {
                        recommendations.push("Review tutorials and documentation on " + skill + " to build a mini-project.");
                    }
                });

                if (recommendations.length === 0) {
                    recommendations.push("Excellent! You meet all skill requirements for " + company.name + ".");
                }

                return jsonResponse({
                    companyName: company.name,
                    studentSkills: studentSkills,
                    companySkills: companySkills,
                    missingSkills: missingSkills,
                    recommendations: recommendations
                });
            }

            // ============================================
            // 4. RESUME UPLOAD & ANALYSIS ENDPOINTS
            // ============================================
            if (url.endsWith("/api/student/resume/analyze") && method === "POST") {
                const text = body.resumeText || "";
                if (!text.trim()) return errorResponse("Resume text is empty");

                const profiles = getDB("profiles");
                const pIdx = profiles.findIndex(p => p.username === username);
                if (pIdx === -1) return errorResponse("Profile not found");

                const profile = profiles[pIdx];

                const skillLibrary = [
                    "Java", "Spring Boot", "SQL", "MySQL", "JavaScript", "HTML", "CSS", "Bootstrap",
                    "React", "Angular", "Vue", "Node.js", "Python", "Django", "C++", "C#", "Git", "GitHub",
                    "Docker", "Kubernetes", "AWS", "Google Cloud", "Machine Learning", "Data Structures",
                    "Algorithms", "DBMS", "Operating Systems", "REST API", "Microservices"
                ];
                const coreDeveloperSkills = ["Java", "Spring Boot", "SQL", "Git", "Data Structures", "Algorithms"];

                const skillFrequencies = {};
                const lowerText = text.toLowerCase();
                skillLibrary.forEach(skill => {
                    const lowerSkill = skill.toLowerCase();
                    let count = 0;
                    let idx = 0;
                    while ((idx = lowerText.indexOf(lowerSkill, idx)) !== -1) {
                        count++;
                        idx += lowerSkill.length;
                    }
                    if (count > 0) {
                        skillFrequencies[skill] = count;
                    }
                });

                const extractedSkills = Object.keys(skillFrequencies);
                const missingSkills = coreDeveloperSkills.filter(s => !extractedSkills.some(es => es.toLowerCase() === s.toLowerCase()));

                // Project count based on keyword occurrences
                let projectCount = 0;
                let pIdxSearch = 0;
                while ((pIdxSearch = lowerText.indexOf("project", pIdxSearch)) !== -1) {
                    projectCount++;
                    pIdxSearch += "project".length;
                }

                let certCount = 0;
                let cIdxSearch = 0;
                while ((cIdxSearch = lowerText.indexOf("certif", cIdxSearch)) !== -1) {
                    certCount++;
                    cIdxSearch += "certif".length;
                }

                const extractedProjects = projectCount > 0 
                    ? [`Extracted ${Math.min(projectCount, 3)} projects from text pattern.`] 
                    : ["No explicit project keyword sections detected."];

                const extractedCerts = certCount > 0 
                    ? [`Extracted ${Math.min(certCount, 3)} certifications from text pattern.`] 
                    : ["No explicit certification keyword sections detected."];

                const skillsScore = Math.min(extractedSkills.length * 5, 40);
                const projectsScore = Math.min(Math.max(1, projectCount) * 15, 30);
                const certsScore = Math.min(certCount * 15, 30);
                let totalScore = skillsScore + projectsScore + certsScore;
                totalScore = Math.max(30, Math.min(100, totalScore));

                const recs = [];
                if (extractedSkills.length < 5) {
                    recs.push("Your resume contains few technical skills. Add modern framework skills like React, Node.js, or Spring Boot.");
                }
                if (projectCount === 0) {
                    recs.push("No projects found. Add at least two core engineering projects detailing tech stack and your individual contribution.");
                } else {
                    recs.push("Quantify your project metrics (e.g. 'Improved query latency by 20%' or 'Reduced bundle size by 15%') to draw recruiter attention.");
                }
                if (certCount === 0) {
                    recs.push("No certifications found. Consider getting certified in professional clouds (AWS, GCP) or core programming languages.");
                }
                if (missingSkills.length > 0) {
                    recs.push("Your resume lacks these industry-standard core developer skills: " + missingSkills.join(", "));
                }

                const resumeAnalyses = getDB("resume_analyses");
                let ra = resumeAnalyses.find(r => r.studentUsername === username);
                if (!ra) {
                    ra = { id: resumeAnalyses.length + 1, studentUsername: username };
                    resumeAnalyses.push(ra);
                }

                ra.score = totalScore;
                ra.extractedSkills = extractedSkills.join(",");
                ra.extractedProjects = extractedProjects.join("; ");
                ra.extractedCerts = extractedCerts.join("; ");
                ra.missingSkills = missingSkills.join(",");
                ra.recommendations = recs.join("\n");
                ra.analyzedAt = new Date().toISOString();
                saveDB("resume_analyses", resumeAnalyses);

                // Update Profile
                profile.resumeScore = totalScore;
                if (!profile.skills || !profile.skills.trim()) {
                    profile.skills = extractedSkills.join(",");
                }
                calculateReadinessScore(profile);
                profiles[pIdx] = profile;
                saveDB("profiles", profiles);

                return jsonResponse(ra);
            }

            if (url.endsWith("/api/student/resume/upload") && method === "POST") {
                // For local simulation, we parse the file text (if we mock it) or generate a mock analysis.
                // Since this runs in the browser, file reading is client-side. The dashboard file inputs do submit to this endpoint.
                // We'll read the form file name and construct a mock analysis from mock text.
                const file = body instanceof FormData ? body.get("file") : null;
                const fileName = file ? file.name : "Uploaded_Resume.pdf";
                
                // Read text of the file if it's text-based
                let fileText = "Java, SQL, HTML, project, CSS, certifications, Git";
                if (file && file.size > 0 && typeof file.text === "function") {
                    try {
                        fileText = await file.text();
                    } catch (e) {
                        fileText = "Java, Spring Boot, SQL, Git, Data Structures, Algorithms, project, certification";
                    }
                }

                // Simulate text analysis
                const mockBody = { resumeText: fileText };
                const mockReq = { body: JSON.stringify(mockBody), method: "POST", headers: { "Authorization": `Bearer mock-jwt-token-for-${username}` } };
                
                // Call analyzeResume mapping directly
                const simulatedUrl = url.replace("/resume/upload", "/resume/analyze");
                return window.fetch(simulatedUrl, mockReq);
            }

            // ============================================
            // 5. INTERVIEW QUESTIONS ENDPOINTS
            // ============================================
            if (url.includes("/api/student/questions") && method === "GET") {
                // Handle search and category filtering
                const urlObj = new URL(url, window.location.origin);
                const search = urlObj.searchParams.get("search");
                const category = urlObj.searchParams.get("category");

                const questions = getDB("questions");
                let results = questions;

                if (search && search.trim()) {
                    const q = search.trim().toLowerCase();
                    results = results.filter(item => 
                        item.question.toLowerCase().includes(q) || 
                        item.answer.toLowerCase().includes(q)
                    );
                } else if (category && category.trim() && category.toLowerCase() !== "all") {
                    // Hierarchy prefix matching e.g. "Java" matches "Java/Garbage Collection"
                    const lowerCat = category.trim().toLowerCase();
                    results = results.filter(item => 
                        item.category.toLowerCase() === lowerCat ||
                        item.category.toLowerCase().startsWith(lowerCat + "/")
                    );
                }

                return jsonResponse(results);
            }

            // ============================================
            // 6. CODING CHALLENGES ENDPOINTS
            // ============================================
            if (url.endsWith("/api/student/challenges") && method === "GET") {
                const challenges = getDB("challenges");
                return jsonResponse(challenges);
            }

            if (url.includes("/api/student/challenges/") && url.endsWith("/latest") && method === "GET") {
                const parts = url.split("/");
                const challengeId = parseInt(parts[parts.length - 2]);

                const submissions = getDB("submissions");
                const userSubs = submissions.filter(s => s.studentUsername === username && s.challengeId === challengeId);
                
                if (userSubs.length === 0) {
                    return jsonResponse(null);
                }
                
                // Sort descending by submittedAt
                userSubs.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                return jsonResponse(userSubs[0]);
            }

            if (url.includes("/api/student/challenges/") && url.endsWith("/submit") && method === "POST") {
                const parts = url.split("/");
                const challengeId = parseInt(parts[parts.length - 2]);

                const challenges = getDB("challenges");
                const challenge = challenges.find(c => c.id === challengeId);
                if (!challenge) return errorResponse("Challenge not found");

                const code = body.code || "";
                const language = body.language || "Java";

                let passes = false;
                if (code.trim().length > 30) {
                    const codeLower = code.toLowerCase();
                    const title = challenge.title.toLowerCase();
                    if (title.includes("two sum")) {
                        passes = codeLower.includes("for") && (codeLower.includes("map") || codeLower.includes("hashmap") || codeLower.includes("new"));
                    } else if (title.includes("reverse string")) {
                        passes = codeLower.includes("reverse") || codeLower.includes("swap") || codeLower.includes("while") || codeLower.includes("for");
                    } else if (title.includes("reverse linked list")) {
                        passes = codeLower.includes(".next") && (codeLower.includes("while") || codeLower.includes("curr") || codeLower.includes("prev"));
                    } else if (title.includes("valid parentheses")) {
                        passes = codeLower.includes("stack") || codeLower.includes("push") || codeLower.includes("pop");
                    } else if (title.includes("implement queue")) {
                        passes = codeLower.includes("stack") || codeLower.includes("push") || codeLower.includes("pop");
                    } else if (title.includes("inorder traversal")) {
                        passes = codeLower.includes("left") || codeLower.includes("right");
                    } else {
                        passes = true;
                    }
                }

                const accuracy = passes ? Math.floor(90 + Math.random() * 11) : Math.floor(20 + Math.random() * 30);
                const status = passes ? "SOLVED" : "FAILED";

                const submissions = getDB("submissions");
                const submission = {
                    id: submissions.length + 1,
                    studentUsername: username,
                    challengeId: challengeId,
                    challenge: challenge,
                    code: code,
                    language: language,
                    status: status,
                    accuracy: accuracy,
                    submittedAt: new Date().toISOString()
                };
                submissions.push(submission);
                saveDB("submissions", submissions);

                const profiles = getDB("profiles");
                const pIdx = profiles.findIndex(p => p.username === username);
                
                if (pIdx !== -1 && status === "SOLVED") {
                    const profile = profiles[pIdx];
                    const alreadySolved = submissions.some(s => 
                        s.studentUsername === username && 
                        s.challengeId === challengeId && 
                        s.id !== submission.id && 
                        s.status === "SOLVED"
                    );

                    if (!alreadySolved) {
                        profile.codingScore = (profile.codingScore || 0) + challenge.points;
                        profile.solvedChallengesCount = (profile.solvedChallengesCount || 0) + 1;
                        profile.currentStreak = (profile.currentStreak || 0) + 1;
                    }

                    // Badges Logic
                    const badgesSet = new Set(profile.badges ? profile.badges.split(",").map(b => b.trim()).filter(b => b) : []);
                    const solved = profile.solvedChallengesCount;
                    if (solved >= 1) badgesSet.add("DSA Starter");
                    if (solved >= 4) badgesSet.add("DSA Enthusiast");
                    if (solved >= 7) badgesSet.add("DSA Master");
                    if (profile.resumeScore && profile.resumeScore >= 80) badgesSet.add("Resume Pro");
                    if (profile.placementReadinessScore && profile.placementReadinessScore >= 85) badgesSet.add("Elite Candidate");

                    profile.badges = Array.from(badgesSet).join(",");
                    calculateReadinessScore(profile);
                    profiles[pIdx] = profile;
                    saveDB("profiles", profiles);
                }

                // Evaluate Test Cases
                const testCases = [];
                const tTitle = challenge.title;
                if (tTitle.toLowerCase() === "two sum") {
                    testCases.push({ name: "Test Case 1: Base Array", input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", actual: passes ? "[0,1]" : "[]", passed: passes });
                    testCases.push({ name: "Test Case 2: Negative values", input: "nums = [-3,4,3,90], target = 0", expected: "[0,2]", actual: passes ? "[0,2]" : "[]", passed: passes });
                    testCases.push({ name: "Test Case 3: Same elements", input: "nums = [3,3], target = 6", expected: "[0,1]", actual: passes ? "[0,1]" : "[0,0]", passed: passes });
                } else if (tTitle.toLowerCase() === "reverse string") {
                    testCases.push({ name: "Test Case 1: Simple word", input: "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", expected: "[\"o\",\"l\",\"l\",\"e\",\"h\"]", actual: passes ? "[\"o\",\"l\",\"l\",\"e\",\"h\"]" : "[\"h\",\"e\",\"l\",\"l\",\"o\"]", passed: passes });
                    testCases.push({ name: "Test Case 2: Title word", input: "s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", expected: "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]", actual: passes ? "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]" : "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", passed: passes });
                } else if (tTitle.toLowerCase() === "valid parentheses") {
                    testCases.push({ name: "Test Case 1: Simple match", input: "s = \"()\"", expected: "true", actual: passes ? "true" : "false", passed: passes });
                    testCases.push({ name: "Test Case 2: Multi brackets", input: "s = \"()[]{}\"", expected: "true", actual: passes ? "true" : "false", passed: passes });
                    testCases.push({ name: "Test Case 3: Mismatched brackets", input: "s = \"(]\"", expected: "false", actual: "false", passed: true });
                } else {
                    testCases.push({ name: "Test Case 1: Basic validation", input: "Default parameters", expected: "Success outcome", actual: passes ? "Success outcome" : "Compilation / Logic error", passed: passes });
                    testCases.push({ name: "Test Case 2: Bound checks", input: "Large array boundary", expected: "Success outcome", actual: passes ? "Success outcome" : "Execution timeout", passed: passes });
                }

                return jsonResponse({
                    submission: submission,
                    testCases: testCases
                });
            }

            if (url.endsWith("/api/student/leaderboard") && method === "GET") {
                const profiles = getDB("profiles");
                // Sort profiles: codingScore desc, readinessScore desc, cgpa desc
                const ranked = [...profiles].sort((a, b) => {
                    const cComp = b.codingScore - a.codingScore;
                    if (cComp !== 0) return cComp;
                    const rComp = b.placementReadinessScore - a.placementReadinessScore;
                    if (rComp !== 0) return rComp;
                    return b.cgpa - a.cgpa;
                });

                const topK = ranked.slice(0, 10).map((p, idx) => ({
                    rank: idx + 1,
                    username: p.username,
                    codingScore: p.codingScore,
                    readinessScore: p.placementReadinessScore,
                    cgpa: p.cgpa
                }));

                return jsonResponse(topK);
            }

            // ============================================
            // 7. ROADMAP ENDPOINTS
            // ============================================
            if (url.endsWith("/api/student/roadmap") && method === "POST") {
                const companyId = parseInt(body.companyId);
                const availableDays = parseInt(body.availableDays);

                const companies = getDB("companies");
                const company = companies.find(c => c.id === companyId);
                if (!company) return errorResponse("Company not found");

                const profiles = getDB("profiles");
                const profile = profiles.find(p => p.username === username);
                if (!profile) return errorResponse("Profile not found");

                const allTopics = [
                    { name: "Arrays & Strings", daysRequired: 3, priorityScore: 10, estimatedWeekOrder: 1 },
                    { name: "Linked Lists", daysRequired: 4, priorityScore: 8, estimatedWeekOrder: 2 },
                    { name: "Stack & Queue", daysRequired: 4, priorityScore: 7, estimatedWeekOrder: 3 },
                    { name: "Trees", daysRequired: 5, priorityScore: 9, estimatedWeekOrder: 4 },
                    { name: "Graphs", daysRequired: 7, priorityScore: 8, estimatedWeekOrder: 5 },
                    { name: "Dynamic Programming", daysRequired: 8, priorityScore: 10, estimatedWeekOrder: 6 },
                    { name: "SQL & DBMS", daysRequired: 4, priorityScore: 8, estimatedWeekOrder: 7 },
                    { name: "Operating Systems", daysRequired: 3, priorityScore: 6, estimatedWeekOrder: 8 },
                    { name: "OOP Concepts", daysRequired: 3, priorityScore: 7, estimatedWeekOrder: 9 }
                ];

                const optimizedTopics = getOptimalRoadmapTopics(availableDays, allTopics);

                // Build timeline weeks
                const weeks = [];
                const totalWeeks = Math.max(1, Math.floor(availableDays / 7));
                for (let wIdx = 1; wIdx <= totalWeeks; wIdx++) {
                    weeks.push({ week: "Week " + wIdx, topics: [] });
                }

                if (optimizedTopics.length > 0) {
                    if (totalWeeks >= optimizedTopics.length) {
                        for (let i = 0; i < optimizedTopics.length; i++) {
                            let targetWeekIdx = 0;
                            if (optimizedTopics.length > 1) {
                                targetWeekIdx = Math.round(i * (totalWeeks - 1) / (optimizedTopics.length - 1));
                            }
                            targetWeekIdx = Math.min(totalWeeks - 1, Math.max(0, targetWeekIdx));
                            weeks[targetWeekIdx].topics.push(optimizedTopics[i].name);
                        }

                        // Fill empty weeks
                        for (let wIdx = 0; wIdx < totalWeeks; wIdx++) {
                            if (weeks[wIdx].topics.length === 0) {
                                if (wIdx === totalWeeks - 1) {
                                    weeks[wIdx].topics.push("Final Placement Assessment & " + company.name + " Mock Interview");
                                } else if (wIdx === 0) {
                                    weeks[wIdx].topics.push("Baseline Coding Assessment & Prep Setup");
                                } else if (wIdx % 3 === 0) {
                                    weeks[wIdx].topics.push("Resume Review & Skill Gap Checklist");
                                } else if (wIdx % 2 === 0) {
                                    weeks[wIdx].topics.push("Company-specific Mock Coding Test (" + company.name + " pattern)");
                                } else {
                                    weeks[wIdx].topics.push("Active Revision & Practice on solved DSA challenges");
                                }
                            }
                        }
                    } else {
                        for (let i = 0; i < optimizedTopics.length; i++) {
                            let targetWeekIdx = Math.floor(i * totalWeeks / optimizedTopics.length);
                            targetWeekIdx = Math.min(totalWeeks - 1, Math.max(0, targetWeekIdx));
                            weeks[targetWeekIdx].topics.push(optimizedTopics[i].name);
                        }
                    }
                }

                const roadmaps = getDB("roadmaps");
                const roadmap = {
                    id: roadmaps.length + 1,
                    studentUsername: username,
                    targetCompany: company,
                    availableDays: availableDays,
                    roadmapJson: JSON.stringify(weeks),
                    completedTopics: "",
                    generatedAt: new Date().toISOString()
                };
                roadmaps.push(roadmap);
                saveDB("roadmaps", roadmaps);

                return jsonResponse(roadmap);
            }

            if (url.endsWith("/api/student/roadmap") && method === "GET") {
                const roadmaps = getDB("roadmaps");
                const userRoadmaps = roadmaps.filter(r => r.studentUsername === username);
                if (userRoadmaps.length === 0) {
                    return jsonResponse(null);
                }
                userRoadmaps.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
                return jsonResponse(userRoadmaps[0]);
            }

            if (url.endsWith("/api/student/roadmap/toggle") && (method === "PUT" || method === "POST")) {
                const roadmaps = getDB("roadmaps");
                const userRoadmaps = roadmaps.filter(r => r.studentUsername === username);
                if (userRoadmaps.length === 0) return errorResponse("No active roadmap found");

                userRoadmaps.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
                const active = userRoadmaps[0];

                const topic = body.topic.trim();
                const completedSet = new Set(active.completedTopics ? active.completedTopics.split(",").map(t => t.trim()).filter(t => t) : []);
                
                if (completedSet.has(topic)) {
                    completedSet.delete(topic);
                } else {
                    completedSet.add(topic);
                }

                active.completedTopics = Array.from(completedSet).join(",");

                // Find global index and update
                const rIdx = roadmaps.findIndex(r => r.id === active.id);
                roadmaps[rIdx] = active;
                saveDB("roadmaps", roadmaps);

                return jsonResponse(active);
            }

            // ============================================
            // 8. ADMIN ENDPOINTS
            // ============================================
            if (url.endsWith("/api/admin/stats") && method === "GET") {
                const profiles = getDB("profiles");
                const companies = getDB("companies");
                const questions = getDB("questions");
                const roadmaps = getDB("roadmaps");

                const totalStudents = profiles.length;
                const totalCompanies = companies.length;
                const totalQuestions = questions.length;
                
                // Get unique active roadmaps (by studentUsername)
                const uniqueRoadmaps = new Set(roadmaps.map(r => r.studentUsername));
                const activeRoadmaps = uniqueRoadmaps.size;

                return jsonResponse({
                    totalStudents: totalStudents,
                    totalCompanies: totalCompanies,
                    totalQuestions: totalQuestions,
                    activeRoadmaps: activeRoadmaps
                });
            }

            if (url.endsWith("/api/admin/companies") && method === "GET") {
                const companies = getDB("companies");
                return jsonResponse(companies);
            }

            if (url.endsWith("/api/admin/companies") && method === "POST") {
                const companies = getDB("companies");
                let company = companies.find(c => c.id === body.id);
                if (company) {
                    // Update
                    company.name = body.name || company.name;
                    company.minCgpa = parseFloat(body.minCgpa) || company.minCgpa;
                    company.requiredSkills = body.requiredSkills || company.requiredSkills;
                    company.requiredProjects = parseInt(body.requiredProjects) || company.requiredProjects;
                    company.description = body.description || company.description;
                } else {
                    // Create
                    company = {
                        id: companies.length > 0 ? Math.max(...companies.map(c => c.id)) + 1 : 1,
                        name: body.name,
                        minCgpa: parseFloat(body.minCgpa),
                        requiredSkills: body.requiredSkills,
                        requiredProjects: parseInt(body.requiredProjects),
                        description: body.description
                    };
                    companies.push(company);
                }
                saveDB("companies", companies);
                return jsonResponse(company);
            }

            if (url.includes("/api/admin/companies/") && method === "DELETE") {
                const parts = url.split("/");
                const id = parseInt(parts[parts.length - 1]);
                
                const companies = getDB("companies");
                const filtered = companies.filter(c => c.id !== id);
                saveDB("companies", filtered);
                
                return jsonResponse({ message: "Company deleted successfully" });
            }

            if (url.endsWith("/api/admin/questions") && method === "GET") {
                const questions = getDB("questions");
                return jsonResponse(questions);
            }

            if (url.endsWith("/api/admin/questions") && method === "POST") {
                const questions = getDB("questions");
                let question = questions.find(q => q.id === body.id);
                if (question) {
                    question.category = body.category || question.category;
                    question.difficulty = body.difficulty || question.difficulty;
                    question.question = body.question || question.question;
                    question.answer = body.answer || question.answer;
                    question.company = body.company || question.company;
                } else {
                    question = {
                        id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
                        category: body.category,
                        difficulty: body.difficulty,
                        question: body.question,
                        answer: body.answer,
                        company: body.company || "General"
                    };
                    questions.push(question);
                }
                saveDB("questions", questions);
                return jsonResponse(question);
            }

            if (url.includes("/api/admin/questions/") && method === "DELETE") {
                const parts = url.split("/");
                const id = parseInt(parts[parts.length - 1]);
                
                const questions = getDB("questions");
                const filtered = questions.filter(q => q.id !== id);
                saveDB("questions", filtered);
                
                return jsonResponse({ message: "Question deleted successfully" });
            }

            if (url.endsWith("/api/admin/challenges") && method === "GET") {
                const challenges = getDB("challenges");
                return jsonResponse(challenges);
            }

            if (url.endsWith("/api/admin/challenges") && method === "POST") {
                const challenges = getDB("challenges");
                let challenge = challenges.find(c => c.id === body.id);
                if (challenge) {
                    challenge.title = body.title || challenge.title;
                    challenge.topic = body.topic || challenge.topic;
                    challenge.difficulty = body.difficulty || challenge.difficulty;
                    challenge.points = parseInt(body.points) || challenge.points;
                    challenge.description = body.description || challenge.description;
                } else {
                    challenge = {
                        id: challenges.length > 0 ? Math.max(...challenges.map(c => c.id)) + 1 : 1,
                        title: body.title,
                        topic: body.topic,
                        difficulty: body.difficulty,
                        points: parseInt(body.points),
                        description: body.description
                    };
                    challenges.push(challenge);
                }
                saveDB("challenges", challenges);
                return jsonResponse(challenge);
            }

            if (url.includes("/api/admin/challenges/") && method === "DELETE") {
                const parts = url.split("/");
                const id = parseInt(parts[parts.length - 1]);
                
                const challenges = getDB("challenges");
                const filtered = challenges.filter(c => c.id !== id);
                saveDB("challenges", filtered);
                
                return jsonResponse({ message: "Challenge deleted successfully" });
            }

            if (url.endsWith("/api/admin/students") && method === "GET") {
                const profiles = getDB("profiles");
                // The admin UI expects profile user subfields: User { id, username, email, role }
                const users = getDB("users");
                const studentsWithUsers = profiles.map(p => {
                    const u = users.find(user => user.username === p.username) || {};
                    return {
                        ...p,
                        user: {
                            id: u.id,
                            username: u.username,
                            email: u.email,
                            role: u.role
                        }
                    };
                });
                return jsonResponse(studentsWithUsers);
            }

            if (url.includes("/api/admin/students/") && url.endsWith("/deactivate") && method === "POST") {
                const parts = url.split("/");
                // Format is /api/admin/students/{userId}/deactivate
                const userId = parseInt(parts[parts.length - 2]);

                const users = getDB("users");
                const userIdx = users.findIndex(u => u.id === userId);
                if (userIdx === -1) return errorResponse("User not found");

                const targetUsername = users[userIdx].username;

                // Deactivate profile: we can remove it or set a flag. In Java service it deletes the profile.
                const profiles = getDB("profiles");
                const filteredProfiles = profiles.filter(p => p.username !== targetUsername);
                saveDB("profiles", filteredProfiles);

                users.splice(userIdx, 1);
                saveDB("users", users);

                return jsonResponse({ message: "Student deactivated successfully" });
            }

            if (url.includes("/api/admin/companies/") && url.endsWith("/eligible/export") && method === "GET") {
                const parts = url.split("/");
                // format: /api/admin/companies/{companyId}/eligible/export
                const companyId = parseInt(parts[parts.length - 3]);

                const companies = getDB("companies");
                const company = companies.find(c => c.id === companyId);
                if (!company) return errorResponse("Company not found");

                const profiles = getDB("profiles");
                const users = getDB("users");
                
                let csv = "Student ID,Username,Email,CGPA,Projects Count,Skills,Readiness Score,Coding Score\n";
                const companySkills = new Set(company.requiredSkills.split(",").map(s => s.trim().toLowerCase()));

                profiles.forEach(profile => {
                    const u = users.find(usr => usr.username === profile.username) || {};
                    if (u.role !== "STUDENT") return;

                    let eligible = true;
                    if (profile.cgpa < company.minCgpa) eligible = false;
                    if (profile.projectsCount < company.requiredProjects) eligible = false;

                    const studentSkills = (profile.skills || "").split(",").map(s => s.trim().toLowerCase());
                    const missing = company.requiredSkills.split(",").map(s => s.trim()).filter(s => !studentSkills.includes(s.toLowerCase()));
                    if (missing.length > 0) eligible = false;

                    if (eligible) {
                        const cleanSkills = profile.skills || "";
                        csv += `${profile.id},${profile.username},${u.email || ""},${profile.cgpa},${profile.projectsCount},"${cleanSkills.replace(/"/g, '""')}",${profile.placementReadinessScore},${profile.codingScore}\n`;
                    }
                });

                // In browser, return CSV text with appropriate headers
                return Promise.resolve(new Response(csv, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/csv; charset=UTF-8",
                        "Content-Disposition": `attachment; filename=eligible_students_${company.name.replace(/[^a-zA-Z0-9]/g, "_")}.csv`
                    }
                }));
            }

            return errorResponse("MockAPI Endpoint Not Found: " + url, 404);

        } catch (e) {
            console.error("MockAPI Engine Error: ", e);
            return errorResponse("MockAPI Engine Exception: " + e.message, 500);
        }
    };

    // Private helper for Knapsack Topic selection
    function getOptimalRoadmapTopics(availableDays, allTopics) {
        const n = allTopics.length;
        const dp = Array.from({ length: n + 1 }, () => Array(availableDays + 1).fill(0));

        for (let i = 1; i <= n; i++) {
            const topic = allTopics[i - 1];
            for (let w = 0; w <= availableDays; w++) {
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

        const selected = [];
        let w = availableDays;
        for (let i = n; i > 0; i--) {
            if (dp[i][w] !== dp[i - 1][w]) {
                const topic = allTopics[i - 1];
                selected.push(topic);
                w -= topic.daysRequired;
            }
        }

        selected.sort((a, b) => a.estimatedWeekOrder - b.estimatedWeekOrder);
        return selected;
    }

})();
