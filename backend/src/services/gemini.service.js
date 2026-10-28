import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service (Groq AI & Google Gemini)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Models in priority order with instant fallback in case of high demand / 503 spikes
const GEMINI_MODELS = [
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash'
];

// Helper to use Gemini for text/JSON generation
const generateWithGemini = async (prompt, systemInstruction = '', config = {}) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('AI API key not configured (neither GROQ_API_KEY nor GEMINI_API_KEY found)');
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    let lastError = null;
    for (const modelName of GEMINI_MODELS) {
        try {
            const modelOptions = {
                model: modelName,
                systemInstruction: systemInstruction || undefined
            };
            if (config.responseMimeType) {
                modelOptions.generationConfig = { responseMimeType: config.responseMimeType };
            }
            const model = genAI.getGenerativeModel(modelOptions);
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            lastError = err;
            console.warn(`Model ${modelName} unavailable (${err.message}). Trying fallback...`);
        }
    }

    throw lastError || new Error('Failed to generate content with Gemini');
};

export const getDishImageUrl = (dishName = '', cuisine = '') => {
    const text = `${dishName} ${cuisine}`.toLowerCase();
    if (text.includes('handvo') || text.includes('dhokla') || text.includes('idada') || text.includes('khaman')) {
        return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('dosa') || text.includes('uttapam') || text.includes('pesarattu') || text.includes('paniyaram')) {
        return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('khichdi') || text.includes('pongal') || text.includes('daliya') || text.includes('porridge') || text.includes('puttu')) {
        return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('paneer') || text.includes('bhurji') || text.includes('tofu')) {
        return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('biryani') || text.includes('pulao') || text.includes('rice') || text.includes('bath')) {
        return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('paratha') || text.includes('thepla') || text.includes('roti') || text.includes('naan') || text.includes('litti')) {
        return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('poha') || text.includes('upma') || text.includes('idli') || text.includes('vada')) {
        return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('cheela') || text.includes('chilla') || text.includes('besan')) {
        return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('salad') || text.includes('sprout') || text.includes('chaat') || text.includes('kachumber') || text.includes('makhana')) {
        return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('dal') || text.includes('sambar') || text.includes('curry') || text.includes('chole') || text.includes('rajma') || text.includes('kadhi') || text.includes('gatte')) {
        return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80';
};

export const getYouTubeRecipeLink = (dishName, chefOrChannel = '') => {
    const query = `${dishName} recipe ${chefOrChannel || 'Ranveer Brar Bharatzkitchen'}`;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

export const getCuratedIndianRecipes = (mealType = 'dinner', remainingCalories = 425) => {
    const catalog = {
        dinner: [
            {
                name: "Gujarati Vegetable Handvo",
                regionalName: "ગુજરાતી હાંડવો (Fermented Rice & Lentil Cake)",
                cuisine: "Gujarati",
                mealType: "dinner",
                prepTime: "20 mins",
                cookTime: "25 mins",
                calories: 290,
                protein: 11,
                carbs: 42,
                fat: 8,
                fiber: 6,
                description: "A traditional Gujarati savory cake made from naturally fermented rice and mixed lentils (chana, urad, and toor dal). Mixed with grated bottle gourd (doodhi), ginger, and green chillies, then slow-cooked with a crunchy tempering of mustard and sesame seeds.",
                whyItsGood: "The overnight natural fermentation breaks down complex starches for smooth night-time digestion. The added bottle gourd adds bulk and fiber without extra calories, making it satisfying yet light before bed.",
                ingredients: [
                    "1 cup Handvo flour (rice & mixed lentils)",
                    "1/2 cup grated bottle gourd (doodhi / lauki)",
                    "1/4 cup low-fat curd (yogurt)",
                    "1 tsp mustard seeds & sesame seeds",
                    "1 green chilli & 1/2 inch ginger paste",
                    "1/4 tsp turmeric, pinch of asafoetida (hing), salt to taste",
                    "1 tsp cold-pressed oil for tempering"
                ],
                instructions: [
                    "Step 1: Whisk the fermented batter with grated bottle gourd, ginger-chilli paste, turmeric, and salt.",
                    "Step 2: Heat 1 tsp oil in a heavy non-stick pan, add mustard seeds, sesame seeds, and curry leaves until they crackle.",
                    "Step 3: Pour the batter into the pan, cover with a lid and cook on low heat for 12-15 minutes until the bottom is crisp and golden.",
                    "Step 4: Carefully flip and cook the other side for 8-10 minutes. Cut into slices and serve warm with green chutney."
                ],
                youtubeSearchQuery: "Gujarati Vegetable Handvo authentic recipe Ranveer Brar Bharatzkitchen",
                recommendedChefChannel: "Chef Ranveer Brar / Tarla Dalal"
            },
            {
                name: "Hyderabadi Spot Dosa",
                regionalName: "హైదరాబాదీ స్పాట్ దోశ (Spiced Fermented Crêpe)",
                cuisine: "Hyderabadi",
                mealType: "dinner",
                prepTime: "10 mins",
                cookTime: "15 mins",
                calories: 310,
                protein: 9,
                carbs: 46,
                fat: 9,
                fiber: 5,
                description: "An iconic Hyderabadi street-style thick, fluffy pancake made from fermented rice and urad dal batter. Cooked directly over a sizzling bed of finely chopped onions, tomatoes, fresh coriander, green chilies, and roasted podi (gunpowder).",
                whyItsGood: "Captures bold, spicy Hyderabadi flavors while relying on steamed and griddled fermented batter. It feels indulgent and filling while remaining comfortably under your calorie limit.",
                ingredients: [
                    "1.5 cups fermented dosa batter (rice & urad dal)",
                    "1 medium onion, finely chopped",
                    "1 medium tomato, finely chopped",
                    "1 green chilli & fresh coriander, finely chopped",
                    "1 tbsp Idli Podi (gunpowder spice mix)",
                    "1 tsp ghee or sesame oil for the tawa"
                ],
                instructions: [
                    "Step 1: Heat a seasoned cast iron tawa, add a drop of ghee, and drop small mounds of chopped onions, tomatoes, and green chillies directly on the hot surface.",
                    "Step 2: Sprinkle 1 tsp idli podi over the sizzling vegetables.",
                    "Step 3: Pour a ladle of thick fermented batter directly over each vegetable spot. Do not spread.",
                    "Step 4: Drizzle a few drops of ghee, cover with a lid for 2 minutes, then flip and cook the spiced side until caramelized and crisp."
                ],
                youtubeSearchQuery: "Hyderabadi Street Style Spot Dosa recipe Bharatzkitchen",
                recommendedChefChannel: "Bharatzkitchen / Hebbar's Kitchen"
            },
            {
                name: "Gujarati Idada",
                regionalName: "ગુજરાતી ઈદડા (White Fermented Rice & Urad Dal Dhokla)",
                cuisine: "Gujarati",
                mealType: "dinner",
                prepTime: "15 mins",
                cookTime: "15 mins",
                calories: 250,
                protein: 8,
                carbs: 48,
                fat: 3,
                fiber: 4,
                description: "Unlike yellow besan dhokla, Idada is a traditional Gujarati delicacy made from a naturally fermented batter of soaked rice and split urad dal. Steamed cloud-soft with crushed black pepper on top and served with zesty home-made green coriander-mint chutney.",
                whyItsGood: "Virtually oil-free and practically weightless on the stomach. The fermentation enhances bioavailability of B-vitamins and leaves you with plenty of calorie cushion before bed.",
                ingredients: [
                    "1 cup rice & 1/2 cup split urad dal (fermented)",
                    "1/2 tsp crushed black peppercorns",
                    "1/2 tsp ginger-green chilli paste",
                    "1/4 tsp fruit salt (eno) or baking soda",
                    "Salt to taste",
                    "Fresh coriander leaves for garnish"
                ],
                instructions: [
                    "Step 1: Whisk the fermented rice-urad batter with ginger-green chilli paste and salt.",
                    "Step 2: Grease a steamer plate with a drop of oil. Pour a medium layer of batter onto the plate.",
                    "Step 3: Generously sprinkle freshly cracked black pepper on top of the batter.",
                    "Step 4: Steam on high flame for 10-12 minutes until a toothpick inserted comes out clean. Cool for 2 minutes, cut into diamonds, and enjoy with fresh mint chutney."
                ],
                youtubeSearchQuery: "Gujarati Idada recipe white dhokla Cook With Parul",
                recommendedChefChannel: "Cook With Parul / Sanjeev Kapoor Khazana"
            }
        ],
        breakfast: [
            {
                name: "Gujarati Methi Thepla with Masala Curd",
                regionalName: "મેથી થેપલા (Fenugreek Flatbread)",
                cuisine: "Gujarati",
                mealType: "breakfast",
                prepTime: "15 mins",
                cookTime: "15 mins",
                calories: 280,
                protein: 9,
                carbs: 44,
                fat: 7,
                fiber: 6,
                description: "Nutritious and aromatic flatbreads made by kneading fresh fenugreek leaves (methi) into whole wheat flour, gram flour (besan), ginger-garlic paste, and yogurt.",
                whyItsGood: "Fenugreek is known to regulate blood sugar levels, while whole wheat and besan provide sustained morning energy and high fiber.",
                ingredients: [
                    "1 cup whole wheat flour & 2 tbsp besan",
                    "1 cup finely chopped fresh fenugreek (methi) leaves",
                    "2 tbsp fresh curd (yogurt)",
                    "1/2 tsp carom seeds (ajwain), turmeric, chilli powder",
                    "1 tsp oil for roasting"
                ],
                instructions: [
                    "Step 1: Knead whole wheat flour, besan, chopped methi, curd, ajwain, and spices into a soft dough.",
                    "Step 2: Roll out into thin discs.",
                    "Step 3: Roast on a hot griddle with minimal oil until light brown spots appear on both sides.",
                    "Step 4: Serve hot with a bowl of seasoned low-fat curd."
                ],
                youtubeSearchQuery: "authentic Gujarati Methi Thepla recipe Ranveer Brar",
                recommendedChefChannel: "Chef Ranveer Brar"
            },
            {
                name: "Andhra Moong Dal Pesarattu",
                regionalName: "ఆంధ్ర పెసరట్టు (Green Gram Protein Crêpe)",
                cuisine: "Andhra",
                mealType: "breakfast",
                prepTime: "10 mins",
                cookTime: "15 mins",
                calories: 290,
                protein: 15,
                carbs: 42,
                fat: 6,
                fiber: 8,
                description: "A powerhouse South Indian breakfast crepe made from soaked whole green moong dal ground with ginger and cumin. Crispy on the edges and soft in the middle.",
                whyItsGood: "Exceptional plant-based protein content (15g) with zero fermentation lag. Keeps cravings away until lunchtime.",
                ingredients: [
                    "1 cup whole green moong (soaked)",
                    "1 inch fresh ginger & 2 green chillies",
                    "1 tsp cumin seeds (jeera)",
                    "Finely chopped onions and coriander for topping",
                    "1 tsp oil"
                ],
                instructions: [
                    "Step 1: Grind soaked whole moong with ginger, green chillies, and cumin into a smooth batter.",
                    "Step 2: Pour a ladle on a hot tawa and spread outward like a thin dosa.",
                    "Step 3: Top with chopped onions and coriander. Drizzle half a teaspoon of oil.",
                    "Step 4: Cook until golden brown and crispy, fold and serve with spicy allam (ginger) chutney."
                ],
                youtubeSearchQuery: "Andhra Pesarattu recipe authentic Hebbar's Kitchen",
                recommendedChefChannel: "Hebbar's Kitchen / Vismai Food"
            },
            {
                name: "Maharashtrian Kanda Poha",
                regionalName: "कांदे पोहे (Flattened Rice with Peanuts)",
                cuisine: "Maharashtrian",
                mealType: "breakfast",
                prepTime: "10 mins",
                cookTime: "15 mins",
                calories: 270,
                protein: 7,
                carbs: 46,
                fat: 6,
                fiber: 4,
                description: "Light and fluffy flattened rice tempered with mustard seeds, curry leaves, onions, green chillies, crunchy roasted peanuts, and a splash of fresh lemon juice.",
                whyItsGood: "Iron-rich, effortlessly digestible, and providing quick carbohydrate fuel for the morning without causing any sluggishness.",
                ingredients: [
                    "1.5 cups medium-thick poha (flattened rice)",
                    "1 medium onion, sliced",
                    "2 tbsp raw peanuts",
                    "1 green chilli & 8-10 curry leaves",
                    "1/2 tsp turmeric powder & mustard seeds",
                    "Fresh lemon juice and coriander"
                ],
                instructions: [
                    "Step 1: Rinse poha in a colander until soft; drain completely.",
                    "Step 2: Heat 1 tsp oil, fry peanuts until crunchy, then add mustard seeds, curry leaves, and sliced onions.",
                    "Step 3: Add turmeric and green chillies, toss in the drained poha and salt.",
                    "Step 4: Cover and steam on low for 2 minutes. Garnish with lemon juice and fresh coriander."
                ],
                youtubeSearchQuery: "authentic Maharashtrian Kanda Poha recipe Bharatzkitchen",
                recommendedChefChannel: "Bharatzkitchen / Chef Ranveer Brar"
            }
        ],
        lunch: [
            {
                name: "Rajasthani Gatte Ki Sabzi with Phulka",
                regionalName: "राजस्थानी गट्टे की सब्जी (Gram Flour Dumplings in Gravy)",
                cuisine: "Rajasthani",
                mealType: "lunch",
                prepTime: "20 mins",
                cookTime: "25 mins",
                calories: 380,
                protein: 16,
                carbs: 48,
                fat: 12,
                fiber: 7,
                description: "Tender spiced gram flour (besan) dumplings simmered in a tangy, probiotic-rich yogurt gravy flavored with crushed coriander seeds and hing, served with 2 warm phulkas.",
                whyItsGood: "High in protein from gram flour and gut-friendly probiotics from yogurt. Ideal for a wholesome, energizing afternoon meal.",
                ingredients: [
                    "1/2 cup besan (gram flour)",
                    "3/4 cup fresh whisked curd (yogurt)",
                    "1 tsp fennel seeds, crushed coriander seeds, carom seeds",
                    "Turmeric, Kashmiri chilli, garam masala",
                    "2 small whole wheat phulkas"
                ],
                instructions: [
                    "Step 1: Make a stiff spiced besan dough, roll into logs, and boil in water for 10 minutes until dumplings float.",
                    "Step 2: Slice the cooked dumplings into bite-sized gattas.",
                    "Step 3: Whisk yogurt with spices and simmer with a tempered cumin-hing base until fragrant.",
                    "Step 4: Add the gatta slices and simmer for 6 minutes. Serve hot with whole wheat phulkas."
                ],
                youtubeSearchQuery: "authentic Rajasthani Gatte Ki Sabzi Ranveer Brar",
                recommendedChefChannel: "Chef Ranveer Brar / Kunal Kapur"
            },
            {
                name: "Hyderabadi Khatti Dal with Jeera Rice",
                regionalName: "హైదరాబాదీ ఖట్టీ దాల్ (Tangy Tamarind Dal)",
                cuisine: "Hyderabadi",
                mealType: "lunch",
                prepTime: "15 mins",
                cookTime: "20 mins",
                calories: 360,
                protein: 14,
                carbs: 58,
                fat: 7,
                fiber: 8,
                description: "A signature Hyderabadi sour yellow dal cooked with toor dal, tomatoes, tamarind pulp, and garlic, finished with a sizzling tempering of cumin, curry leaves, and dry red chillies.",
                whyItsGood: "Tamarind provides natural digestive acids, while toor dal offers clean plant protein. Satisfying and perfectly balanced.",
                ingredients: [
                    "1/2 cup toor dal (split pigeon peas)",
                    "1 ripe tomato & 2 tbsp tamarind extract",
                    "4-5 cloves garlic, crushed",
                    "1/2 tsp cumin seeds, mustard seeds, curry leaves",
                    "3/4 cup cooked brown or jeera rice"
                ],
                instructions: [
                    "Step 1: Pressure cook toor dal with chopped tomatoes, turmeric, and water until soft; mash smoothly.",
                    "Step 2: Add tamarind pulp, salt, and water to adjust consistency, then boil for 5 minutes.",
                    "Step 3: In a small pan, heat 1 tsp oil, fry crushed garlic, cumin, mustard seeds, and curry leaves.",
                    "Step 4: Pour sizzling tadka into the dal and serve immediately with warm rice."
                ],
                youtubeSearchQuery: "Hyderabadi Khatti Dal authentic recipe Sanjeev Kapoor",
                recommendedChefChannel: "Sanjeev Kapoor Khazana / Hebbar's Kitchen"
            },
            {
                name: "Punjabi Palak Paneer with Whole Wheat Roti",
                regionalName: "ਪਾਲਕ ਪਨੀਰ (Cottage Cheese in Spinach Puree)",
                cuisine: "Punjabi",
                mealType: "lunch",
                prepTime: "15 mins",
                cookTime: "20 mins",
                calories: 370,
                protein: 20,
                carbs: 36,
                fat: 14,
                fiber: 8,
                description: "Fresh spinach blanched and pureed with garlic and green chillies, cooked with low-fat paneer cubes and finished with roasted cumin powder and garam masala.",
                whyItsGood: "Combines 20g of complete protein with massive doses of dietary iron, folate, and calcium from spinach.",
                ingredients: [
                    "100g low-fat paneer cubes",
                    "2 bunches fresh spinach (palak), blanched",
                    "1 onion, 1 tomato, 4 cloves garlic, 1 inch ginger",
                    "1 tsp cumin seeds, garam masala, kasuri methi",
                    "1 small whole wheat roti"
                ],
                instructions: [
                    "Step 1: Blanch spinach in boiling water for 2 minutes, plunge into ice water, and blend into a bright green puree.",
                    "Step 2: Saute chopped onions, ginger, and garlic in a pan until lightly browned.",
                    "Step 3: Add tomato puree, dry spices, and stir in the spinach puree with salt.",
                    "Step 4: Gently fold in paneer cubes, simmer for 3 minutes, and sprinkle with crushed kasuri methi."
                ],
                youtubeSearchQuery: "restaurant style Palak Paneer recipe Bharatzkitchen",
                recommendedChefChannel: "Bharatzkitchen / Chef Ranveer Brar"
            }
        ],
        snack: [
            {
                name: "Gujarati Nylon Khaman Dhokla",
                regionalName: "ગુજરાતી નાયલોન ખમણ (Steamed Spongy Gram Cake)",
                cuisine: "Gujarati",
                mealType: "snack",
                prepTime: "10 mins",
                cookTime: "15 mins",
                calories: 180,
                protein: 7,
                carbs: 30,
                fat: 3,
                fiber: 3,
                description: "Feather-light, spongy steamed gram flour cakes infused with lemon and green chillies, lightly soaked in tempered mustard-sesame water.",
                whyItsGood: "Steamed without any deep frying, high in plant protein and exceptionally gentle on the stomach.",
                ingredients: [
                    "1 cup besan (gram flour)",
                    "1 tbsp lemon juice & 1/2 tsp ginger-green chilli paste",
                    "1/2 tsp fruit salt (eno)",
                    "1 tsp mustard seeds, green chillies slit, sesame seeds",
                    "Fresh coriander and grated coconut for garnish"
                ],
                instructions: [
                    "Step 1: Whisk besan with water, lemon juice, turmeric, and ginger-chilli paste into a smooth batter.",
                    "Step 2: Add eno, quickly pour into a greased tin, and steam for 15 minutes.",
                    "Step 3: Prepare a light tempering with mustard seeds, green chillies, water, and lemon juice.",
                    "Step 4: Pour tempering over the cut dhokla pieces and garnish with coriander."
                ],
                youtubeSearchQuery: "Nylon Khaman Dhokla recipe Cook With Parul",
                recommendedChefChannel: "Cook With Parul / Sanjeev Kapoor"
            },
            {
                name: "Mumbai Moong Sprout Chaat",
                regionalName: "મગ સ્પ્રાઉટ્સ ચાટ / Sprout Chaat",
                cuisine: "Maharashtrian",
                mealType: "snack",
                prepTime: "10 mins",
                cookTime: "5 mins",
                calories: 190,
                protein: 11,
                carbs: 32,
                fat: 2,
                fiber: 7,
                description: "Steamed sprouted green moong beans tossed with crunchy cucumbers, ripe tomatoes, red onions, fresh coriander, roasted cumin, and zesty chaat masala.",
                whyItsGood: "Sprouting quadruples the bioavailability of vitamins and enzymes. High protein, virtually fat-free, and delightfully crunchy.",
                ingredients: [
                    "1.5 cups sprouted green moong (lightly steamed)",
                    "1/2 cup cucumber & tomato, diced",
                    "1 small onion, finely chopped",
                    "1 tsp chaat masala & roasted cumin powder",
                    "Fresh lemon juice and mint leaves"
                ],
                instructions: [
                    "Step 1: Lightly steam sprouted moong for 3 minutes so it retains its crisp bite.",
                    "Step 2: Transfer to a mixing bowl and let it cool slightly.",
                    "Step 3: Add diced cucumbers, tomatoes, onions, chaat masala, and salt.",
                    "Step 4: Toss with freshly squeezed lemon juice and mint leaves."
                ],
                youtubeSearchQuery: "healthy sprout chaat recipe for weight loss Hebbar's Kitchen",
                recommendedChefChannel: "Hebbar's Kitchen / Kabita's Kitchen"
            },
            {
                name: "Roasted Spiced Makhana",
                regionalName: "रोस्टेड मखाना (Fox Nuts Snack)",
                cuisine: "Pan-Indian",
                mealType: "snack",
                prepTime: "5 mins",
                cookTime: "8 mins",
                calories: 150,
                protein: 5,
                carbs: 26,
                fat: 3,
                fiber: 4,
                description: "Crispy roasted fox nuts (lotus seeds) seasoned with pink Himalayan salt, freshly ground black pepper, chaat masala, and a touch of pure ghee.",
                whyItsGood: "Low glycemic index, rich in magnesium and antioxidants, perfect for satisfying evening crunch cravings guilt-free.",
                ingredients: [
                    "2 cups plain makhana (fox nuts / lotus seeds)",
                    "1/2 tsp pure A2 cow ghee",
                    "1/4 tsp turmeric, black pepper, chaat masala",
                    "Himalayan pink salt to taste"
                ],
                instructions: [
                    "Step 1: Heat 1/2 tsp ghee in a heavy pan on low flame.",
                    "Step 2: Add makhana and slow roast for 6-8 minutes, stirring continuously until crisp.",
                    "Step 3: Add turmeric, pink salt, black pepper, and chaat masala, tossing to coat evenly.",
                    "Step 4: Cool and enjoy as a crunchy evening tea accompaniment."
                ],
                youtubeSearchQuery: "crispy roasted makhana recipe Ranveer Brar",
                recommendedChefChannel: "Chef Ranveer Brar"
            }
        ]
    };

    const typeKey = (mealType || 'dinner').toLowerCase();
    const meals = (catalog[typeKey] || catalog.dinner).map(m => ({
        ...m,
        imageUrl: getDishImageUrl(m.name, m.cuisine),
        youtubeUrl: getYouTubeRecipeLink(m.name, m.recommendedChefChannel)
    }));

    return {
        summary: `Here are 3 unique, gut-friendly ${mealType} ideas drawn from traditional regional cuisines, perfectly crafted to fit comfortably within your remaining ${remainingCalories} kcal budget.`,
        meals
    };
};

export const analyzeMeal = async (mealData) => {
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

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
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
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices?.[0]?.message?.content || 'Unable to analyze meal at this time.';
        } catch (error) {
            console.error('Groq API error:', error.response?.data || error.message);
        }
    }

    if (process.env.GEMINI_API_KEY) {
        try {
            return await generateWithGemini(prompt);
        } catch (error) {
            console.error('Gemini API error:', error.message);
            throw new Error('Failed to analyze meal');
        }
    }

    throw new Error('No AI API key configured');
};

