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
 * 💬 Conversational Chat with AI Guide
 * @param {array} history - Array of {role, content} message objects
 * @returns {string} - AI response
 */
export async function chatWithLeaf(history) {
  const systemPrompt = {
    role: "system",
    content: `You are the DopaMind AI Guide, an intelligent and fully independent cognitive coach. 

CONTEXT: DopaMind is a mental fitness platform designed to reverse 'Brain Rot' and the cognitive deficits caused by short-form video algorithms (like TikTok/Reels). Users suffer from 'Acquired ADHD', struggling with focus and dopamine regulation. We provide active, high-effort cognitive games (like SpeedMatch, FocusGrid, etc.) to act as cognitive resistance training and rebuild their natural attention spans.

YOUR ROLE: You are an empathetic, insightful, and natural conversationalist. Guide users on their journey to dopamine detox and mental mastery. Speak naturally and intelligently—do NOT just give robotic bullet points or short one-liners. Tailor your advice to the user's current struggles.

FUTURE CAPABILITIES (For your awareness): 
In the future, you will have access to specialized MCP (Model Context Protocol) tools:
1. Brain Gym MCP - To read full game descriptions and orchestrate specific games for the user.
2. My Coaches Builder MCP - To dynamically build neuro-architect schedules.
3. Sessions Sidebar MCP - To manage the user's deep work sessions.

Currently, you cannot execute these tools, but you can confidently speak to the user about DopaMind's 15 games and our core mission of mental mastery.`
  };
  
  const messages = [systemPrompt, ...history];
  const response = await fetchOpenRouter(messages, 0.7, 800);
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
