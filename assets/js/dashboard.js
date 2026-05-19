// ===========================
// Dashboard Functions
// ===========================

let currentFarmerId = null;
let farmsList = [];
let recommendationsList = [];

// ===========================
// Page Section Management
// ===========================

/**
 * Show specific section and hide others
 * @param {string} sectionId - ID of section to show
 */
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    // Update navbar active state
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.nav-menu a[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Initialize navigation event listeners
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Load farmer profile on initial load
    loadFarmerProfile();
}

// ===========================
// Farmer Profile Management
// ===========================

/**
 * Load and display farmer profile
 */
async function loadFarmerProfile() {
    try {
        const response = await fetchAPI('/auth/me', 'GET');
        const farmer = response.data || response;

        currentFarmerId = farmer._id;

        // Update navbar
        const farmerNameElement = document.querySelector('#farmerNameNav');
        if (farmerNameElement) {
            farmerNameElement.textContent = farmer.farmerName || 'Farmer';
        }

        // Update hero section
        const heroTitle = document.querySelector('.hero h2');
        if (heroTitle) {
            heroTitle.textContent = `Welcome, ${farmer.farmerName}! 🌾`;
        }

        // Load profile form
        loadProfileForm(farmer);

        // Load farms and recommendations
        loadFarms();
        loadRecommendations();

    } catch (error) {
        console.error('Failed to load profile:', error);
        showMessage('Failed to load profile', 'error');
    }
}

/**
 * Load farmer profile into edit form
 * @param {object} farmer - Farmer data
 */
function loadProfileForm(farmer) {
    const profileNameEl = document.getElementById('profileName');
    const profileAgeEl = document.getElementById('profileAge');
    const profileEmailEl = document.getElementById('profileEmail');
    const profilePhoneEl = document.getElementById('profilePhone');
    const profileAddressEl = document.getElementById('profileAddress');
    const profileCityEl = document.getElementById('profileCity');
    const profileStateEl = document.getElementById('profileState');
    const profileLandAreaEl = document.getElementById('profileLandArea');

    if (profileNameEl) profileNameEl.value = farmer.farmerName || '';
    if (profileAgeEl) profileAgeEl.value = farmer.age || '';
    if (profileEmailEl) profileEmailEl.value = farmer.email || '';
    if (profilePhoneEl) profilePhoneEl.value = farmer.phone || '';
    if (profileAddressEl) profileAddressEl.value = farmer.address || '';
    if (profileCityEl) profileCityEl.value = farmer.city || '';
    if (profileStateEl) profileStateEl.value = farmer.state || '';
    if (profileLandAreaEl) profileLandAreaEl.value = farmer.totalLandArea || '';
}

/**
 * Handle profile update
 */
async function handleProfileUpdate() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = getFormData(form);

        disableButton(submitBtn);

        try {
            const response = await fetchAPI('/auth/update-profile', 'PUT', {
                farmerName: formData.profileName,
                age: parseInt(formData.profileAge),
                phone: formData.profilePhone,
                address: formData.profileAddress,
                city: formData.profileCity,
                state: formData.profileState,
                totalLandArea: parseFloat(formData.profileLandArea)
            });

            showMessage('Profile updated successfully!', 'success');
            enableButton(submitBtn);
        } catch (error) {
            showMessage(error.message || 'Failed to update profile', 'error');
            enableButton(submitBtn);
        }
    });
}

// ===========================
// Farm Management
// ===========================

/**
 * Load and display all farms
 */
async function loadFarms() {
    try {
        const response = await fetchAPI('/farms', 'GET');
        farmsList = response.data || response;

        displayFarms(farmsList);
        updateDashboardStats();
    } catch (error) {
        console.error('Failed to load farms:', error);
        showMessage('Failed to load farms', 'error');
    }
}

/**
 * Display farms in grid
 * @param {array} farms - Array of farm objects
 */