const parseMarkdownRecommendations = (text, remainingCalories, mealType) => {
    const meals = [];
    const blocks = text.split(/(?=🍽️\s*\*\*)/g).filter(b => b.trim().length > 0);
    
    for (const b of blocks) {
        const titleMatch = b.match(/🍽️\s*\*\*([^*]+)\*\*/);
        if (!titleMatch) continue;
        
        const rawTitle = titleMatch[1].trim();
        let name = rawTitle;
        let regionalName = '';
        if (rawTitle.includes('(') && rawTitle.includes(')')) {
            const pIdx = rawTitle.indexOf('(');
            name = rawTitle.substring(0, pIdx).trim();
            regionalName = rawTitle.substring(pIdx + 1, rawTitle.lastIndexOf(')')).trim();
        }

        const descMatch = b.match(/-\s*\*\*Description:\*\*\s*([^\n]+)/i);
        const macroMatch = b.match(/-\s*\*\*Approx\.?\s*Calories\s*&\s*Protein:\*\*\s*([^\n]+)/i);
        const whyMatch = b.match(/-\s*\*\*Why it's a good choice:\*\*\s*([^\n]+)/i);

        let calories = 300;
        let protein = 10;
        if (macroMatch) {
            const calM = macroMatch[1].match(/(\d+)\s*kcal/i);
            const protM = macroMatch[1].match(/(\d+)\s*g\s*protein/i);
            if (calM) calories = parseInt(calM[1]);
            if (protM) protein = parseInt(protM[1]);
        }

        meals.push({
            name,
            regionalName: regionalName || name,
            cuisine: name.toLowerCase().includes('gujarati') ? 'Gujarati' : (name.toLowerCase().includes('hyderabadi') ? 'Hyderabadi' : 'Indian Regional'),
            mealType,
            prepTime: '15-20 mins',
            cookTime: '20-25 mins',
            calories,
            protein,
            carbs: Math.max(10, Math.round((calories - (protein * 4) - 40) / 4)),
            fat: Math.max(4, Math.round((calories * 0.25) / 9)),
            fiber: 6,
            description: descMatch ? descMatch[1].trim() : 'Wholesome and balanced traditional preparation.',
            whyItsGood: whyMatch ? whyMatch[1].trim() : 'Rich in essential nutrients and gentle on digestion.',
            ingredients: [
                'Fresh seasonal vegetables & lentils',
                'Cold-pressed oil or pure ghee (1 tsp)',
                'Traditional Indian spices (mustard seeds, cumin, turmeric)',
                'Fresh ginger, green chillies, curry leaves'
            ],
            instructions: [
                'Prepare and wash the ingredients thoroughly.',
                'Tempering: Heat a pan with spices, mustard seeds, and curry leaves.',
                'Cook on low-to-medium heat until tender, aromatic, and cooked to perfection.'
            ],
            youtubeSearchQuery: `${name} authentic Indian recipe Ranveer Brar`,
            recommendedChefChannel: 'Chef Ranveer Brar / Hebbar\'s Kitchen'
        });
    }

    return {
        summary: `Here are 3 unique, gut-friendly ${mealType} ideas crafted from authentic regional cuisines to comfortably fit within your target of ${remainingCalories} kcal.`,
        meals
    };
};

export const getMealRecommendations = async (userProfile, dailyProgress, mealType) => {
    const remainingCalories = (userProfile.dailyTargets?.calories || 2000) - (dailyProgress?.consumed?.calories || 0);
    const remainingProtein = (userProfile.dailyTargets?.protein || 150) - (dailyProgress?.consumed?.protein || 0);

    const regionalFocuses = [
        'Punjabi', 'Rajasthani', 'Gujarati', 'Maharashtrian', 'Bengali',
        'Hyderabadi', 'Tamil', 'Kerala', 'Karnataka', 'Andhra',
        'Lucknowi/Awadhi', 'Bihari', 'Odia', 'Kashmiri', 'Assamese',
        'Chettinad', 'Mangalorean', 'Goan', 'UP Style', 'Marwari'
    ];
    const cuisineCategories = [
        'lentil & dal based dishes', 'rice based dishes', 'roti & bread based meals',
        'millet based healthy meals (ragi, bajra, jowar)', 'paneer & dairy based dishes',
        'egg based protein-rich meals', 'traditional thali combinations',
        'street food inspired healthy versions', 'fermented foods (idli, dosa, dhokla, idada, handvo)',
        'one-pot meals (khichdi, pulao, biryani)', 'stuffed paratha & sabzi combos',
        'chaat & salad inspired light meals', 'traditional breakfast specials',
        'seasonal vegetable based dishes', 'sprout & legume based protein meals'
    ];
    const randomRegion1 = regionalFocuses[Math.floor(Math.random() * regionalFocuses.length)];
    const randomRegion2 = regionalFocuses[Math.floor(Math.random() * regionalFocuses.length)];
    const randomCategory = cuisineCategories[Math.floor(Math.random() * cuisineCategories.length)];
    const randomSeed = Math.floor(Math.random() * 10000);

    const prompt = `You are a premier Indian nutritionist and master chef specializing in authentic traditional Indian cuisines.
Suggest 3 DISTINCT, healthy, and enticing meal ideas for ${mealType}.

User Profile:
- Goal: ${userProfile.profile?.goal || 'healthy lifestyle'}
- Daily Calorie Target: ${userProfile.dailyTargets?.calories || 2000} kcal
- Remaining Calories Today: ${remainingCalories} kcal
- Remaining Protein Today: ${remainingProtein}g
- Meal Type Needed: ${mealType}

🎲 Regional Spotlight (Seed: ${randomSeed}):
- Primary regions: ${randomRegion1} and ${randomRegion2}
- Category: ${randomCategory}
- Feature authentic traditional home-cooked recipes (e.g. Gujarati Handvo, Hyderabadi Spot Dosa, Gujarati Idada, Ragi Mudde, Pesarattu, Dal Baati, Moong Cheela, Khichdi, Thepla, etc.).

Return strictly a valid JSON object matching this schema:
{
  "summary": "1-2 sentence welcoming overview highlighting the regional cuisines chosen and why they fit the user's remaining calories and health goal.",
  "meals": [
    {
      "name": "English / Common Dish Name (e.g. Gujarati Vegetable Handvo)",
      "regionalName": "Native script or regional name (e.g. ગુજરાતી હાંડવો / Handvo)",
      "cuisine": "${randomRegion1}",
      "mealType": "${mealType}",
      "prepTime": "15-20 mins",
      "cookTime": "20-25 mins",
      "calories": 290,
      "protein": 11,
      "carbs": 42,
      "fat": 8,
      "fiber": 5,
      "description": "2-sentence mouthwatering description of the dish, highlighting its textures and authentic flavors.",
      "whyItsGood": "Why this dish is ideal for their digestion, health goal, and calorie limit.",
      "ingredients": [
        "1 cup Handvo flour or mixed lentils & rice",
        "1/2 cup grated bottle gourd (doodhi)",
        "1 tsp mustard seeds and sesame seeds",
        "1 green chilli & ginger paste"
      ],
      "instructions": [
        "Step 1: Mix fermented batter with grated vegetables and gentle spices.",
        "Step 2: Heat 1 tsp oil in a pan, add mustard and sesame seeds until they splutter.",
        "Step 3: Pour batter, cover and slow-cook until crisp and golden brown on both sides."
      ],
      "youtubeSearchQuery": "Gujarati Vegetable Handvo authentic recipe Ranveer Brar",
      "recommendedChefChannel": "Chef Ranveer Brar / Hebbar's Kitchen / Bharatzkitchen"
    }
  ]
}
Do not include any text outside the JSON.`;

    let rawOutput = '';

    if (process.env.GEMINI_API_KEY) {
        try {
            rawOutput = await generateWithGemini(prompt, '', { responseMimeType: 'application/json' });
        } catch (error) {
            console.warn('Gemini recipe live call warning (fallback will be applied if needed):', error.message);
        }
    }

    if (!rawOutput && process.env.GROQ_API_KEY) {
        try {
            const response = await axios.post(
                GROQ_API_URL,
                {
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1200
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            rawOutput = response.data.choices?.[0]?.message?.content || '';
        } catch (error) {
            console.warn('Groq recipe live call warning:', error.message);
        }
    }

    let resultData = null;

    if (rawOutput) {
        const jsonMatch = rawOutput.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed)) {
                    resultData = {
                        summary: `Here are 3 unique, gut-friendly ${mealType} ideas crafted from authentic regional cuisines to comfortably fit within your target of ${remainingCalories} kcal.`,
                        meals: parsed
                    };
                } else if (parsed.meals && parsed.meals.length > 0) {
                    resultData = parsed;
                }
            } catch (e) {
                console.warn('JSON parse fallback:', e.message);
            }
        }

        if (!resultData || !resultData.meals || resultData.meals.length === 0) {
            resultData = parseMarkdownRecommendations(rawOutput, remainingCalories, mealType);
        }
    }

    // Graceful Fallback: If AI is rate-limited or fails, deliver authentic regional Indian recipe catalog
    if (!resultData || !resultData.meals || resultData.meals.length === 0) {
        console.log(`Using curated authentic Indian recipe catalog for ${mealType}...`);
        resultData = getCuratedIndianRecipes(mealType, remainingCalories);
    }

    // Enrich every meal item with image & YouTube URL
    if (resultData && Array.isArray(resultData.meals)) {
        resultData.meals = resultData.meals.map(meal => {
            const cleanName = meal.name || 'Indian Dish';
            const chef = meal.recommendedChefChannel || 'Chef Ranveer Brar / Hebbar\'s Kitchen';
            return {
                ...meal,
                imageUrl: meal.imageUrl || getDishImageUrl(cleanName, meal.cuisine),
                youtubeUrl: meal.youtubeUrl || getYouTubeRecipeLink(cleanName, chef),
                recommendedChefChannel: chef
            };
        });
    }

    return resultData;
};

