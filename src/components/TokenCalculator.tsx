import { useState, useMemo, useCallback } from "react";

// ─── Model pricing data (per 1M tokens, USD) ───
interface ModelInfo {
  name: string;
  input: number;
  output: number;
  contextWindow: string;
}

interface ProviderData {
  label: string;
  color: string;
  models: ModelInfo[];
}

const PROVIDERS: Record<string, ProviderData> = {
  openai: {
    label: "ChatGPT",
    color: "#10a37f",
    models: [
      { name: "GPT-5.2", input: 1.75, output: 14, contextWindow: "1M" },
      { name: "GPT-5.1", input: 1.25, output: 10, contextWindow: "1M" },
      { name: "GPT-5", input: 1.25, output: 10, contextWindow: "1M" },
      { name: "GPT-5 mini", input: 0.25, output: 2, contextWindow: "1M" },
      { name: "GPT-5 nano", input: 0.05, output: 0.4, contextWindow: "1M" },
      { name: "GPT-4.1", input: 2, output: 8, contextWindow: "1M" },
      { name: "GPT-4.1 mini", input: 0.4, output: 1.6, contextWindow: "1M" },
      { name: "GPT-4.1 nano", input: 0.1, output: 0.4, contextWindow: "1M" },
      { name: "GPT-4o", input: 2.5, output: 10, contextWindow: "128K" },
      { name: "GPT-4o mini", input: 0.15, output: 0.6, contextWindow: "128K" },
      { name: "o3", input: 2, output: 8, contextWindow: "200K" },
      { name: "o4-mini", input: 1.1, output: 4.4, contextWindow: "200K" },
    ],
  },
  claude: {
    label: "Claude",
    color: "#d97706",
    models: [
      { name: "Claude Opus 4.5", input: 5, output: 25, contextWindow: "200K" },
      { name: "Claude Sonnet 4.5", input: 3, output: 15, contextWindow: "200K" },
      { name: "Claude Haiku 4.5", input: 1, output: 5, contextWindow: "200K" },
      { name: "Claude Opus 4.1", input: 15, output: 75, contextWindow: "200K" },
      { name: "Claude Sonnet 4", input: 3, output: 15, contextWindow: "200K" },
      { name: "Claude Opus 4", input: 15, output: 75, contextWindow: "200K" },
    ],
  },
  gemini: {
    label: "Gemini",
    color: "#4285f4",
    models: [
      { name: "Gemini 2.5 Pro", input: 1.25, output: 10, contextWindow: "1M" },
      { name: "Gemini 2.5 Flash", input: 0.3, output: 2.5, contextWindow: "1M" },
      { name: "Gemini 2.5 Flash-Lite", input: 0.1, output: 0.4, contextWindow: "1M" },
      { name: "Gemini 2.0 Flash", input: 0.1, output: 0.4, contextWindow: "1M" },
      { name: "Gemini 2.0 Flash-Lite", input: 0.075, output: 0.3, contextWindow: "1M" },
      { name: "Gemini 3 Pro Preview", input: 2, output: 12, contextWindow: "1M" },
      { name: "Gemini 3 Flash Preview", input: 0.5, output: 3, contextWindow: "1M" },
    ],
  },
  perplexity: {
    label: "Perplexity",
    color: "#20808d",
    models: [
      { name: "Sonar Pro", input: 3, output: 15, contextWindow: "200K" },
      { name: "Sonar", input: 1, output: 1, contextWindow: "127K" },
      { name: "Sonar Reasoning Pro", input: 2, output: 8, contextWindow: "128K" },
      { name: "Sonar Deep Research", input: 2, output: 8, contextWindow: "128K" },
    ],
  },
};

