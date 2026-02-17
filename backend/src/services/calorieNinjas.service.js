import axios from 'axios';

/**
 * CalorieNinjas API Service
 * Free tier: 10,000 requests/month
 * Get your API key at: https://calorieninjas.com/api
 */

const CALORIE_NINJAS_API = 'https://api.calorieninjas.com/v1';

// Search foods by natural language query
export const searchFoods = async (query) => {
    const apiKey = process.env.CALORIE_NINJAS_API_KEY;
    
    if (!apiKey) {
        console.warn('CalorieNinjas API key not configured');
        return [];
    }

    try {
        const response = await axios.get(`${CALORIE_NINJAS_API}/nutrition`, {
            params: { query },
            headers: { 'X-Api-Key': apiKey }
        });

        const items = response.data.items || [];
        
        return items.map(item => formatItem(item));
    } catch (error) {
        console.error('CalorieNinjas search error:', error.message);
        return [];
    }
};

const formatItem = (item) => {
    return {
        name: item.name || 'Unknown Food',
        brand: '',
        servingSize: item.serving_size_g || 100,
        servingUnit: 'g',
        source: 'calorieninjas',
        nutrition: {
            calories: Math.round(item.calories || 0),
            protein: Math.round((item.protein_g || 0) * 10) / 10,
            carbs: Math.round((item.carbohydrates_total_g || 0) * 10) / 10,
            fat: Math.round((item.fat_total_g || 0) * 10) / 10,
            fiber: Math.round((item.fiber_g || 0) * 10) / 10,
            sugar: Math.round((item.sugar_g || 0) * 10) / 10,
            sodium: Math.round((item.sodium_mg || 0) * 10) / 10,
            saturatedFat: Math.round((item.fat_saturated_g || 0) * 10) / 10,
            cholesterol: Math.round(item.cholesterol_mg || 0),
            potassium: Math.round(item.potassium_mg || 0)
        }
    };
};

export default {
    searchFoods
};
