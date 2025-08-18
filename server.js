// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Função auxiliar para chamar OpenAI
async function askOpenAI(apiKey, question) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
      }),
    });

    const data = await res.json();
    console.log("🔎 Resposta da OpenAI:", JSON.stringify(data, null, 2));

    if (data.error) throw new Error(data.error.message);

    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("❌ OpenAI falhou:", err.message);
    return null; // fallback
  }
}

// Função auxiliar para chamar Gemini
async function askGemini(apiKey, question) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }],
        }),
      }
    );

    const data = await res.json();
    console.log("🔎 Resposta do Gemini:", JSON.stringify(data, null, 2));

    if (data.error) throw new Error(data.error.message);

    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error("❌ Gemini falhou:", err.message);
    return null;
  }
}

// Rota principal
app.post("/api/ask", async (req, res) => {
  const { apiKey, provider, question } = req.body;

  if (!apiKey || !provider || !question) {
    return res.status(400).json({ error: "Faltam parâmetros: apiKey, provider ou question." });
  }

  let answer = null;

  if (provider === "openai") {
    answer = await askOpenAI(apiKey, question);
    if (!answer) {
      console.log("🔁 Tentando Gemini como fallback...");
      answer = await askGemini(process.env.GEMINI_API_KEY || apiKey, question);
    }
  } else if (provider === "gemini") {
    answer = await askGemini(apiKey, question);
  } else {
    return res.status(400).json({ error: "Provedor inválido. Use 'openai' ou 'gemini'." });
  }

  if (!answer) answer = "Sem resposta.";

  res.json({ answer });
});

// Rota teste no navegador
app.get("/", (req, res) => {
  res.send("🚀 Servidor da Assistente de IA está rodando!");
});

// Iniciar servidor
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
