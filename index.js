import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.post("/api/chat", async (req, res) => {
    const model = "nvidia/nemotron-3-ultra-550b-a55b:free";
    try {
        const { prompt } = req.body;
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
                    temperature: 0.2,
                    max_tokens: 800,
                    frequency_penalty: 0.3,
                    messages: [
                        {
                            role: "system",
                            content: `
                                        You are a search assistant.
                                        Give direct answers.
                                        Use bullet points.
                                        Avoid fluff.
                                        Keep answers concise.
                                        `
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                }),
            }
        );

    const data = await response.json();

        // console.log(
        //     JSON.stringify(data, null, 2)
        // );

        res.json({
            answer:
                data?.choices?.[0]?.message?.content ??
                "No response generated",
            model: model ? model : "Unknown model",
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
