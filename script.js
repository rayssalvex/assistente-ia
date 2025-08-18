const form = document.getElementById("form");
const apiKeyInput = document.getElementById("apiKey");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const responseContent = document.querySelector(".response-content");
const gameSelect = document.getElementById("gameSelect");
const historyDiv = document.getElementById("history");
const clearHistoryBtn = document.getElementById("clearHistory");

// Configura opções de provider
gameSelect.innerHTML = `
  <option value="openai">OpenAI (GPT)</option>
  <option value="gemini">Gemini AI</option>
`;

// Evento de envio do form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const apiKey = apiKeyInput.value.trim();
  const question = questionInput.value.trim();
  const provider = gameSelect.value;

  if (!apiKey || !question || !provider) {
    alert("Preencha todos os campos!");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Carregando...";
  responseContent.textContent = "IA está pensando...";
  aiResponse.classList.remove("hidden");

  try {
    const res = await fetch("http://localhost:3000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, question, provider })
    });

    const data = await res.json();

    if (data.error) {
      responseContent.textContent = "Erro: " + data.error;
    } else {
      responseContent.textContent = data.answer;

      // Adiciona ao histórico
      const newEntry = document.createElement("div");
      newEntry.classList.add("history-entry");
      newEntry.innerHTML = `
        <strong>P:</strong> ${question}<br>
        <strong>R:</strong> ${data.answer}
      `;
      historyDiv.prepend(newEntry);
    }

  } catch (err) {
    responseContent.textContent = "Erro ao conectar ao servidor.";
  }

  askButton.disabled = false;
  askButton.textContent = "Perguntar";
});

// Botão de limpar histórico
clearHistoryBtn.addEventListener("click", () => {
  historyDiv.innerHTML = "";
});

// Dark/Light mode
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

if (localStorage.getItem("theme") === "light") {
  body.classList.add("light-mode");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("light-mode");

  if (body.classList.contains("light-mode")) {
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
});
