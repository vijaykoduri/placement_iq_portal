let dashboardChartInstance = null;
let skillChartInstance = null;

function renderReadinessChart(canvasId, readinessScore, resumeScore, codingScore) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (dashboardChartInstance) {
        dashboardChartInstance.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#1f2937';
    const gridColor = isDark ? '#334155' : '#e5e7eb';

    dashboardChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Placement Readiness', 'Resume Strength', 'Coding Challenge Performance'],
            datasets: [{
                label: 'Score Profile (0-100)',
                data: [readinessScore, resumeScore, (codingScore / 500) * 100], // Normalize coding score (assume max 500)
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1',
                borderWidth: 2,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6366f1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: {
                        color: textColor,
                        font: { size: 12, family: 'Outfit' }
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        color: textColor,
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        }
    });
}

function renderSkillsChart(canvasId, skillsList) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (skillChartInstance) {
        skillChartInstance.destroy();
    }

    if (!skillsList || skillsList.trim() === '') {
        // Fallback placeholder data
        skillsList = "Java,SQL,Git";
    }

    const skills = skillsList.split(',').map(s => s.trim());
    const counts = skills.map(() => 1); // Simple frequency check or occurrence

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#1f2937';

    skillChartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: skills,
            datasets: [{
                label: 'Skills Stack',
                data: counts,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.6)',
                    'rgba(168, 85, 247, 0.6)',
                    'rgba(6, 182, 212, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(239, 68, 68, 0.6)'
                ],
                borderWidth: 1,
                borderColor: isDark ? '#1e293b' : '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor }
                }
            },
            scales: {
                r: {
                    grid: { color: isDark ? '#334155' : '#e5e7eb' },
                    ticks: { display: false }
                }
            }
        }
    });
}
