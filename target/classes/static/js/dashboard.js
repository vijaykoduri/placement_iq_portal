const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
    window.location.href = 'index.html';
}

// Global lists
let companiesList = [];
let currentChallengeId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Show logged in user name
    document.getElementById('usernameDisplay').textContent = username || 'Student';

    // Toggle theme initialization
    initTheme();

    // Load default section (Dashboard)
    showSection('dashboard-section');
    loadProfileAndStats();

    // Setup sidebar collapse
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // Bind event listeners for forms
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('analyzeResumeBtn').addEventListener('click', handleResumeAnalysis);
    document.getElementById('generateRoadmapBtn').addEventListener('click', handleRoadmapGeneration);

    // PDF/Text Drag & Drop resume upload listeners
    const dropZone = document.getElementById('resumeDropZone');
    const fileInput = document.getElementById('resumeFileInput');
    const uploadBtn = document.getElementById('uploadResumeBtn');
    
    if (dropZone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--primary-color)';
                dropZone.style.background = 'rgba(99, 102, 241, 0.05)';
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--border-color)';
                dropZone.style.background = 'var(--bg-tertiary)';
            }, false);
        });
        
        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateUploadFeedback(files[0].name);
            }
        });
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                updateUploadFeedback(fileInput.files[0].name);
            }
        });
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleResumeFileUpload);
    }
});

function updateUploadFeedback(fileName) {
    const feedback = document.getElementById('uploadFileFeedback');
    if (feedback) {
        feedback.textContent = `Selected: ${fileName}`;
        feedback.classList.remove('d-none');
    }
}

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
            // Re-render charts for grid line color adjustments
            if (currentProfile) {
                renderReadinessChart('readinessChart', currentProfile.placementReadinessScore, currentProfile.resumeScore, currentProfile.codingScore);
                renderSkillsChart('skillsChart', currentProfile.skills);
            }
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

    // Trigger load features based on section selected
    if (sectionId === 'dashboard-section') {
        loadProfileAndStats();
    } else if (sectionId === 'eligibility-section') {
        loadEligibilityData();
    } else if (sectionId === 'interview-section') {
        loadInterviewQuestions();
    } else if (sectionId === 'coding-section') {
        loadCodingChallenges();
        loadLeaderboard();
    } else if (sectionId === 'roadmap-section') {
        loadRoadmapForm();
        fetchActiveRoadmap();
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
        // Expired sessions
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }
    
    return response;
}

let currentProfile = null;

