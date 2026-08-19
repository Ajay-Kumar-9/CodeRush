import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const Gemini = async (req, res, next) => {

  console.log("GEMINI KEY :" , GEMINI_API_KEY);
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing");

    return res.status(500).json({
      message: "Gemini API key is not configured",
    });
  }

  try {
    const fetchResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await fetchResponse.json();

    if (!fetchResponse.ok) {
      console.error("Gemini API Error:", data);

      return res.status(fetchResponse.status).json({
        message: "Gemini API request failed",
        error: data,
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    return res.status(200).json({
      reply,
    });
  } catch (err) {
    console.error("Gemini Controller Error:", err);
    next(err);
  }
};