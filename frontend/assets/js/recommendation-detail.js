// ===========================
// Recommendation Detail Functions
// ===========================

let currentRecommendation = null;

// ===========================
// Load Recommendation Detail
// ===========================

/**
 * Load recommendation from URL parameter
 */
async function loadRecommendationDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const recommendationId = urlParams.get('id');

    if (!recommendationId) {
        showMessage('No recommendation specified', 'error');
        return;
    }

    try {
        const response = await fetchAPI(`/recommendations/${recommendationId}`, 'GET');
        currentRecommendation = response.data || response;

        // Populate all sections
        populateHeroSection();
        populateAnalysisCards();
        populateCostBreakdown();
        populateWaterTips();
        populateLandTips();
        populateMarketingChannels();
        populateAlternativeCrops();
        populateRiskFactors();
        populateSustainability();

    } catch (error) {
        console.error('Failed to load recommendation:', error);
        showMessage('Failed to load recommendation details', 'error');
    }
}

// ===========================
// Hero Section
// ===========================

/**
 * Populate hero section with top recommendation
 */
function populateHeroSection() {
    if (!currentRecommendation || !currentRecommendation.recommendedCrops) return;

    const topCrop = currentRecommendation.recommendedCrops[0];
    const heroSection = document.querySelector('.rec-header');
    const heroTitle = document.querySelector('.rec-header h1');
    const badgeElement = document.querySelector('.match-badge');
    const detailsGrid = document.querySelector('.rec-hero-details');

    if (heroTitle) {
        heroTitle.textContent = topCrop.cropName || 'Recommended Crop';
    }

    if (badgeElement) {
        badgeElement.textContent = `${Math.round(topCrop.matchScore)}% Match`;
    }

    // Update crop image
    const cropImageElement = document.querySelector('.crop-image');
    if (cropImageElement && topCrop.cropImage) {
        cropImageElement.src = topCrop.cropImage;
        cropImageElement.onerror = function() {
            this.src = 'https://via.placeholder.com/300x300?text=' + topCrop.cropName;
        };
    }

    // Update hero details
    if (detailsGrid) {
        const profitMargin = currentRecommendation.analysisDetails?.profitMargin || 0;
        const marketPrice = currentRecommendation.analysisDetails?.marketPrice || 0;
        const daysToMaturity = topCrop.daysToMaturity || 'N/A';

        detailsGrid.innerHTML = `
            <div class="detail-item">
                <h3>Expected Profit/Hectare</h3>
                <p>${formatCurrency(topCrop.estimatedYield * marketPrice * (profitMargin / 100))}</p>
            </div>
            <div class="detail-item">
                <h3>Market Price</h3>
                <p>${formatCurrency(marketPrice)}</p>
            </div>
            <div class="detail-item">
                <h3>Profit Margin</h3>
                <p>${profitMargin.toFixed(1)}%</p>
            </div>
            <div class="detail-item">
                <h3>Days to Harvest</h3>
                <p>${daysToMaturity} days</p>
            </div>
        `;
    }
}

// ===========================
// Analysis Cards
// ===========================

/**
 * Populate analysis cards
 */
function populateAnalysisCards() {
    if (!currentRecommendation || !currentRecommendation.analysisDetails) return;

    const analysis = currentRecommendation.analysisDetails;
    const analysisGrid = document.querySelector('.analysis-grid');

    if (analysisGrid) {
        analysisGrid.innerHTML = `
            <div class="analysis-card soil-card">
                <h3>🌱 Soil Analysis</h3>
                <p>${analysis.soilAnalysis || 'Soil conditions are suitable for this crop.'}</p>
            </div>
            <div class="analysis-card water-card">
                <h3>💧 Water Analysis</h3>
                <p>${analysis.waterAnalysis || 'Water availability is adequate for optimal growth.'}</p>
            </div>
            <div class="analysis-card climate-card">
                <h3>🌤️ Climate Analysis</h3>
                <p>${analysis.climateAnalysis || 'Climate conditions are favorable for cultivation.'}</p>
            </div>
            <div class="analysis-card economic-card">
                <h3>💰 Economic Feasibility</h3>
                <p>${analysis.economicFeasibility || 'This crop offers good economic returns.'}</p>
            </div>
        `;
    }
}

// ===========================
// Cost Breakdown
// ===========================

/**
 * Populate cost breakdown table
 */