export const chat = async (message, context = {}) => {
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

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
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
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices?.[0]?.message?.content || 'I apologize, I couldn\'t process that. Please try again.';
        } catch (error) {
            console.error('Groq API error:', error.response?.data || error.message);
        }
    }

    if (process.env.GEMINI_API_KEY) {
        try {
            return await generateWithGemini(message, systemPrompt);
        } catch (error) {
            console.error('Gemini API error:', error.message);
            return "Stay focused on nutrient-rich, balanced meals! Include fiber, lean protein, and plenty of water in your daily routine. 💪";
        }
    }

    return "Stay focused on nutrient-rich, balanced meals! Include fiber, lean protein, and plenty of water in your daily routine. 💪";
};

export const getDailyTip = async (userGoal = 'maintain') => {
    const prompt = `Give me ONE short, actionable nutrition tip for someone trying to ${userGoal} weight. 
Keep it under 2 sentences. Include an emoji. Make it encouraging and practical.`;

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
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
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices?.[0]?.message?.content || 
                'Stay consistent with your meals - small daily habits lead to big results! 💪';
        } catch (error) {
            console.error('Groq API error:', error.response?.data || error.message);
        }
    }

    if (process.env.GEMINI_API_KEY) {
        try {
            return await generateWithGemini(prompt);
        } catch (error) {
            console.error('Gemini API error:', error.message);
        }
    }

    return 'Stay consistent with your meals - small daily habits lead to big results! 💪';
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

    // Extract mimeType and base64Data safely
    let mimeType = 'image/jpeg';
    let base64Data = imageUrl;

    if (imageUrl.includes(';base64,')) {
        const parts = imageUrl.split(';base64,');
        mimeType = parts[0].replace(/^data:/, '') || 'image/jpeg';
        base64Data = parts[1];
    } else if (imageUrl.startsWith('data:')) {
        const commaIdx = imageUrl.indexOf(',');
        if (commaIdx !== -1) {
            mimeType = imageUrl.substring(5, commaIdx).split(';')[0] || 'image/jpeg';
            base64Data = imageUrl.substring(commaIdx + 1);
        }
    }

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType
        }
    };

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;

    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
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
            lastError = error;
            console.warn(`Gemini model ${modelName} failed (${error.message}). Trying fallback model...`);
        }
    }

    console.error('All Gemini models failed:', lastError?.message);
    throw new Error('Failed to analyze food image with Gemini');
};

export default {
    analyzeMeal,
    getMealRecommendations,
    chat,
    getDailyTip,
    analyzeImage,
    getDishImageUrl,
    getYouTubeRecipeLink,
    getCuratedIndianRecipes
};
