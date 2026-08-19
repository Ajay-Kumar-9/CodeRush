import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const Gemini = async (req, res, next) => {
  console.log("\n========== GEMINI REQUEST ==========");

  // Safe API key debugging
  console.log("GEMINI_API_KEY exists:", !!GEMINI_API_KEY);

  if (GEMINI_API_KEY) {
    console.log(
      "GEMINI_API_KEY preview:",
      `${GEMINI_API_KEY.slice(0, 6)}...${GEMINI_API_KEY.slice(-4)}`
    );
    console.log("GEMINI_API_KEY length:", GEMINI_API_KEY.length);
  }

  const { message } = req.body;

  console.log("Message received:", message ? "YES" : "NO");

  if (!message) {
    console.log("❌ Message is missing");

    return res.status(400).json({
      message: "Message is required",
    });
  }

  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing from environment");

    return res.status(500).json({
      message: "Gemini API key is not configured",
    });
  }

  try {
    console.log("➡️ Sending request to Gemini...");

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

    console.log("Gemini Status:", fetchResponse.status);
    console.log("Gemini Status Text:", fetchResponse.statusText);

    const data = await fetchResponse.json();

    console.log(
      "Gemini Response:",
      JSON.stringify(data, null, 2)
    );

    if (!fetchResponse.ok) {
      console.error("❌ Gemini API Error");
      console.error("Status:", fetchResponse.status);
      console.error("Status Text:", fetchResponse.statusText);
      console.error(
        "Error Details:",
        JSON.stringify(data, null, 2)
      );

      return res.status(fetchResponse.status).json({
        message: "Gemini API request failed",
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        error: data,
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    console.log("✅ Gemini response received");
    console.log("Reply:", reply);
    console.log("========== GEMINI END ==========\n");

    return res.status(200).json({
      reply,
    });
  } catch (err) {
    console.error("❌ Gemini Controller Error:");
    console.error(err);

    next(err);
  }
};