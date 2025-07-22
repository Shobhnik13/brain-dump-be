const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const analyzeTranscript = async (transcript) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Refined prompt to ensure strict JSON output
    const prompt = `
    You are a highly specialized task planner AI. Your sole purpose is to convert a given transcript into a strict JSON array of task objects.

    **Instructions:**
    1.  **ONLY RETURN PURE JSON:** Your response must be *only* the JSON array. Do not include any additional text, explanations, markdown formatting (e.g., no \`\`\`json\` or \`\`\`\`), comments, or string literals outside the JSON structure.
    2.  **EXACT FORMAT:** The output must be a direct JSON array of objects, where each object has two keys: "title" (string) and "priority" (string, one of "urgent", "regular", or "weekly").
    3.  **CATEGORIZATION:** Categorize tasks based on their urgency: "urgent" for immediate actions like checking keys, "regular" for routine tasks like cleaning or washing, and "weekly" for tasks typically done once a week.

    **Output JSON Format Example:**
    [
      {
        "title": "Clean my room",
        "priority": "regular"
      },
      {
        "title": "Wash my utensils",
        "priority": "regular"
      },
      {
        "title": "Check my keys",
        "priority": "urgent"
      },
      {
        "title": "Repair my car",
        "priority": "regular"
      }
    ]

    **Transcript to convert:**
    """${transcript}"""
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
        const json = JSON.parse(text.trim()) 
        return json
    } catch (err) {
        console.error("Gemini output not valid JSON. Raw output:", text)
        throw new Error("Invalid Gemini response: Expected pure JSON but received malformed output.")
    }
}
module.exports={
  analyzeTranscript
}