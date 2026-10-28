import axios from 'axios';

/**
 * CalorieNinjas API Service
 * Free tier: 10,000 requests/month
 * Get your API key at: https://calorieninjas.com/api
 */

const API_NINJAS_URL = 'https://api.api-ninjas.com/v1';
const CALORIE_NINJAS_URL = 'https://api.calorieninjas.com/v1';

// Search foods by natural language query
export const searchFoods = async (query) => {
    const apiKey = process.env.API_NINJAS_API_KEY || process.env.CALORIE_NINJAS_API_KEY;
    
    if (!apiKey) {
        console.warn('API Ninjas / CalorieNinjas API key not configured');
        return [];
    }

    try {
        const baseUrl = process.env.API_NINJAS_API_KEY ? API_NINJAS_URL : CALORIE_NINJAS_URL;
        const response = await axios.get(`${baseUrl}/nutrition`, {
            params: { query },
            headers: { 'X-Api-Key': apiKey }
        });

        const items = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        
        return items.map(item => formatItem(item));
    } catch (error) {
        console.error('Nutrition API search error:', error.message);
        return [];
    }
};

const parseNum = (val, roundToOneDec = false) => {
    const n = parseFloat(val);
    if (isNaN(n)) return 0;
    return roundToOneDec ? Math.round(n * 10) / 10 : Math.round(n);
};

const formatItem = (item) => {
    const carbs = parseNum(item.carbohydrates_total_g, true);
    const fat = parseNum(item.fat_total_g, true);
    const protein = parseNum(item.protein_g, true);
    let calories = parseNum(item.calories);
    
    // Fallback: If calories is restricted/missing in free tier, calculate from macros
    if (!calories && (carbs > 0 || fat > 0 || protein > 0)) {
        calories = Math.round(carbs * 4 + protein * 4 + fat * 9);
    }

    return {
        name: item.name || 'Unknown Food',
        brand: '',
        servingSize: parseNum(item.serving_size_g) || 100,
        servingUnit: 'g',
        source: 'calorieninjas',
        nutrition: {
            calories,
            protein,
            carbs,
            fat,
            fiber: parseNum(item.fiber_g, true),
            sugar: parseNum(item.sugar_g, true),
            sodium: parseNum(item.sodium_mg, true),
            saturatedFat: parseNum(item.fat_saturated_g, true),
            cholesterol: parseNum(item.cholesterol_mg),
            potassium: parseNum(item.potassium_mg)
        }
    };
};

export default {
    searchFoods
};