function populateCostBreakdown() {
    if (!currentRecommendation || !currentRecommendation.recommendedCrops) return;

    const topCrop = currentRecommendation.recommendedCrops[0];
    const costSection = document.querySelector('.cost-section');
    const costTableContainer = document.querySelector('.cost-table-container');

    if (!topCrop.estimatedCost || !costTableContainer) return;

    const cost = topCrop.estimatedCost;
    const totalCost = cost.totalPerHectare || 0;
    const marketPrice = currentRecommendation.analysisDetails?.marketPrice || 0;
    const expectedYield = topCrop.estimatedYield || 0;
    const totalRevenue = expectedYield * marketPrice;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalCost > 0 ? (profit / totalRevenue) * 100 : 0;

    // Calculate percentages
    const seedPercent = totalCost > 0 ? (cost.seed / totalCost) * 100 : 0;
    const fertiliserPercent = totalCost > 0 ? (cost.fertiliser / totalCost) * 100 : 0;
    const waterPercent = totalCost > 0 ? (cost.water / totalCost) * 100 : 0;
    const labourPercent = totalCost > 0 ? (cost.labour / totalCost) * 100 : 0;

    costTableContainer.innerHTML = `
        <table class="cost-table">
            <thead>
                <tr>
                    <th>Cost Component</th>
                    <th>Amount (₹/ha)</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Seed Cost</td>
                    <td>${formatCurrency(cost.seed || 0)}</td>
                    <td>${seedPercent.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Fertiliser</td>
                    <td>${formatCurrency(cost.fertiliser || 0)}</td>
                    <td>${fertiliserPercent.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Water & Irrigation</td>
                    <td>${formatCurrency(cost.water || 0)}</td>
                    <td>${waterPercent.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Labour</td>
                    <td>${formatCurrency(cost.labour || 0)}</td>
                    <td>${labourPercent.toFixed(1)}%</td>
                </tr>
                <tr class="total-row">
                    <td>Total Cost</td>
                    <td class="highlight">${formatCurrency(totalCost)}</td>
                    <td class="highlight">100%</td>
                </tr>
            </tbody>
        </table>
    `;

    // Profit calculation
    const profitCalcDiv = document.querySelector('.profit-calculation');
    if (profitCalcDiv) {
        profitCalcDiv.innerHTML = `
            <div class="calc-item">
                <strong>Expected Yield (per hectare):</strong>
                <span>${formatNumber(expectedYield)} units</span>
            </div>
            <div class="calc-item">
                <strong>Market Price (per unit):</strong>
                <span>${formatCurrency(marketPrice)}</span>
            </div>
            <div class="calc-item highlight">
                <strong>Total Revenue:</strong>
                <span>${formatCurrency(totalRevenue)}</span>
            </div>
            <div class="calc-item">
                <strong>Total Cost:</strong>
                <span>${formatCurrency(totalCost)}</span>
            </div>
            <div class="calc-item profit-highlight">
                <strong>Net Profit per Hectare:</strong>
                <span>${formatCurrency(profit)}</span>
            </div>
            <div class="calc-item profit-highlight">
                <strong>Profit Margin:</strong>
                <span>${profitMargin.toFixed(1)}%</span>
            </div>
        `;
    }
}

// ===========================
// Water Management Tips
// ===========================

/**
 * Populate water management tips
 */
function populateWaterTips() {
    if (!currentRecommendation || !currentRecommendation.waterManagementTips) return;

    const waterSection = document.querySelector('#waterTips');
    if (!waterSection) return;

    const tips = currentRecommendation.waterManagementTips;
    const tipsList = waterSection.querySelector('.tips-list');

    if (tipsList) {
        tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    }
}

// ===========================
// Land Utilization Tips
// ===========================

/**
 * Populate land utilization suggestions
 */
function populateLandTips() {
    if (!currentRecommendation || !currentRecommendation.landUtilizationSuggestions) return;

    const landSection = document.querySelector('#landTips');
    if (!landSection) return;

    const tips = currentRecommendation.landUtilizationSuggestions;
    const tipsList = landSection.querySelector('.tips-list');

    if (tipsList) {
        tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    }
}

// ===========================
// Marketing & Selling Channels
// ===========================

/**
 * Populate marketing channels
 */
function populateMarketingChannels() {
    if (!currentRecommendation || !currentRecommendation.marketingChannels) return;

    const marketGrid = document.querySelector('.market-grid');
    if (!marketGrid) return;

    const channels = currentRecommendation.marketingChannels;

    marketGrid.innerHTML = channels.map(channel => `
        <div class="market-card">
            <h3>${channel.channelName || 'Market Channel'}</h3>
            <div class="market-location">${channel.location || 'Local'}</div>
            <div class="market-price">Expected Price: ${formatCurrency(channel.expectedPrice || 0)}</div>
            <div class="market-profit">Profit Margin: ${(channel.profitMargin || 0).toFixed(1)}%</div>
        </div>
    `).join('');
}

// ===========================
// Alternative Crops
// ===========================

/**
 * Populate alternative crop recommendations
 */
function populateAlternativeCrops() {
    if (!currentRecommendation || !currentRecommendation.recommendedCrops) return;

    const alternativesSection = document.querySelector('#alternativeCrops');
    if (!alternativesSection) return;

    const crops = currentRecommendation.recommendedCrops.slice(1, 4); // Get 2nd to 4th top crops

    if (crops.length === 0) {
        alternativesSection.innerHTML = '<p>No alternative crops available.</p>';
        return;
    }

    const alternativesGrid = alternativesSection.querySelector('.alternatives-grid');
    if (alternativesGrid) {
        alternativesGrid.innerHTML = crops.map(crop => `
            <div class="alternative-card">
                <h3>${crop.cropName}</h3>
                <p><strong>Match Score:</strong> ${crop.matchScore.toFixed(1)}%</p>
                <p><strong>Expected Yield:</strong> ${formatNumber(crop.estimatedYield)}</p>
                <p><strong>Cost:</strong> ${formatCurrency(crop.estimatedCost.totalPerHectare)}</p>
            </div>
        `).join('');
    }
}

