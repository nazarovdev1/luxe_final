import logger from '../utils/logger.js'

// Simple rules for calculating sustainability
const MATERIAL_ECO_SCORES = {
  'organic cotton': 8,
  'recycled polyester': 7,
  'hemp': 9,
  'linen': 8,
  'bamboo': 7,
  'polyester': 2,
  'nylon': 2,
  'acrylic': 1,
  'leather': 3,
  'vegan leather': 6,
  'wool': 5
}

class SustainabilityService {
  calculateEcoScore(materials) {
    if (!materials || materials.length === 0) {
      return 5; // Default average score
    }

    let totalScore = 0;
    let validMaterialsCount = 0;

    materials.forEach(material => {
      const matLower = material.toLowerCase().trim();
      if (MATERIAL_ECO_SCORES[matLower]) {
        totalScore += MATERIAL_ECO_SCORES[matLower];
        validMaterialsCount++;
      }
    });

    if (validMaterialsCount === 0) {
      return 5; // Unknown materials, return average
    }

    // Return average score of all valid materials, rounded to nearest integer
    return Math.round(totalScore / validMaterialsCount);
  }

  // Example of estimating carbon footprint based on weight/category
  estimateCarbonFootprint(category, weightKg = 0.5) {
    // Rough estimate: kg CO2 per kg of clothing
    let factor = 15; 
    if (category === 'Premium' || category === 'Luxury') {
      factor = 20; // High quality usually means more intense processing
    }
    return factor * weightKg;
  }
}

export default new SustainabilityService();
