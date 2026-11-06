
import { useEffect, useState } from "react";
import "./App.css";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  duration?: number;
  tokensGenerated?: number;
  tokensPerSecond?: number;
}

interface OllamaResponse {
  response: string;
  total_duration: number;
  eval_count: number;
  eval_duration: number;
}

function App() {
  const [prompt, setPrompt] = useState<string>("");
const [messages, setMessages] = useState<Message[]>(() => {
  try {
    const savedMessages = localStorage.getItem("nova-chat-history");

    return savedMessages
      ? (JSON.parse(savedMessages) as Message[])
      : [];
  } catch {
    return [];
  }
});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
useEffect(() => {
  localStorage.setItem(
    "nova-chat-history",
    JSON.stringify(messages)
  );
}, [messages]);
  const handleSend = async (): Promise<void> => {
    const userPrompt = prompt.trim();

    if (!userPrompt || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: userPrompt,
      sender: "user",
    };

    setMessages((previous) => [...previous, userMessage]);
    setPrompt("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/ollama/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:1b",
          system:
            "You are Nova, a helpful personal AI assistant. The user's name is Siyanda. Be friendly, clear, and helpful.",
          prompt: userPrompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not get a response from Ollama.");
      }

      const data: OllamaResponse = await response.json();

     const aiMessage: Message = {
  id: Date.now() + 1,
  text: data.response,
  sender: "ai",
  duration: data.total_duration / 1_000_000_000,
  tokensGenerated: data.eval_count,
  tokensPerSecond:
    data.eval_duration > 0
      ? data.eval_count / (data.eval_duration / 1_000_000_000)
      : 0,
};

      setMessages((previous) => [...previous, aiMessage]);

      console.log("Total duration:", data.total_duration);
      console.log("Tokens generated:", data.eval_count);
      console.log("Evaluation duration:", data.eval_duration);
    } catch (err) {
      console.error("Ollama error:", err);
      setError(
        "Unable to connect to Nova. Please make sure Ollama is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <span>✦</span>
          <h2>Nova AI</h2>
        </div>

        <button
          className="new-chat-button"
          onClick={() => {
            setMessages([]);
            setError("");
          }}
        >
          + New Chat
        </button>

        <div className="sidebar-bottom">
          <p>Powered by Ollama</p>
          <span>Gemma 3:1b</span>
        </div>
      </aside>

      <main className="chat-container">
        <header className="chat-header">
          <h3>Nova AI</h3>
          <span className="status">
            <span className="status-dot"></span>
            Local AI Assistant
          </span>
        </header>

        <section className="chat-messages">
          {messages.length === 0 && !isLoading ? (
            <div className="welcome-message">
              <div className="welcome-icon">✦</div>
              <h1>How can I help you today?</h1>
              <p>
                I'm Nova, your personal AI assistant.
                Ask me anything and let's explore ideas together.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender}`}
              >
                <strong>
                  {message.sender === "user" ? "You" : "Nova"}
                </strong>
           <p>{message.text}</p>

{message.sender === "ai" && (
  <div className="message-metrics">
    <span>Time: {message.duration?.toFixed(2)}s</span>
    <span>Tokens: {message.tokensGenerated}</span>
    <span>
      Speed: {message.tokensPerSecond?.toFixed(2)} tokens/s
    </span>
  </div>
)}
              </div>
            ))
          )}

          {isLoading && (
            <div className="message ai">
              <strong>Nova</strong>
              <p>Thinking...</p>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
        </section>

        <div className="prompt-area">
          <div className="prompt-container">
            <textarea
              placeholder="Message Nova..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />

            <button
              onClick={() => void handleSend()}
              disabled={!prompt.trim() || isLoading}
              aria-label="Send message"
            >
              ↑
            </button>
          </div>

          <p className="disclaimer">
            Nova AI can make mistakes. Check important information.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