function displayFarms(farms) {
    const farmsContainer = document.getElementById('farmsList');
    if (!farmsContainer) return;

    if (farms.length === 0) {
        farmsContainer.innerHTML = '<p style="padding: 20px; color: var(--dark-gray);">No farms added yet. Create your first farm!</p>';
        return;
    }

    farmsContainer.innerHTML = farms.map(farm => `
        <div class="farm-card">
            <div class="farm-header">
                <h3>${farm.farmName}</h3>
                <div class="farm-actions">
                    <button class="btn btn-small" onclick="editFarm('${farm._id}')">✏️ Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteFarm('${farm._id}')">🗑️ Delete</button>
                </div>
            </div>
            <div class="farm-details">
                <p><strong>Location:</strong> ${farm.location}</p>
                <p><strong>Area:</strong> ${farm.totalArea} hectares</p>
                <p><strong>Soil Type:</strong> ${farm.soilType}</p>
                <p><strong>Soil pH:</strong> ${farm.soilPH}</p>
                <p><strong>Water Availability:</strong> ${farm.waterAvailability}</p>
                <p><strong>Irrigation:</strong> ${farm.irrigationType}</p>
                <p><strong>Weather Pattern:</strong> ${farm.weatherPattern}</p>
                <p><strong>Rainfall:</strong> ${farm.averageRainfall}mm</p>
                <p><strong>Last Crop:</strong> ${farm.lastHarvestedCrop}</p>
            </div>
            <button class="btn btn-primary" onclick="getRecommendations('${farm._id}')">Get Recommendations ✨</button>
        </div>
    `).join('');
}

/**
 * Handle farm creation
 */
async function handleCreateFarm() {
    const form = document.getElementById('farmForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = getFormData(form);

        // Validation
        const requiredFields = ['farmName', 'location', 'totalArea', 'soilType', 'soilPH', 'waterAvailability'];
        for (let field of requiredFields) {
            if (!formData[field]) {
                showMessage(`${field} is required`, 'error');
                return;
            }
        }

        disableButton(submitBtn);

        try {
            const response = await fetchAPI('/farms/create', 'POST', {
                farmName: formData.farmName,
                location: formData.location,
                totalArea: parseFloat(formData.totalArea),
                soilType: formData.soilType,
                soilPH: parseFloat(formData.soilPH),
                waterAvailability: formData.waterAvailability,
                irrigationType: formData.irrigationType,
                weatherPattern: formData.weatherPattern,
                averageRainfall: parseFloat(formData.averageRainfall || 0),
                lastHarvestedCrop: formData.lastHarvestedCrop
            });

            showMessage('Farm added successfully!', 'success');
            clearForm(form);
            enableButton(submitBtn);
            
            // Reload farms
            await loadFarms();

        } catch (error) {
            showMessage(error.message || 'Failed to create farm', 'error');
            enableButton(submitBtn);
        }
    });
}

/**
 * Edit farm (placeholder - can expand for full edit form)
 * @param {string} farmId - Farm ID
 */
function editFarm(farmId) {
    showMessage('Edit functionality coming soon!', 'info');
}

/**
 * Delete farm
 * @param {string} farmId - Farm ID
 */
async function deleteFarm(farmId) {
    if (!confirm('Are you sure you want to delete this farm?')) {
        return;
    }

    try {
        await fetchAPI(`/farms/${farmId}`, 'DELETE');
        showMessage('Farm deleted successfully!', 'success');
        await loadFarms();
    } catch (error) {
        showMessage(error.message || 'Failed to delete farm', 'error');
    }
}

// ===========================
// Recommendations Management
// ===========================

/**
 * Get crop recommendations for a farm
 * @param {string} farmId - Farm ID
 */
