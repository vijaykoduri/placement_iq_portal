const API_BASE = '/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    // Check if token exists and redirect to respective panels if already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    const currentPath = window.location.pathname;
    if (token && role) {
        if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '') {
            redirectBasedOnRole(role);
        }
    }

    // Set up form submission listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
});

function redirectBasedOnRole(role) {
    if (role === 'ADMIN') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorAlert = document.getElementById('errorAlert');

    if (errorAlert) errorAlert.classList.add('d-none');

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed. Please check credentials.');
        }

        // Store Session variables
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        localStorage.setItem('email', data.email);

        redirectBasedOnRole(data.role);

    } catch (err) {
        if (errorAlert) {
            errorAlert.textContent = err.message;
            errorAlert.classList.remove('d-none');
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('regUsername');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const roleInput = document.getElementById('regRole');
    const errorAlert = document.getElementById('regErrorAlert');
    const successAlert = document.getElementById('regSuccessAlert');

    if (errorAlert) errorAlert.classList.add('d-none');
    if (successAlert) successAlert.classList.add('d-none');

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value,
                role: roleInput ? roleInput.value : 'STUDENT'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed.');
        }

        if (successAlert) {
            successAlert.textContent = 'Account created successfully! Please login.';
            successAlert.classList.remove('d-none');
            // Clear inputs
            usernameInput.value = '';
            emailInput.value = '';
            passwordInput.value = '';
            // Switch tabs after short delay
            setTimeout(() => {
                const loginTab = document.getElementById('login-tab');
                if (loginTab) loginTab.click();
            }, 1500);
        }

    } catch (err) {
        if (errorAlert) {
            errorAlert.textContent = err.message;
            errorAlert.classList.remove('d-none');
        }
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function showForgotPasswordPanel() {
    document.getElementById('loginForm').classList.add('d-none');
    document.getElementById('forgotPasswordForm').classList.remove('d-none');
    const err = document.getElementById('forgotErrorAlert');
    const succ = document.getElementById('forgotSuccessAlert');
    if (err) err.classList.add('d-none');
    if (succ) succ.classList.add('d-none');
}

function hideForgotPasswordPanel() {
    document.getElementById('forgotPasswordForm').classList.add('d-none');
    document.getElementById('loginForm').classList.remove('d-none');
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const username = document.getElementById('forgotUsername').value;
    const email = document.getElementById('forgotEmail').value;
    const newPassword = document.getElementById('forgotNewPassword').value;
    
    const errAlert = document.getElementById('forgotErrorAlert');
    const succAlert = document.getElementById('forgotSuccessAlert');
    
    if (errAlert) errAlert.classList.add('d-none');
    if (succAlert) succAlert.classList.add('d-none');
    
    try {
        const response = await fetch(`${API_BASE}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, newPassword })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Password reset failed.');
        }
        
        if (succAlert) {
            succAlert.textContent = 'Password reset successfully! Please login with your new password.';
            succAlert.classList.remove('d-none');
            // Clear inputs
            document.getElementById('forgotUsername').value = '';
            document.getElementById('forgotEmail').value = '';
            document.getElementById('forgotNewPassword').value = '';
            
            setTimeout(() => {
                hideForgotPasswordPanel();
            }, 2000);
        }
    } catch (err) {
        if (errAlert) {
            errAlert.textContent = err.message;
            errAlert.classList.remove('d-none');
        }
    }
}
