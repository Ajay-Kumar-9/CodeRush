import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const Gemini = async (req, res, next) => {

  const { message } = req.body;



  if (!message) {
    console.log(" Message is missing");

    return res.status(400).json({
      message: "Message is required",
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



    return res.status(200).json({
      reply,
    });
  } catch (err) {
    console.error(" Gemini Controller Error:");
    console.error(err);

    next(err);
  }
};