async function loadProfileAndStats() {
    try {
        const response = await authenticatedFetch('/api/student/profile');
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);

        const profile = data.profile;
        currentProfile = profile;
        const completion = data.profileCompletion;

        // Fill dashboard overview values
        document.getElementById('readinessScoreDisplay').textContent = profile.placementReadinessScore + '%';
        document.getElementById('resumeScoreDisplay').textContent = profile.resumeScore + '%';
        document.getElementById('codingScoreDisplay').textContent = profile.codingScore;
        document.getElementById('completionDisplay').textContent = completion + '%';
        
        // Progress bar sizing
        document.getElementById('completionBar').style.width = completion + '%';

        // Solved challenges & streak count
        document.getElementById('solvedChallengesDisplay').textContent = profile.solvedChallengesCount || 0;
        document.getElementById('currentStreakDisplay').textContent = profile.currentStreak || 0;

        // Render badges
        const badgesContainer = document.getElementById('badgesContainer');
        if (badgesContainer) {
            badgesContainer.innerHTML = '';
            if (profile.badges && profile.badges.trim() !== '') {
                const badgesList = profile.badges.split(',');
                badgesList.forEach(badgeName => {
                    const badgeEl = document.createElement('span');
                    badgeEl.className = 'badge border text-primary p-2 px-3 m-1 font-weight-bold';
                    badgeEl.style.backgroundColor = 'var(--primary-glow)';
                    badgeEl.style.borderColor = 'var(--primary-color)';
                    
                    let iconClass = 'bi-award-fill';
                    if (badgeName.includes('DSA')) iconClass = 'bi-code-slash';
                    if (badgeName.includes('Resume')) iconClass = 'bi-file-earmark-text-fill';
                    if (badgeName.includes('Elite')) iconClass = 'bi-trophy-fill text-warning';
                    
                    badgeEl.innerHTML = `<i class="bi ${iconClass} me-2"></i>${badgeName}`;
                    badgesContainer.appendChild(badgeEl);
                });
            } else {
                badgesContainer.innerHTML = '<span class="text-muted small">Solve coding challenges and improve your resume to unlock achievements badges!</span>';
            }
        }

        // Load profile inputs
        document.getElementById('cgpaInput').value = profile.cgpa || '';
        document.getElementById('dsaInput').value = profile.dsaRating || '';
        document.getElementById('projectsInput').value = profile.projectsCount || '';
        document.getElementById('internshipsInput').value = profile.internshipsCount || '';
        document.getElementById('certsInput').value = profile.certificationsCount || '';
        document.getElementById('commInput').value = profile.communicationScore || '';
        document.getElementById('skillsInput').value = profile.skills || '';
        document.getElementById('bioInput').value = profile.bio || '';

        // Fill resume display overview
        if (data.resumeAnalysis) {
            document.getElementById('resumeAnalyzedCard').classList.remove('d-none');
            document.getElementById('resumeUnanalyzedCard').classList.add('d-none');
            document.getElementById('resumeScoreText').textContent = data.resumeAnalysis.score + '/100';
            document.getElementById('resumeExtractedSkills').textContent = data.resumeAnalysis.extractedSkills || 'None';
            document.getElementById('resumeRecommendations').innerHTML = data.resumeAnalysis.recommendations.split('\n').map(r => `<li>${r}</li>`).join('');
        } else {
            document.getElementById('resumeAnalyzedCard').classList.add('d-none');
            document.getElementById('resumeUnanalyzedCard').classList.remove('d-none');
        }

        // Render charts using Chart.js helper
        renderReadinessChart('readinessChart', profile.placementReadinessScore, profile.resumeScore, profile.codingScore);
        renderSkillsChart('skillsChart', profile.skills);

        // Fetch company count eligibility to display on dashboard card
        const eligResponse = await authenticatedFetch('/api/student/eligibility');
        const eligData = await eligResponse.json();
        if (eligResponse.ok) {
            const eligibleCount = eligData.filter(c => c.eligible).length;
            document.getElementById('eligibilityCountDisplay').textContent = `${eligibleCount} / ${eligData.length}`;
        }

    } catch (err) {
        console.error('Failed to load profile stats:', err);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const profileData = {
        cgpa: parseFloat(document.getElementById('cgpaInput').value) || 0.0,
        dsaRating: parseInt(document.getElementById('dsaInput').value) || 0,
        projectsCount: parseInt(document.getElementById('projectsInput').value) || 0,
        internshipsCount: parseInt(document.getElementById('internshipsInput').value) || 0,
        certificationsCount: parseInt(document.getElementById('certsInput').value) || 0,
        communicationScore: parseInt(document.getElementById('commInput').value) || 0,
        skills: document.getElementById('skillsInput').value,
        bio: document.getElementById('bioInput').value
    };

    try {
        const response = await authenticatedFetch('/api/student/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });

        if (!response.ok) throw new Error('Failed to update profile');

        alert('Profile saved successfully and readiness score recalculated.');
        loadProfileAndStats();

    } catch (err) {
        alert(err.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}

async function handleResumeAnalysis() {
    const text = document.getElementById('resumeTextInput').value;
    const analyzeBtn = document.getElementById('analyzeResumeBtn');
    const loading = document.getElementById('resumeLoading');
    const results = document.getElementById('resumeResults');

    if (!text || text.trim() === '') {
        alert('Please paste or write your resume text first.');
        return;
    }

    analyzeBtn.disabled = true;
    loading.classList.remove('d-none');
    results.classList.add('d-none');

    try {
        const response = await authenticatedFetch('/api/student/resume/analyze', {
            method: 'POST',
            body: JSON.stringify({ resumeText: text })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to analyze resume.');

        // Fill in results
        document.getElementById('resScoreBadge').textContent = data.score + '/100';
        document.getElementById('resSkillsBadge').textContent = data.extractedSkills || 'None detected';
        document.getElementById('resProjects').textContent = data.extractedProjects || 'None';
        document.getElementById('resCerts').textContent = data.extractedCerts || 'None';
        document.getElementById('resMissing').textContent = data.missingSkills || 'No core skills missing';
        
        // Bullet point recommendations
        document.getElementById('resRecs').innerHTML = data.recommendations.split('\n').map(r => `<li>${r}</li>`).join('');

        results.classList.remove('d-none');
        loadProfileAndStats(); // Update dashboard components

    } catch (err) {
        alert(err.message);
    } finally {
        analyzeBtn.disabled = false;
        loading.classList.add('d-none');
    }
}

async function loadEligibilityData() {
    const container = document.getElementById('eligibilityContainer');
    container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        const response = await authenticatedFetch('/api/student/eligibility');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        container.innerHTML = '';
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-md-6 mb-4';

            const statusClass = item.eligible ? 'badge-eligible' : 'badge-not-eligible';
            const reasonsHtml = item.reasons.map(r => `<div class="text-danger small mt-1"><i class="bi bi-x-circle-fill me-1"></i>${r}</div>`).join('');

            card.innerHTML = `
                <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4 class="m-0 font-weight-bold text-primary">${item.companyName}</h4>
                            <span class="badge ${statusClass} px-3 py-2 font-weight-bold">${item.status}</span>
                        </div>
                        <div class="text-secondary small mb-3">
                            <strong>Criteria:</strong> Min CGPA: ${item.minCgpa} | Skills: ${item.requiredSkills} | Projects: ${item.requiredProjects}
                        </div>
                        ${!item.eligible ? `<div class="mb-3">${reasonsHtml}</div>` : `<div class="text-success small mb-3"><i class="bi bi-check-circle-fill me-1"></i>You meet all base criteria.</div>`}
                    </div>
                    <div>
                        <button onclick="analyzeSkillGap(${item.companyId})" class="btn btn-outline-primary btn-sm w-100 mt-2">
                            Analyze Skill Gap &amp; Prep
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function analyzeSkillGap(companyId) {
    const modalEl = new bootstrap.Modal(document.getElementById('gapModal'));
    const body = document.getElementById('gapModalBody');
    body.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary" role="status"></div></div>';
    modalEl.show();

    try {
        const response = await authenticatedFetch(`/api/student/gap/${companyId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        const missing = Array.from(data.missingSkills);
        const recommendationsHtml = data.recommendations.map(r => `<li class="mb-2">${r}</li>`).join('');

        body.innerHTML = `
            <div class="mb-3">
                <h5 class="text-primary font-weight-bold">${data.companyName} Skills Gap Analysis</h5>
                <hr>
            </div>
            <div class="row mb-3">
                <div class="col-6">
                    <strong>Your Skills:</strong>
                    <div class="mt-2 text-success small">${Array.from(data.studentSkills).join(', ') || 'No skills added yet'}</div>
                </div>
                <div class="col-6">
                    <strong>Required Skills:</strong>
                    <div class="mt-2 text-primary small">${Array.from(data.companySkills).join(', ')}</div>
                </div>
            </div>
            <div class="alert ${missing.length > 0 ? 'alert-warning' : 'alert-success'} d-flex align-items-center">
                <i class="bi ${missing.length > 0 ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2 fs-5"></i>
                <div>
                    ${missing.length > 0 
                        ? `You are missing <strong>${missing.length}</strong> required skill(s): <span class="text-danger font-weight-bold">${missing.join(', ')}</span>`
                        : `Congratulations! You have <strong>0</strong> skill gaps for this company.`}
                </div>
            </div>
            <div>
                <strong>Roadmap Recommendations:</strong>
                <ul class="mt-2 small ps-3">
                    ${recommendationsHtml}
                </ul>
            </div>
        `;

    } catch (err) {
        body.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function loadInterviewQuestions(category = 'All', search = '') {
    const listContainer = document.getElementById('questionsList');
    listContainer.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        let url = '/api/student/questions';
        const params = [];
        if (category && category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (params.length > 0) url += '?' + params.join('&');

        const response = await authenticatedFetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        listContainer.innerHTML = '';
        if (data.length === 0) {
            listContainer.innerHTML = '<div class="text-center text-muted p-5">No questions found matching criteria.</div>';
            return;
        }

        data.forEach((q, idx) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item glass-card mb-3';
            
            const diffClass = q.difficulty === 'Easy' ? 'bg-success' : q.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger';

            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="heading${idx}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
                        <div class="w-100 d-flex justify-content-between align-items-center pe-3">
                            <span class="text-primary font-weight-bold">${q.question}</span>
                            <div>
                                <span class="badge bg-secondary me-2">${q.category}</span>
                                <span class="badge ${diffClass}">${q.difficulty}</span>
                            </div>
                        </div>
                    </button>
                </h2>
                <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#questionsList">
                    <div class="accordion-body">
                        <strong class="text-primary d-block mb-3">Choose the correct option:</strong>
                        
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="optionsQ${idx}" id="optA_${idx}" value="A">
                            <label class="form-check-label text-secondary" for="optA_${idx}">
                                <strong>A.</strong> ${q.optionA}
                            </label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="optionsQ${idx}" id="optB_${idx}" value="B">
                            <label class="form-check-label text-secondary" for="optB_${idx}">
                                <strong>B.</strong> ${q.optionB}
                            </label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="optionsQ${idx}" id="optC_${idx}" value="C">
                            <label class="form-check-label text-secondary" for="optC_${idx}">
                                <strong>C.</strong> ${q.optionC}
                            </label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="optionsQ${idx}" id="optD_${idx}" value="D">
                            <label class="form-check-label text-secondary" for="optD_${idx}">
                                <strong>D.</strong> ${q.optionD}
                            </label>
                        </div>

                        <button id="saveAnsBtn_${idx}" onclick="checkMcqAnswer(${idx}, '${q.correctOption}', '${q.explanation.replace(/'/g, "\\'").replace(/\n/g, "<br>")}')" class="btn btn-primary btn-sm mt-2 px-3"><i class="bi bi-save me-1"></i>Save</button>

                        <div id="mcqResult_${idx}" class="mt-3 d-none"></div>

                        ${q.companyName && q.companyName !== 'General' ? `<div class="mt-3"><span class="badge bg-light text-dark border"><i class="bi bi-tag-fill me-1 text-primary"></i>Asked at: ${q.companyName}</span></div>` : ''}
                    </div>
                </div>
            `;
            listContainer.appendChild(accordionItem);
        });

    } catch (err) {
        listContainer.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

function filterQuestions(category) {
    // Highlight active pill
    document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('btn-primary', 'text-white'));
    document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.add('btn-outline-primary'));
    
    const activeBtn = Array.from(document.querySelectorAll('.filter-pill')).find(btn => btn.textContent.includes(category));
    if (activeBtn) {
        activeBtn.classList.remove('btn-outline-primary');
        activeBtn.classList.add('btn-primary', 'text-white');
    }

    const search = document.getElementById('searchQuestionInput').value;
    loadInterviewQuestions(category, search);
}

function handleQuestionSearch() {
    const search = document.getElementById('searchQuestionInput').value;
    // Find active category
    const activePill = document.querySelector('.filter-pill.btn-primary');
    const category = activePill ? activePill.textContent.trim().split(' ')[0] : 'All';
    loadInterviewQuestions(category, search);
}

async function loadCodingChallenges() {
    const container = document.getElementById('challengesContainer');
    container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        const response = await authenticatedFetch('/api/student/challenges');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        container.innerHTML = '';
        data.forEach(challenge => {
            const card = document.createElement('div');
            card.className = 'col-md-6 mb-4';

            const diffClass = challenge.difficulty === 'Easy' ? 'text-success' : challenge.difficulty === 'Medium' ? 'text-warning' : 'text-danger';

            card.innerHTML = `
                <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="m-0 font-weight-bold text-primary">${challenge.title}</h5>
                            <span class="small font-weight-bold ${diffClass}">${challenge.difficulty}</span>
                        </div>
                        <span class="badge bg-light text-dark border mb-3">${challenge.topic}</span>
                        <p class="text-secondary small text-truncate-3">${challenge.description}</p>
                    </div>
                    <div class="mt-3 d-flex justify-content-between align-items-center">
                        <span class="text-muted small">Points: <strong>${challenge.points}</strong></span>
                        <button onclick="openCodingWorkspace(${challenge.id}, '${challenge.title.replace(/'/g, "\\'")}', '${challenge.description.replace(/'/g, "\\'").replace(/\n/g, "<br>")}')" class="btn btn-primary btn-sm">Solve Challenge</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function openCodingWorkspace(id, title, description) {
    currentChallengeId = id;
    document.getElementById('challengeSelector').classList.add('d-none');
    document.getElementById('codingWorkspace').classList.remove('d-none');

    document.getElementById('workspaceTitle').textContent = title;
    document.getElementById('workspaceDesc').innerHTML = description;
    
    // Hide previous submission outcome panel
    document.getElementById('submissionResultPanel').classList.add('d-none');

    // Bind submission trigger
    const submitBtn = document.getElementById('submitCodeBtn');
    submitBtn.onclick = () => submitCode(id);

    const editorEl = document.getElementById('codeEditor');
    const langSelectEl = document.getElementById('editorLanguage');

    // Set up draft autosave on input
    editorEl.oninput = () => {
        localStorage.setItem(`challenge_draft_${id}`, editorEl.value);
        localStorage.setItem(`challenge_draft_lang_${id}`, langSelectEl.value);
    };

    // First check local storage draft
    const localDraft = localStorage.getItem(`challenge_draft_${id}`);
    const localLang = localStorage.getItem(`challenge_draft_lang_${id}`);
    if (localDraft !== null) {
        editorEl.value = localDraft;
        if (localLang) {
            langSelectEl.value = localLang;
        }
        return;
    }

    // Fetch and load previous submission code if exists
    try {
        const response = await authenticatedFetch(`/api/student/challenges/${id}/latest`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.code) {
                editorEl.value = data.code;
                if (data.language) {
                    langSelectEl.value = data.language;
                }
                localStorage.setItem(`challenge_draft_${id}`, data.code);
                localStorage.setItem(`challenge_draft_lang_${id}`, data.language || 'Java');
                return;
            }
        }
    } catch (err) {
        console.error('Failed to load latest submission:', err);
    }

    // Fallback: Initial placeholder code
    const lang = langSelectEl.value;
    updateCodeTemplate(lang);
}

function updateCodeTemplate(lang) {
    const editor = document.getElementById('codeEditor');
    if (lang === 'Java') {
        editor.value = `public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello World");\n    }\n}`;
    } else if (lang === 'JavaScript') {
        editor.value = `function solve() {\n    // Write your solution here\n    console.log("Hello World");\n}`;
    }
    if (currentChallengeId) {
        localStorage.setItem(`challenge_draft_${currentChallengeId}`, editor.value);
        localStorage.setItem(`challenge_draft_lang_${currentChallengeId}`, lang);
    }
}

function closeCodingWorkspace() {
    currentChallengeId = null;
    document.getElementById('challengeSelector').classList.remove('d-none');
    document.getElementById('codingWorkspace').classList.add('d-none');
    document.getElementById('submissionResultPanel').classList.add('d-none');
    loadProfileAndStats(); // Reload profile updates
}

async function submitCode(challengeId) {
    const submitBtn = document.getElementById('submitCodeBtn');
    const resultPanel = document.getElementById('submissionResultPanel');
    const code = document.getElementById('codeEditor').value;
    const language = document.getElementById('editorLanguage').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Running tests...';
    resultPanel.classList.add('d-none');

    try {
        const response = await authenticatedFetch(`/api/student/challenges/${challengeId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ code, language })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to submit code.');

        resultPanel.classList.remove('d-none');
        const alertBox = document.getElementById('resultAlert');
        const details = document.getElementById('resultDetails');

        if (data.submission.status === 'SOLVED') {
            alertBox.className = 'alert alert-success';
            alertBox.innerHTML = `<strong><i class="bi bi-check-circle-fill me-2"></i>ALL TESTS PASSED!</strong> Accuracy: ${data.submission.accuracy}%`;
            details.innerHTML = `Congratulations! You earned points. Check the leaderboard.`;
        } else {
            alertBox.className = 'alert alert-danger';
            alertBox.innerHTML = `<strong><i class="bi bi-x-circle-fill me-2"></i>TEST CASE FAILURE</strong>`;
            details.innerHTML = `Code is too short or key DSA logic did not match assertions. Check your code syntax and try again.`;
        }

        // Render test cases container
        const tcContainer = document.getElementById('testCasesContainer');
        if (tcContainer) {
            tcContainer.innerHTML = '';
            data.testCases.forEach(tc => {
                const card = document.createElement('div');
                card.className = `p-3 rounded border small d-flex justify-content-between align-items-center mb-2`;
                if (tc.passed) {
                    card.style.borderColor = 'var(--success-color)';
                    card.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                } else {
                    card.style.borderColor = 'var(--danger-color)';
                    card.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                }
                
                const icon = tc.passed ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger';
                card.innerHTML = `
                    <div>
                        <div class="font-weight-bold"><i class="bi ${icon} me-2"></i>${tc.name}</div>
                        <div class="text-secondary mt-1">Input: <code>${tc.input}</code> | Expected: <code>${tc.expected}</code> | Actual: <code>${tc.actual}</code></div>
                    </div>
                    <span class="badge bg-secondary">${tc.passed ? 'Passed' : 'Failed'}</span>
                `;
                tcContainer.appendChild(card);
            });
        }

        loadLeaderboard(); // Update leaderboard

    } catch (err) {
        alert(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Solution';
    }
}

async function loadLeaderboard() {
    const tbody = document.querySelector('#leaderboardTable tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center p-3">Loading leaderboard...</td></tr>';

    try {
        const response = await authenticatedFetch('/api/student/leaderboard');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-3">No students ranked yet.</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            if (item.username === username) {
                row.className = 'table-primary font-weight-bold';
            }
            row.innerHTML = `
                <td><strong>${item.rank}</strong></td>
                <td>${item.username}</td>
                <td><span class="badge bg-primary px-3">${item.codingScore}</span></td>
                <td>${item.readinessScore}%</td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger p-3">${err.message}</td></tr>`;
    }
}

async function loadRoadmapForm() {
    const select = document.getElementById('roadmapCompanySelect');
    select.innerHTML = '<option value="">Loading Companies...</option>';

    try {
        // Fetch companies
        const response = await authenticatedFetch('/api/student/eligibility');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        select.innerHTML = '<option value="">Select target company...</option>';
        data.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.companyId;
            opt.textContent = c.companyName;
            select.appendChild(opt);
        });

    } catch (err) {
        select.innerHTML = '<option value="">Failed to load companies</option>';
    }
}

async function handleRoadmapGeneration(e) {
    e.preventDefault();
    const companyId = document.getElementById('roadmapCompanySelect').value;
    const months = parseInt(document.getElementById('roadmapMonthsInput').value) || 0;
    const days = parseInt(document.getElementById('roadmapDaysInput').value) || 0;
    const totalDays = (months * 30) + days;
    const generateBtn = document.getElementById('generateRoadmapBtn');
    const container = document.getElementById('roadmapResultTimeline');

    if (!companyId) {
        alert('Please select a company.');
        return;
    }
    
    if (totalDays < 5) {
        alert('Please select a preparation duration of at least 5 days.');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = 'Optimizing...';
    container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        const response = await authenticatedFetch('/api/student/roadmap', {
            method: 'POST',
            body: JSON.stringify({ companyId, availableDays: totalDays })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to generate roadmap.');

        renderRoadmapData(data);
        loadProfileAndStats();

    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Personalized Roadmap';
    }
}

async function fetchActiveRoadmap() {
    try {
        const response = await authenticatedFetch('/api/student/roadmap');
        if (!response.ok) return;
        const data = await response.json();
        if (data) {
            renderRoadmapData(data);
        }
    } catch (err) {
        console.error("Failed to load active roadmap:", err);
    }
}

function renderRoadmapData(roadmap) {
    const container = document.getElementById('roadmapResultTimeline');
    container.innerHTML = '';
    const weeks = JSON.parse(roadmap.roadmapJson);
    const completedSet = new Set(roadmap.completedTopics ? roadmap.completedTopics.split(',') : []);
    
    if (weeks.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No roadmap generated. You may need to allocate more available days to study the topics.</div>';
        return;
    }
    
    weeks.forEach(week => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'roadmap-week fade-in-el';
        
        const badges = week.topics.map(t => {
            const isCompleted = completedSet.has(t);
            const badgeClass = isCompleted ? 'btn-success text-white' : 'btn-outline-primary';
            const icon = isCompleted ? 'bi-check-circle-fill' : 'bi-circle';
            return `
                <button onclick="toggleRoadmapTopic('${t.replace(/'/g, "\\'")}')" class="btn btn-sm d-inline-flex align-items-center border rounded me-2 mb-2 p-2 px-3 ${badgeClass}">
                    <i class="bi ${icon} me-2"></i>${t}
                </button>
            `;
        }).join('');

        weekDiv.innerHTML = `
            <div class="glass-card p-4">
                <h5 class="font-weight-bold text-primary">${week.week}</h5>
                <p class="text-secondary small">Study &amp; master these topics (click to toggle completion):</p>
                <div class="mt-3 d-flex flex-wrap">
                    ${badges}
                </div>
            </div>
        `;
        container.appendChild(weekDiv);
    });
}

async function toggleRoadmapTopic(topic) {
    try {
        const response = await authenticatedFetch('/api/student/roadmap/toggle', {
            method: 'PUT',
            body: JSON.stringify({ topic })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to toggle topic.');
        renderRoadmapData(data);
    } catch (err) {
        alert(err.message);
    }
}

async function handleResumeFileUpload() {
    const fileInput = document.getElementById('resumeFileInput');
    const loading = document.getElementById('resumeLoading');
    const results = document.getElementById('resumeResults');
    const uploadBtn = document.getElementById('uploadResumeBtn');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a PDF or Text file first.');
        return;
    }
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    uploadBtn.disabled = true;
    loading.classList.remove('d-none');
    results.classList.add('d-none');
    
    try {
        const response = await fetch('/api/student/resume/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.status === 403 || response.status === 401) {
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to parse resume file.');
        
        // Fill in results
        document.getElementById('resScoreBadge').textContent = data.score + '/100';
        document.getElementById('resSkillsBadge').textContent = data.extractedSkills || 'None detected';
        document.getElementById('resProjects').textContent = data.extractedProjects || 'None';
        document.getElementById('resCerts').textContent = data.extractedCerts || 'None';
        document.getElementById('resMissing').textContent = data.missingSkills || 'No core skills missing';
        
        // Bullet point recommendations
        document.getElementById('resRecs').innerHTML = data.recommendations.split('\n').map(r => `<li>${r}</li>`).join('');

        results.classList.remove('d-none');
        loadProfileAndStats(); // Update dashboard components
        
        alert('Resume file uploaded and analyzed successfully!');
        
    } catch (err) {
        alert(err.message);
    } finally {
        uploadBtn.disabled = false;
        loading.classList.add('d-none');
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function checkMcqAnswer(idx, correctOption, explanation) {
    const selectedRadio = document.querySelector(`input[name="optionsQ${idx}"]:checked`);
    if (!selectedRadio) {
        alert("Please choose an option first!");
        return;
    }

    const selectedVal = selectedRadio.value;
    const resultDiv = document.getElementById(`mcqResult_${idx}`);

    resultDiv.classList.remove('d-none');

    if (selectedVal === correctOption) {
        resultDiv.className = "alert alert-success mt-3 fade-in-el";
        resultDiv.innerHTML = `<strong><i class="bi bi-check-circle-fill me-2"></i>Correct!</strong><br><span class="small mt-1 d-block">${explanation}</span>`;
    } else {
        resultDiv.className = "alert alert-danger mt-3 fade-in-el";
        resultDiv.innerHTML = `<strong><i class="bi bi-x-circle-fill me-2"></i>Incorrect!</strong> The correct option is <strong>${correctOption}</strong>.<br><span class="small mt-1 d-block">${explanation}</span>`;
    }
}