// ─── Simple token estimator ───
function estimateTokens(text: string): number {
  if (!text) return 0;
  // Korean: ~1.5-2 tokens per character, English: ~0.75 tokens per word
  const koreanChars = (text.match(/[\u3131-\uD79D]/g) || []).length;
  const otherChars = text.length - koreanChars;
  const koreanTokens = koreanChars * 1.7;
  const otherTokens = otherChars * 0.4;
  return Math.ceil(koreanTokens + otherTokens);
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function formatCost(n: number): string {
  if (n < 0.01) return "$" + n.toFixed(4);
  if (n < 1) return "$" + n.toFixed(3);
  return "$" + n.toFixed(2);
}

// ─── Provider slug mapping ───
const PROVIDER_SLUGS: Record<string, string> = {
  openai: "gpt",
  claude: "claude",
  gemini: "gemini",
  perplexity: "perplexity",
};

const SLUG_TO_PROVIDER: Record<string, string> = {
  gpt: "openai",
  claude: "claude",
  gemini: "gemini",
  perplexity: "perplexity",
};

interface TokenCalculatorProps {
  defaultProvider?: string; // provider key (openai, claude, gemini, perplexity)
  useLinks?: boolean; // if true, provider tabs are <a> links to sub-pages
}

// ─── Component ───
export default function TokenCalculator({
  defaultProvider = "openai",
  useLinks = false,
}: TokenCalculatorProps) {
  const [activeProvider, setActiveProvider] = useState(defaultProvider);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [inputText, setInputText] = useState("");
  const [requestCount, setRequestCount] = useState(1);
  const [outputRatio, setOutputRatio] = useState(2);

  const provider = PROVIDERS[activeProvider];
  const model = provider.models[selectedModelIdx];

  const inputTokens = useMemo(() => estimateTokens(inputText), [inputText]);
  const outputTokens = useMemo(() => Math.ceil(inputTokens * outputRatio), [inputTokens, outputRatio]);

  const inputCost = useMemo(
    () => (inputTokens / 1_000_000) * model.input * requestCount,
    [inputTokens, model.input, requestCount]
  );
  const outputCost = useMemo(
    () => (outputTokens / 1_000_000) * model.output * requestCount,
    [outputTokens, model.output, requestCount]
  );
  const totalCost = inputCost + outputCost;

  const handleProviderChange = useCallback(
    (key: string) => {
      setActiveProvider(key);
      setSelectedModelIdx(0);
    },
    []
  );

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Provider Tabs */}
      <div className="flex gap-2 justify-center items-center w-full">
        {Object.entries(PROVIDERS).map(([key, p]) => {
          const isActive = activeProvider === key;
          const commonClass = `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isActive
              ? "text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`;
          const activeStyle = isActive ? { backgroundColor: p.color } : undefined;

          if (useLinks) {
            return (
              <a
                key={key}
                href={`/token-calculator/${PROVIDER_SLUGS[key]}`}
                className={`${commonClass} inline-block`}
                style={activeStyle}
              >
                {p.label}
              </a>
            );
          }

          return (
            <button
              key={key}
              onClick={() => handleProviderChange(key)}
              className={commonClass}
              style={activeStyle}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Model Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          모델 선택
        </label>
        <select
          value={selectedModelIdx}
          onChange={(e) => setSelectedModelIdx(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 focus:ring-2 focus:border-transparent"
          style={{ "--tw-ring-color": provider.color } as React.CSSProperties}
        >
          {provider.models.map((m, i) => (
            <option key={m.name} value={i}>
              {m.name} (컨텍스트: {m.contextWindow})
            </option>
          ))}
        </select>
      </div>

      {/* Pricing Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">입력 단가</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ${model.input}
            <span className="text-xs font-normal text-gray-500"> / 1M tokens</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">출력 단가</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ${model.output}
            <span className="text-xs font-normal text-gray-500"> / 1M tokens</span>
          </p>
        </div>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          프롬프트 텍스트 입력
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="토큰을 계산할 텍스트를 여기에 입력하세요..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:border-transparent resize-none"
          style={{ "--tw-ring-color": provider.color } as React.CSSProperties}
        />
        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatNumber(charCount)}자</span>
          <span>{formatNumber(wordCount)}단어</span>
          <span className="font-semibold" style={{ color: provider.color }}>
            ~{formatNumber(inputTokens)} 토큰
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            총 요청 횟수
          </label>
          <input
            type="number"
            min={1}
            max={100000}
            value={requestCount}
            onChange={(e) => setRequestCount(Math.max(1, Number(e.target.value)))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": provider.color } as React.CSSProperties}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            출력 배율 (입력 대비)
          </label>
          <select
            value={outputRatio}
            onChange={(e) => setOutputRatio(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": provider.color } as React.CSSProperties}
          >
            <option value={0.5}>0.5x (짧은 응답)</option>
            <option value={1}>1x (비슷한 길이)</option>
            <option value={2}>2x (보통 응답)</option>
            <option value={3}>3x (긴 응답)</option>
            <option value={5}>5x (매우 긴 응답)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ backgroundColor: provider.color }}
      >
        <h3 className="text-lg font-bold mb-4 opacity-90">계산 결과</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/15 rounded-xl p-4">
            <p className="text-xs opacity-75 mb-1">입력 토큰</p>
            <p className="text-xl font-bold">{formatNumber(inputTokens * requestCount)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4">
            <p className="text-xs opacity-75 mb-1">출력 토큰 (추정)</p>
            <p className="text-xl font-bold">{formatNumber(outputTokens * requestCount)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4">
            <p className="text-xs opacity-75 mb-1">입력 비용</p>
            <p className="text-xl font-bold">{formatCost(inputCost)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4">
            <p className="text-xs opacity-75 mb-1">출력 비용</p>
            <p className="text-xl font-bold">{formatCost(outputCost)}</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-xl p-5 text-center">
          <p className="text-sm opacity-80 mb-1">총 예상 비용</p>
          <p className="text-3xl font-black">{formatCost(totalCost)}</p>
          <p className="text-xs opacity-60 mt-1">
            ≈ ₩{formatNumber(Math.ceil(totalCost * 1450))} (환율 1,450원 기준)
          </p>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {provider.label} 모델별 비용 비교
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  모델
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  입력 토큰
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  출력 토큰
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  총 비용
                </th>
              </tr>
            </thead>
            <tbody>
              {provider.models.map((m, i) => {
                const ic = (inputTokens / 1_000_000) * m.input * requestCount;
                const oc = (outputTokens / 1_000_000) * m.output * requestCount;
                const tc = ic + oc;
                return (
                  <tr
                    key={m.name}
                    className={`border-t border-gray-200 dark:border-gray-700 ${
                      i === selectedModelIdx
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {m.name}
                      {i === selectedModelIdx && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: provider.color }}>
                          선택됨
                        </span>
                      )}
                    </td>
                    <td className="text-right px-4 py-3 text-gray-600 dark:text-gray-400">
                      {formatNumber(inputTokens * requestCount)}
                    </td>
                    <td className="text-right px-4 py-3 text-gray-600 dark:text-gray-400">
                      {formatNumber(outputTokens * requestCount)}
                    </td>
                    <td className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {formatCost(tc)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
