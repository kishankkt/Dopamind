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
 * 📅 Build Brain Training Schedule
 * @param {object} userAnswers - JSON object of goals (e.g. { goal: "Reflexes", time: "10 mins" })
 * @returns {array} - Array of game objects recommended to play.
 */
export async function buildBrainSchedule(userAnswers) {
  const gamesList = ["FocusGrid", "CountFlow", "WordWarp", "PatternPulse", "ReactionTap", "NumberCascade", "SymbolMatch", "DirectionDash", "TimeEstimator", "SpeedMatch"];
  
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
      content: `User Profile: Goal=${userAnswers.goal}, Time Available=${userAnswers.time}. Build their schedule.`
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
