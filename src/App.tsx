
import { useState } from "react";
import "./App.css";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}

function App() {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = (): void => {
    if (!prompt.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: prompt.trim(),
      sender: "user",
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setPrompt("");
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <span>✦</span>
          <h2>Nova AI</h2>
        </div>

        <button className="new-chat-button">
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
          {messages.length === 0 ? (
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
              </div>
            ))
          )}
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
                  handleSend();
                }
              }}
            />

            <button
              onClick={handleSend}
              disabled={!prompt.trim()}
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
