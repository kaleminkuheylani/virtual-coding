"use client";

import { useState, useRef, useEffect } from "react";

type PlanType = "free" | "starter" | "pro";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIPanelProps {
  plan: PlanType;
}

const SUGGESTIONS = [
  "Bu kodu açıkla",
  "Kodda hata var mı?",
  "Daha optimize yaz",
  "Yorum ekle",
  "TypeScript'e çevir",
];

export function AIPanel({ plan }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Merhaba! Ben AI asistanınızım. Kodunuzla ilgili sorularınızı yanıtlamak veya yardımcı olmak için buradayım. Nasıl yardımcı olabilirim?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Bu kod parçası oldukça temiz görünüyor. Değişken isimlendirmeleri açıklayıcı ve tutarlı. Ancak, hata yönetimi için try-catch blokları eklemeyi düşünebilirsiniz.",
        "Kodunuzda potansiyel bir performans sorunu tespit ettim. Döngü içinde tekrarlayan hesaplamalar var, bunları döngü dışına alabilirsiniz.",
        "Bu fonksiyonu daha modüler hale getirebilirsiniz. Tek sorumluluk prensibine göre, fonksiyonu daha küçük parçalara bölmek kodun okunabilirliğini artıracaktır.",
        "TypeScript tip tanımlamalarınız güzel! Ancak `any` tipi kullanılmış yerleri daha spesifik tiplerle değiştirmek daha güvenli olacaktır.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: randomResponse },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-80 flex-col rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/30">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800/50 px-3 py-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600">
          <svg
            className="h-3.5 w-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-200">AI Asistan</h3>
        <span className="ml-auto rounded-full bg-violet-600/20 px-2 py-0.5 text-[10px] font-medium text-violet-400">
          {plan.toUpperCase()}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1 w-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1 w-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="flex gap-1 overflow-x-auto border-t border-slate-800/50 px-2 py-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => sendMessage(suggestion)}
            className="shrink-0 rounded-full border border-slate-700 bg-slate-800/50 px-2 py-1 text-[10px] text-slate-400 transition hover:border-violet-500 hover:text-violet-300"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-slate-800/50 p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Bir şeyler sor..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
