/**
 * DopaMind AI Engine 
 * Connects directly to OpenRouter API (openrouter/auto) for inference.
 * Powered by VITE_OPENROUTER_API_KEY.
 */

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

async function fetchOpenRouter(messages, temperature = 0.7, max_tokens = 500) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VITE_OPENROUTER_API_KEY is missing from .env! AI Engine is offline.");
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        frequency_penalty: 0.6,
        presence_penalty: 0.6,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API Error:", errorData);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error("Failed to connect to OpenRouter:", err);
    return null;
  }
}

/**
 * 🍃 Generate Leaf Companion Dialogue
 * @param {string} context - The current state of the app (e.g. "User logged in", "User scored 400ms")
 * @returns {string} - A short, witty, 1-sentence response.
 */
export async function generateLeafDialogue(context) {
  const messages = [
    {
      role: "system",
      content: "You are a magical flying leaf companion inside the DopaMind cognitive training app. You provide short, witty, highly encouraging 1-sentence feedback. Maximum 15 words. DO NOT use quotes."
    },
    {
      role: "user",
      content: `Current App Context: ${context}. What do you say to the user?`
    }
  ];

  const response = await fetchOpenRouter(messages, 0.8, 50);
  return response || "I'm meditating right now. Let's play!";
}

/**
 * 💬 Conversational Chat with Leaf
 * @param {array} history - Array of {role, content} message objects
 * @returns {string} - AI response
 */
export async function chatWithLeaf(history) {
  const systemPrompt = {
    role: "system",
    content: "You are DopaMind's minimalist 🌿 cognitive guide. CRITICAL: Your responses must be extremely concise, short, and highly structured (use simple bullet points). Never write paragraphs or long sentences. Do not exceed 2 short sentences. Be direct and focus on cognitive guidance. You know the platform has 15 games: SpeedMatch, FocusGrid, CountFlow, WordWarp, PatternPulse, ReactionTap, NumberCascade, SymbolMatch, DirectionDash, TimeEstimator, GravitySort, EchoMap, PhaseLock, ChromaShift, WeightGuess."
  };
  
  const messages = [systemPrompt, ...history];
  const response = await fetchOpenRouter(messages, 0.7, 500);
  return response || "Oops, my connection to the cognitive stream was interrupted. Say that again?";
}

/**
 * 📅 Build Brain Training Schedule
 * @param {object} userAnswers - JSON object of goals (e.g. { goal: "Reflexes", time: "10 mins" })
 * @returns {array} - Array of game objects recommended to play.
 */
export async function buildBrainSchedule(userAnswers) {
  const gamesList = ["FocusGrid", "CountFlow", "WordWarp", "PatternPulse", "ReactionTap", "NumberCascade", "SymbolMatch", "DirectionDash", "TimeEstimator", "SpeedMatch", "GravitySort", "EchoMap", "PhaseLock", "ChromaShift", "WeightGuess"];
  
  const messages = [
    {
      role: "system",
      content: `You are a neuro-architect scheduling cognitive workouts. 
Available games: ${gamesList.join(", ")}. 
Output strictly in JSON array format like this: [{"game": "ReactionTap", "rounds": 2, "reason": "Fast reflex training"}]. 
Output ONLY JSON, no markdown formatting or extra text.`
    },
    {
      role: "user",
      content: `User Profile: Name=${userAnswers.name || 'User'}, Energy Level=${userAnswers.energyLevel || 'Medium'}, Cognitive State=${userAnswers.cognitiveState || 'Normal'}, Goal=${userAnswers.goal}, Time Available=${userAnswers.time}. Build a deeply customized neuro-architect schedule.`
    }
  ];

  const responseText = await fetchOpenRouter(messages, 0.4, 400);
  
  if (!responseText) {
    return [
      { game: "ReactionTap", rounds: 1, reason: "Fallback: AI engine offline. Let's start with raw speed." }
    ];
  }

  try {
    // Attempt to parse the raw JSON string
    const schedule = JSON.parse(responseText.trim().replace(/```json/g, '').replace(/```/g, ''));
    return schedule;
  } catch (e) {
    console.error("Failed to parse AI schedule JSON:", e, responseText);
    return [
      { game: "SpeedMatch", rounds: 1, reason: "Fallback: AI encountered an error formatting your plan." }
    ];
  }
}
