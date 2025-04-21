import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const { message } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: "Pesan kosong." });
    }
  
    const API_KEY = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY:", API_KEY);
  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
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
  
      if (!response.ok) {
        console.error("Gemini API response not OK:", await response.text());
        return res.status(500).json({ reply: "⚠️ Respon dari Gemini gagal." });
      }
  
      const data = await response.json();
      console.log("Gemini Response:", data);
  
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "❌ Tidak ada respon dari AI.";
  
      res.status(200).json({ reply });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ reply: "⚠️ Gagal terhubung ke Gemini API." });
    }
  }
  