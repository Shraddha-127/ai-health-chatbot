import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;
const MODEL = "llama3";

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/chatbotDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB Error:", err));

// Schema
const messageSchema = new mongoose.Schema({
  role: String,
  content: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);

// Chat history with system prompt
let chatHistory = [
  {
    role: "system",
    content:
      "You are a helpful AI healthcare assistant. Give simple, clear, and safe health advice. If the problem is serious, suggest consulting a doctor.",
  },
];

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static("."));

// Chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || userMessage.trim() === "") {
    return res.status(400).json({
      reply: "Message is required",
    });
  }

  try {
    console.log("User:", userMessage);

    // Save user message in MongoDB
    await Message.create({
      role: "user",
      content: userMessage,
    });

    // Add user message to chat history
    chatHistory.push({
      role: "user",
      content: userMessage,
    });

    // Limit chat memory
    if (chatHistory.length > 20) {
      chatHistory = [chatHistory[0], ...chatHistory.slice(-19)];
    }

    // Build prompt
    const fullPrompt = chatHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Call Ollama
    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: fullPrompt,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama API error");
    }

    const data = await response.json();

    const botReply =
      data.response || "No response from model";

    console.log("AI:", botReply);

    // Save bot response in MongoDB
    await Message.create({
      role: "assistant",
      content: botReply,
    });

    // Add bot response to chat history
    chatHistory.push({
      role: "assistant",
      content: botReply,
    });

    res.json({
      reply: botReply,
    });
  } catch (error) {
    console.error("Error:", error.message);

    res.status(500).json({
      reply: "Something went wrong. Please try again.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});