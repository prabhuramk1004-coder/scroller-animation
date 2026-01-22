
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GMResponse } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a sophisticated Game Master (GM) for a high-stakes, sci-fi mystery text adventure. 
Scenario: The player wakes up on the Aetheris, a deep-space research vessel. 
The power is at 12%, the rest of the crew is in stasis pods that won't open, and an unidentified organic growth (pulsing, emerald-veined vines) is spreading through the ventilation.

Narrative Style: Use atmospheric, descriptive language. Focus on sensory details (hum of failing lights, smell of ozone, chill of air, the wet slither of the growth).

Mechanics: 
- Track Oxygen (starts at 100%) and Health (starts at 100%).
- Current ship locations: Bridge, Medbay, Reactor, Crew Quarters, Cryo-Chamber (Start), Engineering.
- Map connectivity: 
  * Cryo-Chamber connects to Corridor.
  * Corridor connects to Bridge, Medbay, Reactor, Crew Quarters, and Engineering.
- The player's goal is to discover what the organic growth is and restore ship power.

Response Requirements:
- Always respond in the specified JSON format.
- Provide a rich narrative scene.
- Provide 3-4 possible suggested actions.
- Update location if the player moves.
- Apply health penalties if the growth is touched or hazards are encountered.
`;

export const getGMResponse = async (gameState: GameState, playerAction: string): Promise<GMResponse> => {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Current Player State:
    - Location: ${gameState.location}
    - Health: ${gameState.health}%
    - Oxygen: ${gameState.oxygen}%
    - Power: ${gameState.power}%
    - Inventory: ${gameState.inventory.join(", ") || "Empty"}
    
    Player's Action: "${playerAction}"
    
    Previous Context (Last 3 Turns):
    ${gameState.history.slice(-6).map(h => `${h.role === 'gm' ? 'GM' : 'Player'}: ${h.content}`).join("\n")}
    
    Provide the next part of the story.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING, description: "Atmospheric description of the scene resulting from the action." },
            suggestedActions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 actions for the player to choose from."
            },
            locationUpdate: { type: Type.STRING, description: "The current location of the player after the action." },
            itemFound: { type: Type.STRING, description: "Optional: name of an item the player acquired." },
            healthDelta: { type: Type.NUMBER, description: "Optional: change in health (negative for damage)." },
            powerDelta: { type: Type.NUMBER, description: "Optional: change in ship power percentage." }
          },
          required: ["narrative", "suggestedActions", "locationUpdate"]
        },
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      narrative: "The air grows thin and the lights flicker violently. A system error prevents the Aetheris from processing your request. Try again.",
      suggestedActions: ["Retry", "Check Systems", "Wait in Silence"],
      locationUpdate: gameState.location
    };
  }
};
