const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true
    },
    recommendedCrops: [{
        cropId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop'
        },
        cropName: String,
        matchScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        reason: String,
        estimatedYield: Number,
        estimatedCost: Number,
        estimatedProfit: Number,
        cropImage: String,
        profitMargin: Number
    }],
    analysisDetails: {
        soilAnalysis: String,
        waterAnalysis: String,
        climateAnalysis: String,
        economicFeasibility: String
    },
    waterManagementTips: [String],
    landUtilizationSuggestions: [String],
    marketingChannels: [{
        channel: String,
        location: String,
        expectedPrice: Number,
        profitMargin: Number
    }],
    seasonalPlan: [{
        month: String,
        activity: String,
        relatedCrop: String
    }],
    costBreakdown: {
        seedCost: Number,
        fertiliserCost: Number,
        labourCost: Number,
        waterCost: Number,
        totalCost: Number
    },
    riskFactors: [String],
    sustainabilityTips: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
