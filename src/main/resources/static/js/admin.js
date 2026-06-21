const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const username = localStorage.getItem('username');

if (!token || role !== 'ADMIN') {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adminUsernameDisplay').textContent = username || 'Admin';

    // Theme support
    initTheme();

    // Default section load
    showSection('admin-dashboard');

    // Sidebar toggle
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // Modal submit bindings
    document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);
    document.getElementById('questionForm').addEventListener('submit', handleQuestionSubmit);
    document.getElementById('challengeForm').addEventListener('submit', handleChallengeSubmit);
});

// Theme support (light/dark mode)
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
}

// Section routing
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('d-none'));
    // Show selected section
    document.getElementById(sectionId).classList.remove('d-none');

    // Update active sidebar nav
    document.querySelectorAll('#sidebar ul li').forEach(li => li.classList.remove('active'));
    
    // Find active nav item
    const navItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (navItem) {
        navItem.parentElement.classList.add('active');
    }

    // Load section data
    if (sectionId === 'admin-dashboard') {
        loadDashboardStats();
    } else if (sectionId === 'admin-companies') {
        loadCompanies();
    } else if (sectionId === 'admin-questions') {
        loadQuestions();
    } else if (sectionId === 'admin-challenges') {
        loadChallenges();
    } else if (sectionId === 'admin-students') {
        loadStudents();
    }
}

// Fetch helper with auth header
async function authenticatedFetch(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 403 || response.status === 401) {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }
    
    return response;
}

// Dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await authenticatedFetch('/api/admin/stats');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        document.getElementById('statTotalStudents').textContent = data.totalStudents;
        document.getElementById('statTotalCompanies').textContent = data.totalCompanies;
        document.getElementById('statTotalQuestions').textContent = data.totalQuestions;
        document.getElementById('statTotalChallenges').textContent = data.totalChallenges;

    } catch (err) {
        console.error('Failed to load dashboard stats:', err);
    }
}

// CRUD Companies
async function loadCompanies() {
    const tbody = document.querySelector('#companiesTable tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading companies...</td></tr>';

    try {
        const response = await authenticatedFetch('/api/admin/companies');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        tbody.innerHTML = '';
        data.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${c.id}</strong></td>
                <td>${c.name}</td>
                <td>${c.minCgpa}</td>
                <td><span class="small">${c.requiredSkills}</span></td>
                <td>
                    <button onclick="editCompany(${c.id}, '${c.name.replace(/'/g, "\\'")}', ${c.minCgpa}, '${c.requiredSkills.replace(/'/g, "\\'")}', ${c.requiredProjects}, '${c.description.replace(/'/g, "\\'")}')" class="btn btn-sm btn-outline-primary me-1" title="Edit"><i class="bi bi-pencil-square"></i></button>
                    <button onclick="exportEligibleStudents(${c.id}, '${c.name.replace(/'/g, "\\'")}')" class="btn btn-sm btn-outline-success me-1" title="Export Eligible Students"><i class="bi bi-file-earmark-arrow-down-fill"></i></button>
                    <button onclick="deleteCompany(${c.id})" class="btn btn-sm btn-outline-danger" title="Delete"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">${err.message}</td></tr>`;
    }
}

function openAddCompanyModal() {
    document.getElementById('companyId').value = '';
    document.getElementById('companyForm').reset();
    document.getElementById('companyModalLabel').textContent = 'Add Company';
    new bootstrap.Modal(document.getElementById('companyModal')).show();
}

function editCompany(id, name, minCgpa, requiredSkills, requiredProjects, description) {
    document.getElementById('companyId').value = id;
    document.getElementById('companyName').value = name;
    document.getElementById('companyCgpa').value = minCgpa;
    document.getElementById('companySkills').value = requiredSkills;
    document.getElementById('companyProjects').value = requiredProjects;
    document.getElementById('companyDesc').value = description;
    
    document.getElementById('companyModalLabel').textContent = 'Edit Company';
    new bootstrap.Modal(document.getElementById('companyModal')).show();
}

async function handleCompanySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('companyId').value;
    const body = {
        id: id ? parseInt(id) : null,
        name: document.getElementById('companyName').value,
        minCgpa: parseFloat(document.getElementById('companyCgpa').value),
        requiredSkills: document.getElementById('companySkills').value,
        requiredProjects: parseInt(document.getElementById('companyProjects').value),
        description: document.getElementById('companyDesc').value
    };

    try {
        const response = await authenticatedFetch('/api/admin/companies', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('Failed to save company');

        bootstrap.Modal.getInstance(document.getElementById('companyModal')).hide();
        loadCompanies();

    } catch (err) {
        alert(err.message);
    }
}

