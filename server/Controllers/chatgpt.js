import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const Gemini =  async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const fetchResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    if (!fetchResponse.ok) {
      throw new Error(`Gemini API error: ${fetchResponse.statusText}`);
    }

    const data = await fetchResponse.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    res.json({ reply });
  } catch (err) {
    console.error("Gemini fetch error:", err.message); 
    res.status(500).json({ error: "Failed to get AI response from Gemini" });
  }
};


