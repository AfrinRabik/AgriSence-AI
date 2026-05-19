// ===========================
// Authentication Functions
// ===========================

// OTP Timer variables
let otpTimer = null;
let otpTimeLeft = 0;

// ===========================
// Registration Handler
// ===========================

/**
 * Handle user registration
 */
async function handleRegister() {
    const form = document.querySelector('.auth-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = getFormData(form);
        const { farmerName, age, email, password, confirmPassword } = formData;

        // Validation
        if (!farmerName || !age || !email || !password || !confirmPassword) {
            showMessage('All fields are required', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email', 'error');
            return;
        }

        if (!isValidAge(age)) {
            showMessage('You must be at least 18 years old', 'error');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            showMessage(passwordValidation.message, 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        // Disable submit button
        disableButton(submitBtn);

        try {
            const response = await fetchAPI('/auth/register', 'POST', {
                farmerName,
                age: parseInt(age),
                email,
                password
            });

            showMessage('Registration successful! Redirecting to login...', 'success', 2000);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            showMessage(error.message || 'Registration failed', 'error');
            enableButton(submitBtn);
        }
    });
}

// ===========================
// Login Handler
// ===========================

/**
 * Handle user login
 */
async function handleLogin() {
    const form = document.querySelector('.auth-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = getFormData(form);
        const { email, password } = formData;

        // Validation
        if (!email || !password) {
            showMessage('Email and password are required', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email', 'error');
            return;
        }

        // Disable submit button
        disableButton(submitBtn);

        try {
            const response = await fetchAPI('/auth/login', 'POST', {
                email,
                password
            });

            if (response.token) {
                setToken(response.token);
                showMessage('Login successful! Redirecting...', 'success', 1500);
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                throw new Error('No token received from server');
            }
        } catch (error) {
            showMessage(error.message || 'Login failed', 'error');
            enableButton(submitBtn);
        }
    });
}

// ===========================
// Forgot Password - Step 1
// ===========================

/**
 * Handle forgot password email submission
 */
async function handleForgotPasswordStep1() {
    const step1Form = document.getElementById('forgotPasswordForm');
    if (!step1Form) return;

    const submitBtn = step1Form.querySelector('button[type="submit"]');

    step1Form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgotEmail')?.value;

        if (!email) {
            showMessage('Please enter your email', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email', 'error');
            return;
        }

        disableButton(submitBtn);

        try {
            const response = await fetchAPI('/auth/forgot-password', 'POST', { email });

            // Store email for next step
            sessionStorage.setItem('resetEmail', email);

            showMessage('OTP sent to your email! Check your inbox.', 'success', 2000);
            
            // Move to step 2
            document.getElementById('stepOne').style.display = 'none';
            document.getElementById('stepTwo').style.display = 'block';
            
            // Start OTP timer
            startOTPTimer();
        } catch (error) {
            showMessage(error.message || 'Failed to send OTP', 'error');
            enableButton(submitBtn);
        }
    });
}

// ===========================
// Forgot Password - Step 2: OTP Verification
// ===========================

/**
 * Start OTP timer (60 seconds)
 */
function startOTPTimer() {
    otpTimeLeft = 60;
    const resendBtn = document.getElementById('resendBtn');
    const timerDisplay = document.getElementById('timer');

    if (resendBtn) {
        resendBtn.style.pointerEvents = 'none';
        resendBtn.style.opacity = '0.6';
    }

    otpTimer = setInterval(() => {
        otpTimeLeft--;
        if (timerDisplay) {
            timerDisplay.textContent = otpTimeLeft;
        }

        if (otpTimeLeft <= 0) {
            clearInterval(otpTimer);
            if (resendBtn) {
                resendBtn.style.pointerEvents = 'auto';
                resendBtn.style.opacity = '1';
            }
        }
    }, 1000);
}

/**
 * Handle OTP verification
 */
async function handleOTPVerification() {
    const step2Form = document.getElementById('otpVerificationForm');
    if (!step2Form) return;

    const submitBtn = step2Form.querySelector('button[type="submit"]');

    step2Form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const otp = document.getElementById('otp')?.value;
        const email = sessionStorage.getItem('resetEmail');

        if (!otp) {
            showMessage('Please enter the OTP', 'error');
            return;
        }

        disableButton(submitBtn);

        try {
            const response = await fetchAPI('/auth/verify-otp', 'POST', {
                email,
                otp
            });

            // Store verification token
            sessionStorage.setItem('resetToken', response.resetToken || email);

            showMessage('OTP verified successfully!', 'success', 1500);
            
            // Move to step 3
            document.getElementById('stepTwo').style.display = 'none';
            document.getElementById('stepThree').style.display = 'block';
            
            // Clear OTP timer
            if (otpTimer) clearInterval(otpTimer);
        } catch (error) {
            showMessage(error.message || 'Invalid OTP', 'error');
            enableButton(submitBtn);
        }
    });
}

