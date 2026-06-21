-- PlacementIQ Database Schema (MySQL Compatible)
-- Note: Set up a schema named 'placementiqdb' before running this script.

CREATE DATABASE IF NOT EXISTS placementiqdb;
USE placementiqdb;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    cgpa DOUBLE DEFAULT 0.0,
    dsa_rating INT DEFAULT 0,
    projects_count INT DEFAULT 0,
    internships_count INT DEFAULT 0,
    certifications_count INT DEFAULT 0,
    communication_score INT DEFAULT 0,
    placement_readiness_score INT DEFAULT 0,
    resume_score INT DEFAULT 0,
    coding_score INT DEFAULT 0,
    skills TEXT,
    bio VARCHAR(255),
    solved_challenges_count INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    badges TEXT,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    min_cgpa DOUBLE NOT NULL,
    required_skills TEXT NOT NULL,
    required_projects INT NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Interview Questions Table
CREATE TABLE IF NOT EXISTS interview_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    company_name VARCHAR(100) DEFAULT 'General'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Coding Challenges Table
CREATE TABLE IF NOT EXISTS coding_challenges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    points INT NOT NULL,
    topic VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Challenge Submissions Table
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    challenge_id BIGINT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    accuracy INT NOT NULL,
    submitted_at DATETIME NOT NULL,
    CONSTRAINT fk_submission_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_challenge FOREIGN KEY (challenge_id) REFERENCES coding_challenges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Resume Analysis Table
CREATE TABLE IF NOT EXISTS resume_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL UNIQUE,
    score INT NOT NULL,
    extracted_skills TEXT,
    extracted_projects TEXT,
    extracted_certs TEXT,
    missing_skills TEXT,
    recommendations TEXT,
    analyzed_at DATETIME NOT NULL,
    CONSTRAINT fk_analysis_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Learning Roadmaps Table
CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    target_company_id BIGINT NOT NULL,
    available_days INT NOT NULL,
    roadmap_json TEXT NOT NULL,
    completed_topics TEXT,
    generated_at DATETIME NOT NULL,
    CONSTRAINT fk_roadmap_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_roadmap_company FOREIGN KEY (target_company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_content LONGTEXT,
    uploaded_at DATETIME NOT NULL,
    CONSTRAINT fk_resume_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Eligibility Results Table
CREATE TABLE IF NOT EXISTS eligibility_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    eligible BOOLEAN NOT NULL,
    reasons TEXT,
    checked_at DATETIME NOT NULL,
    CONSTRAINT fk_eligibility_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_eligibility_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Leaderboards Table
CREATE TABLE IF NOT EXISTS leaderboards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL UNIQUE,
    rank_val INT NOT NULL,
    coding_score INT NOT NULL,
    readiness_score INT NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_leaderboard_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

