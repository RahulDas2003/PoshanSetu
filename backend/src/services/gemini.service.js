import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Groq AI Service (Free tier with Llama 3)
 * Get your free API key at: https://console.groq.com/keys
 * Very fast and generous free tier!
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const analyzeMeal = async (mealData) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        throw new Error('Groq API key not configured');
    }

    const prompt = `You are a friendly nutrition expert. Analyze this meal and provide helpful insights.

Meal Details:
- Meal Type: ${mealData.mealType}
- Foods: ${mealData.foods.map(f => `${f.name} (${f.servings} servings, ${f.nutrition?.calories || 0} kcal)`).join(', ')}
- Total Calories: ${mealData.totalNutrition?.calories || 0} kcal
- Total Protein: ${mealData.totalNutrition?.protein || 0}g
- Total Carbs: ${mealData.totalNutrition?.carbs || 0}g
- Total Fat: ${mealData.totalNutrition?.fat || 0}g

Please provide:
1. A brief analysis of this meal (2-3 sentences)
2. One positive aspect about this meal
3. One suggestion for improvement
4. A health tip related to this meal type

Keep your response concise and encouraging. Format with emojis for visual appeal.`;

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices?.[0]?.message?.content || 'Unable to analyze meal at this time.';
    } catch (error) {
        console.error('Groq API error:', error.response?.data || error.message);
        throw new Error('Failed to analyze meal');
    }
};

export const getMealRecommendations = async (userProfile, dailyProgress, mealType) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        throw new Error('Groq API key not configured');
    }

    const remainingCalories = (userProfile.dailyTargets?.calories || 2000) - (dailyProgress?.consumed?.calories || 0);
    const remainingProtein = (userProfile.dailyTargets?.protein || 150) - (dailyProgress?.consumed?.protein || 0);

    const prompt = `You are a helpful Indian nutrition assistant specializing in traditional Indian cuisine. Suggest meal ideas for the user based on authentic North Indian and South Indian foods.

User Profile:
- Goal: ${userProfile.profile?.goal || 'maintain weight'}
- Daily Calorie Target: ${userProfile.dailyTargets?.calories || 2000} kcal
- Remaining Calories Today: ${remainingCalories} kcal
- Remaining Protein Today: ${remainingProtein}g
- Meal Type Needed: ${mealType}

Please suggest 3 healthy ${mealType} ideas using traditional Indian recipes. Include a mix of North Indian and South Indian dishes. Examples of foods to recommend:
- North Indian: Roti/Chapati, Dal (Moong/Masoor/Arhar), Paneer dishes, Rajma, Chole, Paratha, Poha, Upma, Khichdi, Dahi, Lassi, Sabzis, Stuffed Parathas, etc.
- South Indian: Idli, Dosa, Uttapam, Sambar, Rasam, Pongal, Appam, Puttu, Curd Rice, Kootu, Avial, Thoran, Vada, etc.

Each suggestion must:
1. Fit within their remaining calories
2. Help meet their protein goal
3. Use commonly available Indian ingredients and be easy to prepare at home

Format each suggestion as:
🍽️ **Dish Name (Hindi/Regional Name)**
- Brief description with key ingredients
- Approximate calories & protein per serving
- Why it's a good choice for their goal

Keep suggestions practical, home-cooked, and nutritious. Prioritize wholesome Indian meals over processed or Western foods.`;

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 600
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices?.[0]?.message?.content || 'Unable to get recommendations at this time.';
    } catch (error) {
        console.error('Groq API error:', error.response?.data || error.message);
        throw new Error('Failed to get recommendations');
    }
};

export const chat = async (message, context = {}) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        throw new Error('Groq API key not configured');
    }

    const systemPrompt = `You are SmartAI, a friendly and knowledgeable nutrition assistant. 
You help users with:
- Nutrition questions and advice
- Meal planning suggestions
- Understanding food labels and macros
- Healthy eating tips
- Fitness and diet guidance

User's daily target: ${context.dailyTargets?.calories || 2000} calories
User's goal: ${context.goal || 'maintain weight'}

Keep responses helpful, concise, and encouraging. Use emojis occasionally for a friendly tone.`;

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 400
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices?.[0]?.message?.content || 'I apologize, I couldn\'t process that. Please try again.';
    } catch (error) {
        console.error('Groq API error:', error.response?.data || error.message);
        throw new Error('Failed to get AI response');
    }
};

export const getDailyTip = async (userGoal = 'maintain') => {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        return 'Stay hydrated! Aim for 8 glasses of water daily. 💧';
    }

    const prompt = `Give me ONE short, actionable nutrition tip for someone trying to ${userGoal} weight. 
Keep it under 2 sentences. Include an emoji. Make it encouraging and practical.`;

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.9,
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices?.[0]?.message?.content || 
            'Stay consistent with your meals - small daily habits lead to big results! 💪';
    } catch (error) {
        return 'Stay consistent with your meals - small daily habits lead to big results! 💪';
    }
};

export const analyzeImage = async (imageUrl, description = "") => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured for image analysis');
    }

    const promptText = `You are a nutrition expert. Analyze this meal image and estimate its nutritional content.
${description ? `User added this context: "${description}"` : ""}

Respond strictly in this exact JSON format:
{
    "foods": [
        {
            "name": "food name",
            "portion": "estimated portion size",
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0
        }
    ],
    "totalCalories": 0,
    "totalProtein": 0,
    "totalCarbs": 0,
    "totalFat": 0,
    "mealType": "breakfast/lunch/dinner/snack",
    "healthRating": 8,
    "suggestions": "Brief health suggestion"
}

Provide reasonable estimates based on the visual contents and common serving sizes. Do not include markdown formatting or extra text outside the JSON.`;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const mimeType = imageUrl.split(';')[0].split(':')[1];
        const base64Data = imageUrl.split(',')[1];
        
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            }
        };

        const result = await model.generateContent([promptText, imagePart]);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        return {
            rawAnalysis: text,
            foods: [],
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            healthRating: 5,
            suggestions: "Could not parse specific nutritional data, but the image has been processed."
        };
    } catch (error) {
        console.error('Gemini API error:', error.message);
        throw new Error('Failed to analyze food image with Gemini');
    }
};

export default {
    analyzeMeal,
    getMealRecommendations,
    chat,
    getDailyTip,
    analyzeImage
};