async function deleteCompany(id) {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
        const response = await authenticatedFetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        loadCompanies();
    } catch (err) {
        alert(err.message);
    }
}

// CRUD Questions
async function loadQuestions() {
    const tbody = document.querySelector('#questionsTable tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading questions...</td></tr>';

    try {
        const response = await authenticatedFetch('/api/admin/questions');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        tbody.innerHTML = '';
        data.forEach(q => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${q.id}</strong></td>
                <td>${q.category}</td>
                <td><span class="badge bg-secondary">${q.difficulty}</span></td>
                <td><div class="text-truncate" style="max-width: 250px;">${q.question}</div></td>
                <td>
                    <button onclick="editQuestion(${q.id}, '${q.category.replace(/'/g, "\\'")}', '${q.difficulty}', '${q.question.replace(/'/g, "\\'")}', '${q.answer.replace(/'/g, "\\'")}', '${q.companyName.replace(/'/g, "\\'")}', '${(q.optionA || '').replace(/'/g, "\\'")}', '${(q.optionB || '').replace(/'/g, "\\'")}', '${(q.optionC || '').replace(/'/g, "\\'")}', '${(q.optionD || '').replace(/'/g, "\\'")}', '${q.correctOption || ''}', '${(q.explanation || '').replace(/'/g, "\\'")}')" class="btn btn-sm btn-outline-primary me-2"><i class="bi bi-pencil-square"></i></button>
                    <button onclick="deleteQuestion(${q.id})" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">${err.message}</td></tr>`;
    }
}

function openAddQuestionModal() {
    document.getElementById('questionId').value = '';
    document.getElementById('questionForm').reset();
    document.getElementById('questionModalLabel').textContent = 'Add Question';
    new bootstrap.Modal(document.getElementById('questionModal')).show();
}

function editQuestion(id, category, difficulty, question, answer, companyName, optionA, optionB, optionC, optionD, correctOption, explanation) {
    document.getElementById('questionId').value = id;
    document.getElementById('questionCategory').value = category;
    document.getElementById('questionDifficulty').value = difficulty;
    document.getElementById('questionText').value = question;
    document.getElementById('questionAnswer').value = answer;
    document.getElementById('questionCompany').value = companyName;
    document.getElementById('questionOptionA').value = optionA || '';
    document.getElementById('questionOptionB').value = optionB || '';
    document.getElementById('questionOptionC').value = optionC || '';
    document.getElementById('questionOptionD').value = optionD || '';
    document.getElementById('questionCorrectOption').value = correctOption || '';
    document.getElementById('questionExplanation').value = explanation || '';
    
    document.getElementById('questionModalLabel').textContent = 'Edit Question';
    new bootstrap.Modal(document.getElementById('questionModal')).show();
}

async function handleQuestionSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('questionId').value;
    const body = {
        id: id ? parseInt(id) : null,
        category: document.getElementById('questionCategory').value,
        difficulty: document.getElementById('questionDifficulty').value,
        question: document.getElementById('questionText').value,
        answer: document.getElementById('questionAnswer').value,
        companyName: document.getElementById('questionCompany').value || 'General',
        optionA: document.getElementById('questionOptionA').value || null,
        optionB: document.getElementById('questionOptionB').value || null,
        optionC: document.getElementById('questionOptionC').value || null,
        optionD: document.getElementById('questionOptionD').value || null,
        correctOption: document.getElementById('questionCorrectOption').value || null,
        explanation: document.getElementById('questionExplanation').value || null
    };

    try {
        const response = await authenticatedFetch('/api/admin/questions', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('Failed to save question');

        bootstrap.Modal.getInstance(document.getElementById('questionModal')).hide();
        loadQuestions();

    } catch (err) {
        alert(err.message);
    }
}

async function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
        const response = await authenticatedFetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        loadQuestions();
    } catch (err) {
        alert(err.message);
    }
}

