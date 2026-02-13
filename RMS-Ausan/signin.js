function showForm(formType) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.form-content').forEach(content => content.classList.remove('active'));

    if (formType === 'login') {
        document.querySelector('.tab:nth-child(1)').classList.add('active');
        document.getElementById('login').classList.add('active');
    } else {
        document.querySelector('.tab:nth-child(2)').classList.add('active');
        document.getElementById('signup').classList.add('active');
    }
    clearErrors(); // Clear errors when switching tabs
}

// Clear all error messages
function clearErrors() {
    document.querySelectorAll('.error').forEach(err => err.textContent = '');
}

// Login form validation
document.getElementById('login').querySelector('form').addEventListener('submit', function (e) {
    clearErrors();
    let valid = true;

    const email = this.querySelector('input[type="email"]');
    const password = this.querySelector('input[type="password"]');

    // Email validation
    if (!email.value.trim()) {
        showError(email, 'Email is required');
        valid = false;
    } else if (!isValidEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        valid = false;
    }

    // Password validation
    if (!password.value) {
        showError(password, 'Password is required');
        valid = false;
    }

    if (!valid) {
        // In your login success handler (inside the login form submit)
        localStorage.setItem('currentUser', JSON.stringify({ name: nameValue, email: emailValue }));
        window.location.href = 'index.html';
        // For demo we just store the email/name
        localStorage.setItem('currentUser', JSON.stringify({
            name: email.value.split('@')[0],   // or use a name field if you have one
            email: email.value
        }));

        alert('Login successful! Redirecting to dashboard...');
        window.location.href = 'index.html';
    } else {
        // In your login success handler (inside the login form submit)
        localStorage.setItem('currentUser', JSON.stringify({ name: nameValue, email: emailValue }));
        window.location.href = 'index.html';
    }
});

// Helper: validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Helper: show error message under field
function showError(input, message) {
    const errorSpan = input.parentElement.querySelector('.error') ||
        document.createElement('div');
    errorSpan.className = 'error';
    errorSpan.style.color = '#e74c3c';
    errorSpan.style.fontSize = '13px';
    errorSpan.style.marginTop = '6px';
    errorSpan.textContent = message;
    if (!input.parentElement.querySelector('.error')) {
        input.parentElement.appendChild(errorSpan);
    }
}

// Helper: clear all errors
function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.remove());
}

// ────────────────────────────────────────────────
//           LOGIN FORM HANDLING
// ────────────────────────────────────────────────
const loginForm = document.querySelector('#login form');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();

        const emailInput = this.querySelector('input[type="email"]');
        const passwordInput = this.querySelector('input[type="password"]');

        let valid = true;

        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            valid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email');
            valid = false;
        }

        if (!passwordInput.value.trim()) {
            showError(passwordInput, 'Password is required');
            valid = false;
        }

        if (valid) {
            // ────────────────────────────────────────────────
            //   Successful login → save user & redirect
            // ────────────────────────────────────────────────
            const user = {
                email: emailInput.value.trim(),
                name: emailInput.value.split('@')[0] || 'User',  // fallback name
                loggedInAt: new Date().toISOString()
                // You can add more fields later: role, fullName, etc.
            };

            localStorage.setItem('currentUser', JSON.stringify(user));

            // Optional: success feedback
            alert('Login successful! Redirecting to dashboard...');

            // Redirect to your dashboard
            window.location.href = 'index.html';
        }
    });
}

// ────────────────────────────────────────────────
//           SIGNUP FORM HANDLING (optional)
// ────────────────────────────────────────────────
const signupForm = document.querySelector('#signup form') ||
    document.querySelector('#signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();

        const nameInput = this.querySelector('input[type="text"]');
        const emailInput = this.querySelector('input[type="email"]');
        const passwordInput = this.querySelector('input[type="password"]');
        // If you have confirm password field:
        const confirmInput = this.querySelectorAll('input[type="password"]')[1];

        let valid = true;

        if (nameInput && !nameInput.value.trim()) {
            showError(nameInput, 'Full name is required');
            valid = false;
        }

        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            valid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email');
            valid = false;
        }

        if (!passwordInput.value) {
            showError(passwordInput, 'Password is required');
            valid = false;
        } else if (passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters');
            valid = false;
        }

        if (confirmInput && passwordInput.value !== confirmInput.value) {
            showError(confirmInput, 'Passwords do not match');
            valid = false;
        }

        if (valid) {
            // ────────────────────────────────────────────────
            //   Successful signup → auto-login & redirect
            // ────────────────────────────────────────────────
            const user = {
                name: nameInput ? nameInput.value.trim() : emailInput.value.split('@')[0],
                email: emailInput.value.trim(),
                loggedInAt: new Date().toISOString()
            };

            localStorage.setItem('currentUser', JSON.stringify(user));

            alert('Account created! You are now logged in.');
            window.location.href = 'index.html';
        }
    });
}

// Optional: If user is already logged in → go straight to dashboard
window.addEventListener('load', () => {
    if (localStorage.getItem('currentUser')) {
        // You can choose to auto-redirect or show a message
        // window.location.href = 'index.html';
        console.log('User already logged in → ready to go to dashboard');
    }
});