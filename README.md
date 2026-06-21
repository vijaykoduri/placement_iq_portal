# PlacementIQ – Placement Prediction & Interview Preparation Platform

PlacementIQ is a full-stack web application designed to help students evaluate placement readiness, perform skill gap analysis, analyze resumes, practice daily coding challenges, study interview questions, and generate optimized learning roadmaps.

## Technical Stack
- **Frontend**: HTML5, CSS3 (Custom Glassmorphism/Dark Theme Variables), JavaScript, Bootstrap 5, Chart.js
- **Backend**: Java, Spring Boot 2.7.18, Maven
- **Database**: H2 Database (configured with MySQL compatibility for zero-setup execution) & MySQL-ready schema.
- **Authentication**: Stateless JWT token security, Role-Based Access Control (Student vs Admin).

---

## Core Features & DSA Implementations

Our platform strictly adheres to the requested Data Structures and Algorithms implementation requirements. All DSA implementations are housed in the utility helper class [`DsaHelper.java`](file:///C:/Users/vijay/.gemini/antigravity-ide/scratch/placement-iq/src/main/java/com/placementiq/util/DsaHelper.java):

1. **HashMap**: Used for **Skill Frequency tracking & Resume keyword analysis**. It scans input text against a technical skills library, tracking frequency occurrences in O(1) average time.
2. **HashSet**: Used for **Skill Gap detection**. It compares the student's skills set with a company's required skills set, executing mathematical difference operations in O(1) time.
3. **Sorting**: Used to **Rank students on the Coding Leaderboard**. Custom comparators sort student profiles by coding score (descending), readiness score (descending), and CGPA.
4. **Tree**: Used to **Categorize interview questions**. We build a category node structure (e.g. Root -> OOP -> Polymorphism) allowing hierarchical question retrieval and mapping.
5. **Priority Queue**: Used to retrieve **Top Performers** for the leaderboard. A min-heap bounds leaderboard sizes to the top K performers, keeping retrieval times at O(N log K).
6. **Dynamic Programming**: Used for **Learning Roadmap optimization**. Given a target company and study days limit, we run a 0/1 Knapsack DP algorithm, maximizing readiness values by selecting the best subset of topics that fit within the days threshold.

---

## Folder Structure

```
placement-iq/
├── pom.xml                               # Maven configurations
├── schema.sql                            # Production-ready MySQL table schema
├── README.md                             # Technical documentation
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── placementiq/
        │           ├── PlacementIqApplication.java  # App Entry point
        │           ├── config/
        │           │   ├── DatabaseSeeder.java      # Programmatic database populator
        │           │   ├── JwtAuthenticationFilter.java
        │           │   └── SecurityConfig.java
        │           ├── controller/
        │           │   ├── AuthController.java
        │           │   ├── StudentController.java
        │           │   └── AdminController.java
        │           ├── model/                       # JPA Database Entities
        │           ├── repository/                  # JPA Database Repositories
        │           ├── service/                     # Business Logic Services
        │           └── util/
        │               ├── JwtUtil.java
        │               └── DsaHelper.java           # Custom DSA Core Algorithms
        └── resources/
            ├── application.properties    # Server, JWT, and H2 database config
            └── static/                   # Glassmorphism UI Frontend Static Resources
                ├── index.html            # Landing / Login / Register Page
                ├── dashboard.html        # Student panel
                ├── admin.html            # Admin panel
                ├── css/
                │   └── styles.css        # Premium custom theme stylesheet
                └── js/
                    ├── auth.js           # Session token logins
                    ├── dashboard.js      # Student API endpoints binder
                    ├── admin.js          # Admin CRUD editor
                    └── charts.js         # Chart.js radar & polar configs
```

---

## Instructions to Run the Project

Since we downloaded a portable Maven instance inside the scratch directory, you can build and run this application with a single command line without installing any global dependencies:

### 1. Build the application
In a terminal, navigate to the `placement-iq` folder and run the portable Maven compile phase:
```bash
C:\Users\vijay\.gemini\antigravity-ide\scratch\apache-maven-3.8.8\bin\mvn clean package
```

### 2. Run the dev server
Run the Spring Boot application:
```bash
C:\Users\vijay\.gemini\antigravity-ide\scratch\apache-maven-3.8.8\bin\mvn spring-boot:run
```

Once running, access the portal in your browser:
*   **Web Portal**: [http://localhost:8080](http://localhost:8080) (serves the static frontend dynamically)
*   **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:placementiqdb`, Username: `sa`, Password: `password`)

### 3. Logins Prepopulated
*   **Student Account**: Username: `student` | Password: `student123`
*   **Admin Account**: Username: `admin` | Password: `admin123`