// CRUD Challenges
async function loadChallenges() {
    const tbody = document.querySelector('#challengesTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading challenges...</td></tr>';

    try {
        const response = await authenticatedFetch('/api/admin/challenges');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        tbody.innerHTML = '';
        data.forEach(ch => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${ch.id}</strong></td>
                <td>${ch.title}</td>
                <td>${ch.topic}</td>
                <td><span class="badge bg-secondary">${ch.difficulty}</span></td>
                <td>${ch.points}</td>
                <td>
                    <button onclick="editChallenge(${ch.id}, '${ch.title.replace(/'/g, "\\'")}', '${ch.topic}', '${ch.difficulty}', ${ch.points}, '${ch.description.replace(/'/g, "\\'")}')" class="btn btn-sm btn-outline-primary me-2"><i class="bi bi-pencil-square"></i></button>
                    <button onclick="deleteChallenge(${ch.id})" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">${err.message}</td></tr>`;
    }
}

function openAddChallengeModal() {
    document.getElementById('challengeId').value = '';
    document.getElementById('challengeForm').reset();
    document.getElementById('challengeModalLabel').textContent = 'Add Challenge';
    new bootstrap.Modal(document.getElementById('challengeModal')).show();
}

function editChallenge(id, title, topic, difficulty, points, description) {
    document.getElementById('challengeId').value = id;
    document.getElementById('challengeTitle').value = title;
    document.getElementById('challengeTopic').value = topic;
    document.getElementById('challengeDifficulty').value = difficulty;
    document.getElementById('challengePoints').value = points;
    document.getElementById('challengeDesc').value = description;
    
    document.getElementById('challengeModalLabel').textContent = 'Edit Challenge';
    new bootstrap.Modal(document.getElementById('challengeModal')).show();
}

async function handleChallengeSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('challengeId').value;
    const body = {
        id: id ? parseInt(id) : null,
        title: document.getElementById('challengeTitle').value,
        topic: document.getElementById('challengeTopic').value,
        difficulty: document.getElementById('challengeDifficulty').value,
        points: parseInt(document.getElementById('challengePoints').value),
        description: document.getElementById('challengeDesc').value
    };

    try {
        const response = await authenticatedFetch('/api/admin/challenges', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('Failed to save challenge');

        bootstrap.Modal.getInstance(document.getElementById('challengeModal')).hide();
        loadChallenges();

    } catch (err) {
        alert(err.message);
    }
}

async function deleteChallenge(id) {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    try {
        const response = await authenticatedFetch(`/api/admin/challenges/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        loadChallenges();
    } catch (err) {
        alert(err.message);
    }
}

// Student management
let studentsList = [];

async function loadStudents() {
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading students...</td></tr>';

    try {
        const response = await authenticatedFetch('/api/admin/students');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        studentsList = data;
        renderStudentsTable(studentsList);

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">${err.message}</td></tr>`;
    }
}

function renderStudentsTable(list) {
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '';
    
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No students matching filters found.</td></tr>';
        return;
    }
    
    list.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>${p.user.username}</td>
            <td>${p.cgpa}</td>
            <td>${p.placementReadinessScore}%</td>
            <td>${p.codingScore}</td>
            <td>
                <button onclick="deactivateStudent(${p.user.id})" class="btn btn-sm btn-danger">Deactivate</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterStudentsTable() {
    const searchVal = document.getElementById('searchStudentInput').value.toLowerCase().trim();
    const readinessVal = document.getElementById('filterStudentReadiness').value;
    
    let filtered = studentsList;
    
    if (searchVal) {
        filtered = filtered.filter(p => p.user.username.toLowerCase().includes(searchVal));
    }
    
    if (readinessVal === 'high') {
        filtered = filtered.filter(p => p.placementReadinessScore >= 75);
    } else if (readinessVal === 'medium') {
        filtered = filtered.filter(p => p.placementReadinessScore >= 50 && p.placementReadinessScore < 75);
    } else if (readinessVal === 'low') {
        filtered = filtered.filter(p => p.placementReadinessScore < 50);
    }
    
    renderStudentsTable(filtered);
}

async function exportEligibleStudents(companyId, name) {
    try {
        const response = await fetch(`/api/admin/companies/${companyId}/eligible/export`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 403 || response.status === 401) {
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }
        if (!response.ok) throw new Error('Failed to export CSV file.');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eligible_students_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert(err.message);
    }
}

async function deactivateStudent(userId) {
    if (!confirm('Are you sure you want to deactivate (delete) this student account?')) return;
    try {
        const response = await authenticatedFetch(`/api/admin/students/${userId}/deactivate`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to deactivate');
        loadStudents();
    } catch (err) {
        alert(err.message);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
