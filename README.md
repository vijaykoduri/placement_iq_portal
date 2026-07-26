# PlacementIQ – Placement Prediction & Interview Preparation Platform

PlacementIQ is a full-stack web application designed to help students evaluate placement readiness, perform skill gap analysis, analyze resumes, practice daily coding challenges, study interview questions, and generate optimized learning roadmaps.

## 🚀 Serverless Deployment & GitHub Pages

The frontend architecture is fully configured to run **serverless** and can be deployed directly to **GitHub Pages**. All database operations, authentication controls, and algorithm models (like Knapsack DP timeline planning) are simulated client-side using a browser-based Mock API layer backed by `localStorage`.

### Key Features
1. **Resume Analysis**: Scan and extract technical skill frequencies from resumes using simulated pattern analysis.
2. **Skill Gap Detection**: Highlight missing target skills compared to top recruiters (Google, Amazon, TCS, etc.) using Set operations.
3. **Timeline Optimization**: Calculate optimized learning roadmaps within a day threshold using the **0/1 Knapsack Dynamic Programming** algorithm.
4. **Leaderboard Ranking**: Rank student profiles by coding score, CGPA, and readiness metrics.
5. **Coding Challenges**: Submit challenge solutions evaluated in real-time against test cases.
6. **Administrative Dashboard**: Manage company requirements, add coding challenges, modify prep questions, and export candidate lists to CSV.

---

## 💻 Running the Project Locally

Since the frontend operates statically, you can launch the interface using any local web server.

### Option A: Python HTTP Server (Recommended)
1. In your terminal, navigate to the project directory:
   ```bash
   cd "placement-iq"
   ```
2. Start Python's built-in HTTP server:
   ```bash
   python -m http.server 8000
   ```
3. Open [http://localhost:8000](http://localhost:8000) in your web browser.

### Option B: Node.js (http-server)
1. Run:
   ```bash
   npx http-server -p 8000
   ```
2. Open [http://localhost:8000](http://localhost:8000) in your web browser.

### Option C: File Explorer
- Double-click the [index.html](index.html) file inside the project folder to open it directly in your browser.

---

## 🔑 Default Accounts (Prepopulated)
- **Student Account**: Username: `student` | Password: `student123`
- **Admin Account**: Username: `admin` | Password: `admin123`

---

## ☕ Spring Boot Java Backend (Optional)

If you wish to run the project using the native Java Spring Boot REST APIs and H2 database:

### Structure Reference
- **Frontend Files**: Stored in `src/main/resources/static/`
- **Backend Entry Point**: [`PlacementIqApplication.java`](src/main/java/com/placementiq/PlacementIqApplication.java)
- **DSA Utility helper**: [`DsaHelper.java`](src/main/java/com/placementiq/util/DsaHelper.java)
- **Database configuration**: H2 database settings are defined in [`application.properties`](src/main/resources/application.properties)

### Launch Steps:
1. Build the package:
   ```bash
   mvn clean package
   ```
2. Run the application:
   ```bash
   mvn spring-boot:run
   ```
3. Access the web app at [http://localhost:8080](http://localhost:8080).
