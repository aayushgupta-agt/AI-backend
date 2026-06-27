import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ALLOWED_MODELS = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "google/gemma-4-26b-a4b-it:free",
  "openai/gpt-oss-20b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, model } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const selectedModel = ALLOWED_MODELS.includes(model)
      ? model
      : ALLOWED_MODELS[0];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Search AI",
        },
        body: JSON.stringify({
          model: selectedModel,
          temperature: 0.2,
          max_tokens: 800,
          frequency_penalty: 0.3,
          messages: [
            {
              role: "system",
              content: `
You are a search assistant.

Format answers in Markdown.

Rules:
- Use headings when useful.
- Use bullet points.
- Use code blocks for code.
- Use tables when comparing items.
- Be concise.
`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter request failed",
      });
    }

    res.json({
      answer: data?.choices?.[0]?.message?.content || "No response generated",
      model: selectedModel,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
