import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Send,
  Trash2,
  Database,
  Code,
  MessageSquare,
  ChevronRight,
  Search,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  status?: "success" | "error" | "pending";
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sample suggestions for the welcome screen with categories
  const suggestions = [
    { text: "Show all users who signed up last week", category: "Users" },
    {
      text: "Find products with inventory below 10 units",
      category: "Inventory",
    },
    {
      text: "What are the top 5 most ordered products?",
      category: "Analytics",
    },
    { text: "Show transactions over $1000", category: "Transactions" },
    { text: "List tables in the database", category: "Schema" },
    { text: "Find customers with no orders", category: "Relationships" },
  ];

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [question]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const askQuestion = async (text = question) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      role: "user",
      text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setQuestion("");
    setShowWelcome(false);

    try {
      const res = await axios.post(
        "https://nl2sql-backend-zqrg.onrender.com/api/ask/",
        {
          question: text,
          session_id: "frontend-user",
        }
      );

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          text: res.data.answer,
          timestamp: new Date(),
          status: "success",
        },
      ]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          text: "Something went wrong. Please try again.",
          timestamp: new Date(),
          status: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const useSuggestion = (suggestion: string) => {
    askQuestion(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const clearConversation = () => {
    setMessages([]);
    setShowWelcome(true);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header with better branding */}
      <header
        className={`${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b px-6 py-4 flex items-center justify-between shadow-sm`}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
            <Database size={24} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            SQL Assistant
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`${
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 hover:text-gray-700"
            } flex items-center gap-1 text-sm px-3 py-1 rounded-md hover:bg-opacity-10 hover:bg-gray-500`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={clearConversation}
            className={`${
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 hover:text-gray-700"
            } flex items-center gap-1 text-sm px-3 py-1 rounded-md hover:bg-opacity-10 hover:bg-gray-500`}
          >
            <Trash2 size={16} />
            Clear chat
          </button>
        </div>
      </header>

      {/* Main chat area with improved styling */}
      <main
        className={`flex-1 overflow-y-auto p-6 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {showWelcome ? (
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } rounded-xl shadow-md p-6 mb-6 border`}
            >
              <h2
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } mb-2`}
              >
                Welcome to SQL Assistant!
              </h2>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                } mb-6`}
              >
                Ask me anything about your database or try one of these
                examples:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={`p-3 ${
                      theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700 text-gray-200"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    } border rounded-lg text-left hover:border-blue-300 transition-all flex items-start space-x-3`}
                    onClick={() => useSuggestion(suggestion.text)}
                  >
                    <div
                      className={`mt-1 ${
                        theme === "dark" ? "text-blue-400" : "text-blue-500"
                      }`}
                    >
                      <ChevronRight size={16} />
                    </div>
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {suggestion.category}
                      </div>
                      <div>{suggestion.text}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.length === 0 && !showWelcome ? (
            <div className="flex items-center justify-center h-64">
              <div
                className={`text-center ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>No messages yet. Ask something about your database!</p>
              </div>
            </div>
          ) : null}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl p-4 max-w-3xl whitespace-pre-wrap shadow-sm
                  ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border border-gray-200 text-gray-800"
                  }
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    {msg.role === "user" ? (
                      <span className="font-semibold flex items-center">
                        You
                      </span>
                    ) : (
                      <span className="font-semibold flex items-center">
                        <Database size={16} className="mr-1" /> SQL Assistant
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      msg.role === "user"
                        ? "opacity-75"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  className={`${msg.role === "assistant" ? "prose" : ""} ${
                    theme === "dark" && msg.role === "assistant"
                      ? "prose-invert"
                      : ""
                  }`}
                >
                  {msg.text}
                </div>
                {msg.status === "error" && (
                  <div className="flex items-center text-red-500 text-sm mt-2">
                    <AlertTriangle size={14} className="mr-1" /> Error: Unable
                    to process request
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className={`${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white border-gray-200 text-gray-600"
                } rounded-2xl p-4 shadow-sm border flex items-center space-x-3`}
              >
                <Loader size={18} className="animate-spin" />
                <span>Generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Footer with better input design */}
      <footer
        className={`${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-t p-4`}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`relative ${
              theme === "dark" ? "bg-gray-700" : "bg-white"
            } rounded-xl border ${
              isExpanded
                ? "border-blue-400 shadow-md"
                : theme === "dark"
                ? "border-gray-600 shadow-sm"
                : "border-gray-300 shadow-sm"
            } transition-all duration-200`}
          >
            <textarea
              ref={textareaRef}
              className={`w-full p-4 pr-24 resize-none focus:outline-none rounded-xl max-h-36 ${
                theme === "dark"
                  ? "bg-gray-700 text-white placeholder-gray-400"
                  : "bg-white text-gray-700 placeholder-gray-500"
              }`}
              placeholder="Ask about your database..."
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setIsExpanded(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => setIsExpanded(question.length > 0)}
              rows={1}
            />
            <button
              onClick={() => askQuestion()}
              disabled={loading || !question.trim()}
              className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                loading || !question.trim()
                  ? theme === "dark"
                    ? "bg-gray-600 text-gray-400"
                    : "bg-gray-100 text-gray-400"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Press Enter to send • Shift+Enter for new line
            </p>
            <div className="flex items-center">
              <span
                className={`text-xs mr-2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Powered by AI
              </span>
              <Code
                size={14}
                className={theme === "dark" ? "text-gray-400" : "text-gray-500"}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
