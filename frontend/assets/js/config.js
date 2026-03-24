// ===========================
// API Configuration & Helpers
// ===========================

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// ===========================
// Token Management
// ===========================

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token or null
 */
function getToken() {
    return localStorage.getItem('farmerToken');
}

/**
 * Set JWT token in localStorage
 * @param {string} token - JWT token
 */
function setToken(token) {
    localStorage.setItem('farmerToken', token);
}

/**
 * Clear JWT token from localStorage
 */
function clearToken() {
    localStorage.removeItem('farmerToken');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
function isAuthenticated() {
    return !!getToken();
}

// ===========================
// Fetch Wrapper
// ===========================

/**
 * Wrapper for fetch API with JWT authentication
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} body - Request body (optional)
 * @returns {Promise} Response JSON
 */
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    // Add JWT token to Authorization header if available
    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body for POST, PUT, DELETE requests
    if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        // Handle authentication errors
        if (response.status === 401) {
            clearToken();
            showMessage('Session expired. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            throw new Error('Unauthorized');
        }

        // Handle other errors
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===========================
// Message & Alert System
// ===========================

/**
 * Display message/alert to user
 * @param {string} text - Message text
 * @param {string} type - Message type (success, error, info, warning)
 * @param {number} duration - Duration to show (ms), 0 = persistent
 */
function showMessage(text, type = 'info', duration = 3000) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message-alert');
    existingMessages.forEach(msg => msg.remove());

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-alert message-${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <span>${text}</span>
            <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add to page
    document.body.insertBefore(messageDiv, document.body.firstChild);

    // Auto-remove after duration (if duration > 0)
    if (duration > 0) {
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, duration);
    }
}

// ===========================
// Form Validation
// ===========================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
function validatePassword(password) {
    if (password.length < 6) {
        return {
            isValid: false,
            message: 'Password must be at least 6 characters'
        };
    }
    return {
        isValid: true,
        message: 'Password is valid'
    };
}

/**
 * Validate age
 * @param {number} age - Age to validate
 * @returns {boolean} True if age >= 18
 */
function isValidAge(age) {
    return parseInt(age) >= 18;
}

// ===========================
// Form Helpers
// ===========================

/**
 * Get all form input values
 * @param {HTMLFormElement} form - Form element
 * @returns {object} Key-value pairs of form inputs
 */
function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

/**
 * Clear form inputs
 * @param {HTMLFormElement} form - Form element
 */
function clearForm(form) {
    form.reset();
}

/**
 * Disable form submission (prevent double submission)
 * @param {HTMLButtonElement} button - Submit button
 */
function disableButton(button) {
    button.disabled = true;
    button.style.opacity = '0.6';
}

/**
 * Enable form submission
 * @param {HTMLButtonElement} button - Submit button
 */
function enableButton(button) {
    button.disabled = false;
    button.style.opacity = '1';
}

// ===========================
// Navigation Helpers
// ===========================

/**
 * Navigate to a page
 * @param {string} page - Page filename (e.g., 'dashboard.html')
 */
function navigateTo(page) {
    window.location.href = page;
}

/**
 * Go back to previous page
 */
function goBack() {
    window.history.back();
}

// ===========================
// Data Formatting
// ===========================

/**
 * Format currency value
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(value);
}

/**
 * Format date to readable format
 * @param {string} dateString - Date string from API
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

/**
 * Format number with thousand separators
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ===========================
// Check Authentication on Load
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in on protected pages
    const publicPages = ['index.html', 'register.html', 'forgot-password.html', ''];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (!publicPages.includes(currentPage) && !isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
    }
});