/**
 * Handle resend OTP
 */
async function handleResendOTP() {
    const email = sessionStorage.getItem('resetEmail');
    if (!email) {
        showMessage('Email not found. Please start over.', 'error');
        return;
    }

    const resendBtn = document.getElementById('resendOtpBtn');
    disableButton(resendBtn);

    try {
        await fetchAPI('/auth/forgot-password', 'POST', { email });
        showMessage('New OTP sent to your email!', 'success', 2000);
        
        // Restart timer
        if (otpTimer) clearInterval(otpTimer);
        startOTPTimer();
    } catch (error) {
        showMessage(error.message || 'Failed to resend OTP', 'error');
        enableButton(resendBtn);
    }
}

// ===========================
// Forgot Password - Step 3: Reset Password
// ===========================

/**
 * Handle password reset
 */
async function handlePasswordReset() {
    const step3Form = document.getElementById('resetPasswordForm');
    if (!step3Form) return;

    const submitBtn = step3Form.querySelector('button[type="submit"]');

    step3Form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmNewPassword')?.value;
        const email = sessionStorage.getItem('resetEmail');

        // Validation
        if (!newPassword || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            showMessage(passwordValidation.message, 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        disableButton(submitBtn);

        try {
            await fetchAPI('/auth/reset-password', 'POST', {
                email,
                newPassword
            });

            showMessage('Password reset successful! Redirecting to login...', 'success', 2000);
            
            // Clear session storage
            sessionStorage.removeItem('resetEmail');
            sessionStorage.removeItem('resetToken');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            showMessage(error.message || 'Password reset failed', 'error');
            enableButton(submitBtn);
        }
    });
}

// ===========================
// Go back button handlers
// ===========================

/**
 * Go back from OTP step to email step
 */
function goBackFromOTP() {
    if (otpTimer) clearInterval(otpTimer);
    document.getElementById('stepTwo').style.display = 'none';
    document.getElementById('stepOne').style.display = 'block';
}

/**
 * Go back from password reset to OTP step
 */
function goBackFromReset() {
    document.getElementById('stepThree').style.display = 'none';
    document.getElementById('stepTwo').style.display = 'block';
    startOTPTimer();
}

// ===========================
// Logout Function
// ===========================

/**
 * Logout user
 */
function logout() {
    clearToken();
    showMessage('Logged out successfully', 'success', 1500);
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ===========================
// Initialize on page load
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Check current page and initialize appropriate handlers
    const currentPage = window.location.pathname.split('/').pop() || '';

    if (currentPage.includes('index.html') || currentPage === '') {
        // Login page
        handleLogin();
    } else if (currentPage.includes('register.html')) {
        // Registration page
        handleRegister();
    } else if (currentPage.includes('forgot-password.html')) {
        // Forgot password page
        handleForgotPasswordStep1();
        handleOTPVerification();
        handlePasswordReset();
    }
});