// ===========================
// Risk Factors
// ===========================

/**
 * Populate risk factors (pests, diseases)
 */
function populateRiskFactors() {
    if (!currentRecommendation) return;

    const riskSection = document.querySelector('#riskFactors');
    if (!riskSection) return;

    const topCrop = currentRecommendation.recommendedCrops[0];
    
    let pestsList = [];
    let diseasesList = [];

    if (topCrop.pests && Array.isArray(topCrop.pests)) {
        pestsList = topCrop.pests;
    }

    if (topCrop.diseases && Array.isArray(topCrop.diseases)) {
        diseasesList = topCrop.diseases;
    }

    const riskGrid = riskSection.querySelector('.risk-grid');
    if (riskGrid) {
        riskGrid.innerHTML = `
            <div class="risk-item">
                <h3>🐛 Common Pests</h3>
                <ul class="risk-list">
                    ${pestsList.map(pest => `<li>${pest}</li>`).join('') || '<li>No specific pests identified</li>'}
                </ul>
            </div>
            <div class="risk-item">
                <h3>🦠 Diseases</h3>
                <ul class="risk-list">
                    ${diseasesList.map(disease => `<li>${disease}</li>`).join('') || '<li>No specific diseases identified</li>'}
                </ul>
            </div>
            <div class="risk-item">
                <h3>🛡️ Prevention Methods</h3>
                <ul class="risk-list">
                    <li>Regular field monitoring</li>
                    <li>Use certified seeds</li>
                    <li>Proper crop rotation</li>
                    <li>Timely pesticide/fungicide application</li>
                    <li>Maintain farm hygiene</li>
                </ul>
            </div>
        `;
    }
}

// ===========================
// Sustainability
// ===========================

/**
 * Populate sustainability practices
 */
function populateSustainability() {
    if (!currentRecommendation) return;

    const sustainSection = document.querySelector('#sustainability');
    if (!sustainSection) return;

    const sustainabilityTips = sustainSection.querySelector('.sustainability-tips');
    if (sustainabilityTips) {
        sustainabilityTips.innerHTML = `
            <h3>🌍 Sustainable Farming Practices</h3>
            <ul class="tips-list">
                <li>Practice crop rotation to maintain soil health and reduce pest pressure</li>
                <li>Use organic fertilizers and bio-pesticides where possible</li>
                <li>Implement water conservation techniques like drip irrigation</li>
                <li>Use mulching to retain soil moisture and reduce weeds</li>
                <li>Maintain field edges with vegetation to support beneficial insects</li>
                <li>Avoid excessive chemical inputs by using integrated pest management</li>
                <li>Plan for weather variability and climate resilience</li>
            </ul>
        `;
    }
}

// ===========================
// Download Report
// ===========================

/**
 * Download recommendation as PDF (placeholder)
 */
function downloadReport() {
    if (!currentRecommendation) return;

    const topCrop = currentRecommendation.recommendedCrops[0];
    
    // Create a simple text report
    const report = `
CROP RECOMMENDATION REPORT
===========================

Recommended Crop: ${topCrop.cropName}
Match Score: ${topCrop.matchScore.toFixed(1)}%

COST ANALYSIS
=============
Total Cost per Hectare: ${formatCurrency(topCrop.estimatedCost.totalPerHectare)}
Expected Yield: ${topCrop.estimatedYield} units
Market Price: ${formatCurrency(currentRecommendation.analysisDetails?.marketPrice || 0)}
Expected Revenue: ${formatCurrency(topCrop.estimatedYield * (currentRecommendation.analysisDetails?.marketPrice || 0))}
Net Profit: ${formatCurrency((topCrop.estimatedYield * (currentRecommendation.analysisDetails?.marketPrice || 0)) - topCrop.estimatedCost.totalPerHectare)}

ANALYSIS
========
Soil Analysis: ${currentRecommendation.analysisDetails?.soilAnalysis || 'N/A'}
Water Analysis: ${currentRecommendation.analysisDetails?.waterAnalysis || 'N/A'}
Climate Analysis: ${currentRecommendation.analysisDetails?.climateAnalysis || 'N/A'}

Report Generated: ${new Date().toLocaleDateString()}
    `.trim();

    // Download as text file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `recommendation-${topCrop.cropName}-${new Date().getTime()}.txt`);
    element.style.display = 'none';
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showMessage('Report downloaded successfully!', 'success');
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
// Initialize on Page Load
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Load recommendation details
    loadRecommendationDetail();
});
