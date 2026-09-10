import { useMemo, useRef, useState } from "react";
import { Bot, SendHorizonal, Sparkles, X } from "lucide-react";
import "./SchemeAIChatbot.css";

const defaultPrompts = [
  "Why was this scheme recommended?",
  "Why am I not fully eligible?",
  "What information is missing?",
  "Explain my match score.",
  "What documents should I prepare?",
  "What should I do next?",
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatSentence(text) {
  if (!text) {
    return "This information is not available in the current scheme data and should be verified through official sources.";
  }

  return String(text).trim();
}

function buildUserContext(profile = {}, recommendations = [], selectedScheme = {}, schemes = [], supportPath = null) {
  const recommendationList = safeArray(recommendations).slice(0, 5).map((scheme) => ({
    id: scheme?.id || scheme?.name || "scheme",
    name: scheme?.name || scheme?.title || "Scheme",
    score: Number(scheme?.score || 0),
    scoreBreakdown: scheme?.scoreBreakdown || {},
    eligibleReasons: safeArray(scheme?.eligibleReasons),
    concerns: safeArray(scheme?.concerns),
    missingInformation: safeArray(scheme?.missingInformation),
    nextSteps: safeArray(scheme?.nextSteps),
    requiredDocuments: safeArray(scheme?.requiredDocuments),
  }));

  const selected = selectedScheme && Object.keys(selectedScheme).length
    ? {
        id: selectedScheme?.id || selectedScheme?.name || "selected-scheme",
        name: selectedScheme?.name || selectedScheme?.title || "Selected scheme",
        score: Number(selectedScheme?.score || 0),
        scoreBreakdown: selectedScheme?.scoreBreakdown || {},
        eligibleReasons: safeArray(selectedScheme?.eligibleReasons),
        concerns: safeArray(selectedScheme?.concerns),
        missingInformation: safeArray(selectedScheme?.missingInformation),
        nextSteps: safeArray(selectedScheme?.nextSteps),
        requiredDocuments: safeArray(selectedScheme?.requiredDocuments),
      }
    : recommendationList[0] || null;

  return {
    profile: {
      name: profile?.name || "",
      age: profile?.age || profile?.dateOfBirth || "",
      annualIncome: profile?.annualIncome || profile?.income || "",
      category: profile?.category || "",
      education: profile?.education || "",
      occupation: profile?.occupation || "",
      state: profile?.state || "",
      projectType: profile?.projectType || "",
      purpose: profile?.purpose || "",
    },
    recommendations: recommendationList,
    selectedScheme: selected,
    schemesCount: Array.isArray(schemes) ? schemes.length : 0,
    supportPath: supportPath && typeof supportPath === "object" ? {
      currentSituation: supportPath.currentSituation || "",
      goal: supportPath.goal || "",
      requiredSupport: safeArray(supportPath.requiredSupport),
      steps: safeArray(supportPath.steps),
    } : null,
  };
}

function SchemeAIChatbot({ profile = {}, recommendations = [], schemes = [], selectedScheme = null, supportPath = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "I can explain your scheme matches, missing information, and likely next steps. Ask me about a recommendation or your overall fit.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const bottomRef = useRef(null);

  const context = useMemo(
    () => buildUserContext(profile, recommendations, selectedScheme, schemes, supportPath),
    [profile, recommendations, selectedScheme, schemes, supportPath],
  );

  const submitPrompt = async (promptText) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setLastQuestion(trimmed);
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          userContext: context,
          recommendations: context.recommendations,
          selectedScheme: context.selectedScheme,
          supportPath: context.supportPath,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to get AI guidance right now. Please try again.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: formatSentence(data.message),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: error?.message || "Unable to get AI guidance right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitPrompt(input);
  };

  const handlePromptClick = async (promptText) => {
    await submitPrompt(promptText);
  };

  const hasQuestion = Boolean(lastQuestion);

  return (
    <div className="scheme-ai-chatbot">
      <button
        type="button"
        className="chat-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open Scheme Sathi AI assistant"
      >
        <Sparkles size={18} />
        <span>Ask Scheme Sathi AI</span>
      </button>

      {isOpen && (
        <div className="chat-panel" role="dialog" aria-label="Scheme Sathi AI assistant">
          <div className="chat-header">
            <div className="chat-title-wrap">
              <div className="chat-icon"><Bot size={16} /></div>
              <div>
                <h3>Scheme Sathi AI</h3>
                <p>Your scheme guidance assistant</p>
              </div>
            </div>
            <button type="button" className="close-chat" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={17} />
            </button>
          </div>

          <div className="chat-suggestions">
            {defaultPrompts.map((prompt) => (
              <button key={prompt} type="button" className="suggestion-pill" onClick={() => handlePromptClick(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="chat-messages" ref={bottomRef}>
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.role}`}>
                {message.text}
              </div>
            ))}
            {isLoading && <div className="chat-message assistant typing">Thinking...</div>}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your schemes..."
              aria-label="Ask about your schemes"
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <SendHorizonal size={16} />
              Send
            </button>
          </form>

          {hasQuestion && (
            <div className="chat-context-note">
              Context: {context.recommendations.length} recommendation(s) available, {context.schemesCount} scheme(s) loaded.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SchemeAIChatbot;