async function getRecommendations(farmId) {
    const submitBtn = document.querySelector(`button[onclick="getRecommendations('${farmId}')"]`);
    if (submitBtn) disableButton(submitBtn);

    try {
        const response = await fetchAPI('/recommendations/get-recommendations', 'POST', {
            farmId: farmId
        });

        const recommendation = response.data || response;

        // Store recommendation for viewing details
        if (recommendation._id) {
            sessionStorage.setItem('currentRecommendationId', recommendation._id);
            showMessage('Recommendations generated! Redirecting...', 'success', 1500);
            
            setTimeout(() => {
                window.location.href = `recommendation-detail.html?id=${recommendation._id}`;
            }, 1500);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to get recommendations', 'error');
        if (submitBtn) enableButton(submitBtn);
    }
}

/**
 * Load and display recommendation history
 */
async function loadRecommendations() {
    try {
        const response = await fetchAPI('/recommendations/history', 'GET');
        recommendationsList = response.data || response;

        displayRecommendations(recommendationsList);
    } catch (error) {
        console.error('Failed to load recommendations:', error);
        // Don't show error for recommendations - it's optional
    }
}

/**
 * Display recommendations in list
 * @param {array} recommendations - Array of recommendation objects
 */
function displayRecommendations(recommendations) {
    const recsContainer = document.getElementById('recommendationsList');
    if (!recsContainer) return;

    if (recommendations.length === 0) {
        recsContainer.innerHTML = '<p style="padding: 20px; color: var(--dark-gray);">No recommendations yet. Add a farm and get started!</p>';
        return;
    }

    recsContainer.innerHTML = recommendations.map(rec => {
        const topCrop = rec.recommendedCrops && rec.recommendedCrops[0];
        return `
            <div class="recommendation-card">
                <div class="rec-crop-info">
                    <h3>${topCrop ? topCrop.cropName : 'N/A'}</h3>
                    <div class="rec-details">
                        <p><strong>Match Score:</strong> <span class="score">${topCrop ? topCrop.matchScore : 0}%</span></p>
                        <p><strong>Expected Yield:</strong> ${topCrop ? formatNumber(topCrop.estimatedYield) : 'N/A'}</p>
                        <p><strong>Estimated Cost:</strong> ${topCrop ? formatCurrency(topCrop.estimatedCost) : 'N/A'}</p>
                        <p><strong>Market Price:</strong> ${topCrop && rec.analysisDetails ? formatCurrency(rec.analysisDetails.marketPrice || 0) : 'N/A'}</p>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="viewRecommendation('${rec._id}')">View Details →</button>
            </div>
        `;
    }).join('');
}

/**
 * View recommendation details
 * @param {string} recommendationId - Recommendation ID
 */
function viewRecommendation(recommendationId) {
    window.location.href = `recommendation-detail.html?id=${recommendationId}`;
}

// ===========================
// Dashboard Statistics
// ===========================

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    // Calculate total farms
    const farmCount = farmsList.length;
    const farmStatElement = document.querySelector('[data-stat="farms"]');
    if (farmStatElement) {
        farmStatElement.textContent = farmCount;
    }

    // Calculate total land area
    const totalArea = farmsList.reduce((sum, farm) => sum + (farm.totalArea || 0), 0);
    const areaStatElement = document.querySelector('[data-stat="area"]');
    if (areaStatElement) {
        areaStatElement.textContent = totalArea.toFixed(2) + ' ha';
    }

    // Calculate recommendation count
    const recCount = recommendationsList.length;
    const recStatElement = document.querySelector('[data-stat="recommendations"]');
    if (recStatElement) {
        recStatElement.textContent = recCount;
    }

    // Calculate potential profit (placeholder)
    let totalProfit = 0;
    recommendationsList.forEach(rec => {
        if (rec.recommendedCrops && rec.recommendedCrops[0]) {
            const crop = rec.recommendedCrops[0];
            const profit = (crop.estimatedYield || 0) * 10; // Simplified calculation
            totalProfit += profit;
        }
    });

    const profitStatElement = document.querySelector('[data-stat="profit"]');
    if (profitStatElement) {
        profitStatElement.textContent = formatCurrency(totalProfit);
    }
}

// ===========================
// Logout Function
// ===========================

/**
 * Logout user
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        clearToken();
        showMessage('Logged out successfully', 'success', 1500);
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// ===========================
// Initialize Dashboard
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize navigation
    initializeNavigation();

    // Handle farm creation
    handleCreateFarm();

    // Handle profile update
    handleProfileUpdate();

    // Show dashboard section by default
    showSection('dashboard');

    // Add tab navigation event listeners
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = btn.getAttribute('data-tab');
            
            // Hide all tabs
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.style.display = 'none');
            
            // Show selected tab
            const selectedTab = document.getElementById(tabId);
            if (selectedTab) {
                selectedTab.style.display = 'block';
            }

            // Update active state
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});
