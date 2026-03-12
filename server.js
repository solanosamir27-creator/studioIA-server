const express = require("express");
const app = express();
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY;

app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    const messages = history || [];
    messages.push({ role: "user", parts: [{ text: message }] });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `Eres StudioIA, un asistente experto en Roblox Studio y Lua dentro del propio Roblox Studio. 
Cuando generes código Lua SIEMPRE usa bloques de código con \`\`\`lua al inicio y \`\`\` al final.
Después del bloque de código SIEMPRE escribe en una línea separada: INSERTAR:<NombreDelScript>:<DondeVa>
Donde DondeVa puede ser: Workspace, ServerScriptService, StarterPlayerScripts, StarterGui, ReplicatedStorage
Ejemplo: INSERTAR:SpeedScript:ServerScriptService
Sé amigable, da ideas creativas, explica errores claramente. Responde siempre en español.` }]
          },
          contents: messages
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error al responder.";
    
    messages.push({ role: "model", parts: [{ text: reply }] });
    
    res.json({ reply, history: messages });
  } catch (err) {
    res.status(500).json({ reply: "Error del servidor." });
  }
});

app.get("/", (req, res) => res.send("StudioIA Server activo ✅"));

app.listen(3000, () => console.log("StudioIA corriendo en puerto 3000"));
