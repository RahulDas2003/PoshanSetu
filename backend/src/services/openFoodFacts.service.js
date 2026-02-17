import axios from 'axios';

/**
 * OpenFoodFacts API Service
 * Free API - No API key required!
 * Docs: https://wiki.openfoodfacts.org/API
 */

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org';

// Search foods by name
export const searchFoods = async (query, page = 1, pageSize = 20) => {
    try {
        const response = await axios.get(`${OPENFOODFACTS_API}/cgi/search.pl`, {
            params: {
                search_terms: query,
                search_simple: 1,
                action: 'process',
                json: 1,
                page: page,
                page_size: pageSize,
                fields: 'code,product_name,brands,image_url,nutriments,serving_size,serving_quantity'
            }
        });

        const products = response.data.products || [];
        
        return products.map(product => formatProduct(product));
    } catch (error) {
        console.error('OpenFoodFacts search error:', error.message);
        return [];
    }
};

// Get food by barcode
export const getFoodByBarcode = async (barcode) => {
    try {
        const response = await axios.get(`${OPENFOODFACTS_API}/api/v0/product/${barcode}.json`);
        
        if (response.data.status === 1 && response.data.product) {
            return formatProduct(response.data.product);
        }
        return null;
    } catch (error) {
        console.error('OpenFoodFacts barcode lookup error:', error.message);
        return null;
    }
};

// Format OpenFoodFacts product to our schema
const formatProduct = (product) => {
    const nutriments = product.nutriments || {};
    
    return {
        externalId: product.code,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        servingSize: product.serving_quantity || 100,
        servingUnit: 'g',
        imageUrl: product.image_url || '',
        barcode: product.code,
        source: 'openfoodfacts',
        nutrition: {
            calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
            protein: Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10,
            carbs: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10,
            fat: Math.round((nutriments.fat_100g || nutriments.fat || 0) * 10) / 10,
            fiber: Math.round((nutriments.fiber_100g || nutriments.fiber || 0) * 10) / 10,
            sugar: Math.round((nutriments.sugars_100g || nutriments.sugars || 0) * 10) / 10,
            sodium: Math.round((nutriments.sodium_100g || nutriments.sodium || 0) * 1000) / 10, // Convert to mg
            saturatedFat: Math.round((nutriments['saturated-fat_100g'] || 0) * 10) / 10
        }
    };
};

export default {
    searchFoods,
    getFoodByBarcode
};
