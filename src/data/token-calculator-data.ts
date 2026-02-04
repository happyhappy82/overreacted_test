// ─── Provider-specific page data for token calculator sub-pages ───

export interface ProviderPageData {
  slug: string;
  providerKey: string; // key in PROVIDERS object in TokenCalculator.tsx
  title: string;
  metaTitle: string;
  description: string;
  heroSubtitle: string;
  heroDescription: string;
  faqs: { question: string; answer: string }[];
}

export const PROVIDER_PAGES: ProviderPageData[] = [
  {
    slug: "chatgpt",
    providerKey: "openai",
    title: "ChatGPT API 토큰 계산기",
    metaTitle:
      "ChatGPT API 토큰 계산기 — GPT-5, GPT-4.1, o3 비용 계산 | 에이정",
    description:
      "GPT-5.2, GPT-5, GPT-4.1, GPT-4o, o3, o4-mini 등 ChatGPT 모델의 토큰 수와 API 비용을 실시간으로 계산하세요. 무료 ChatGPT 토큰 계산기.",
    heroSubtitle: "ChatGPT 모델 전용 토큰 계산",
    heroDescription:
      "GPT-5.2, GPT-5, GPT-4.1, o3 등 ChatGPT 모든 모델의 토큰 수와 API 비용을 실시간으로 계산하세요.",
    faqs: [
      {
        question: "GPT API 토큰이란 무엇인가요?",
        answer:
          "GPT 토큰은 OpenAI의 GPT 모델이 텍스트를 처리하는 기본 단위입니다. 한국어의 경우 한 글자가 약 1.5~2개의 토큰으로 변환되며, 영어는 한 단어가 약 1~2개의 토큰입니다. OpenAI는 이 토큰 수를 기준으로 API 사용 비용을 산정합니다.",
      },
      {
        question: "GPT-5와 GPT-4.1의 가격 차이는 어떻게 되나요?",
        answer:
          "GPT-5는 입력 $1.25/출력 $10 (1M 토큰당)이고, GPT-4.1은 입력 $2/출력 $8입니다. GPT-5가 입력은 더 저렴하지만 출력은 약간 비쌉니다. 용도에 따라 GPT-5 mini($0.25/$2)나 GPT-4.1 nano($0.1/$0.4) 같은 경량 모델도 고려할 수 있습니다.",
      },
      {
        question: "GPT API 비용을 절약하는 방법이 있나요?",
        answer:
          "프롬프트를 간결하게 작성하고, 불필요한 컨텍스트를 줄이면 입력 토큰을 절약할 수 있습니다. 또한 간단한 작업에는 GPT-5 nano나 GPT-4.1 nano 같은 경량 모델을 사용하면 비용을 크게 줄일 수 있습니다. 출력 배율을 적절히 조절하는 것도 중요합니다.",
      },
      {
        question: "o3와 o4-mini는 GPT 모델과 어떻게 다른가요?",
        answer:
          "o3와 o4-mini는 OpenAI의 추론(reasoning) 특화 모델입니다. 복잡한 수학, 코딩, 논리적 추론 문제에 더 높은 성능을 보이며, 일반 GPT 모델과 다른 가격 구조를 가집니다. o3는 입력 $2/출력 $8, o4-mini는 입력 $1.1/출력 $4.4입니다.",
      },
      {
        question: "GPT 모델의 컨텍스트 윈도우란 무엇인가요?",
        answer:
          "컨텍스트 윈도우는 모델이 한 번에 처리할 수 있는 최대 토큰 수입니다. GPT-5 시리즈는 1M(100만) 토큰, GPT-4o는 128K 토큰을 지원합니다. 컨텍스트가 클수록 긴 문서나 대화 기록을 한 번에 처리할 수 있습니다.",
      },
    ],
  },
  {
    slug: "claude",
    providerKey: "claude",
    title: "Claude API 토큰 계산기",
    metaTitle:
      "Claude API 토큰 계산기 — Opus 4.5, Sonnet 4.5, Haiku 비용 계산 | 에이정",
    description:
      "Claude Opus 4.5, Sonnet 4.5, Haiku 4.5, Opus 4.1 등 Anthropic Claude 모델의 토큰 수와 API 비용을 실시간으로 계산하세요. 무료 Claude 토큰 계산기.",
    heroSubtitle: "Anthropic Claude 모델 전용 토큰 계산",
    heroDescription:
      "Claude Opus 4.5, Sonnet 4.5, Haiku 4.5 등 Anthropic 모든 모델의 토큰 수와 API 비용을 실시간으로 계산하세요.",
    faqs: [
      {
        question: "Claude API 토큰이란 무엇인가요?",
        answer:
          "Claude 토큰은 Anthropic의 Claude 모델이 텍스트를 처리하는 기본 단위입니다. Claude는 자체 토크나이저를 사용하며, 한국어의 경우 한 글자당 약 1.5~2개의 토큰으로 변환됩니다. API 비용은 입력/출력 토큰 수를 기준으로 산정됩니다.",
      },
      {
        question:
          "Claude Opus 4.5와 Sonnet 4.5는 어떤 차이가 있나요?",
        answer:
          "Claude Opus 4.5는 최상위 모델로 복잡한 분석과 창작에 뛰어나며 입력 $5/출력 $25입니다. Sonnet 4.5는 성능과 비용의 균형이 좋은 모델로 입력 $3/출력 $15입니다. 일반적인 업무에는 Sonnet 4.5가, 높은 정확도가 필요한 작업에는 Opus 4.5가 적합합니다.",
      },
      {
        question: "Claude Haiku 4.5는 어떤 용도에 적합한가요?",
        answer:
          "Haiku 4.5는 Claude 모델 중 가장 빠르고 저렴한 모델(입력 $1/출력 $5)입니다. 간단한 질의응답, 텍스트 분류, 요약 등 대량 처리가 필요한 작업에 최적입니다. 200K 컨텍스트 윈도우를 지원하므로 긴 문서도 처리 가능합니다.",
      },
      {
        question: "Claude의 200K 컨텍스트 윈도우는 실제로 얼마나 되나요?",
        answer:
          "200K 토큰은 대략 한국어 기준 약 10만 자, 영어 기준 약 15만 단어에 해당합니다. 일반적인 책 한 권(약 8~10만 자)을 한 번에 입력할 수 있는 수준으로, 긴 계약서나 보고서를 통째로 분석하는 데 활용할 수 있습니다.",
      },
      {
        question: "Claude API 비용을 절약하는 방법이 있나요?",
        answer:
          "작업 복잡도에 따라 모델을 구분하여 사용하세요. 간단한 분류/요약은 Haiku 4.5, 일반 업무는 Sonnet 4.5, 고난도 분석은 Opus 4.5로 나누면 비용을 효과적으로 관리할 수 있습니다. 또한 프롬프트 캐싱을 활용하면 반복 입력 비용을 줄일 수 있습니다.",
      },
    ],
  },
  {
    slug: "gemini",
    providerKey: "gemini",
    title: "Gemini API 토큰 계산기",
    metaTitle:
      "Gemini API 토큰 계산기 — Gemini 2.5 Pro, Flash, 3 Pro 비용 계산 | 에이정",
    description:
      "Gemini 2.5 Pro, 2.5 Flash, 2.0 Flash, 3 Pro Preview 등 Google Gemini 모델의 토큰 수와 API 비용을 실시간으로 계산하세요. 무료 Gemini 토큰 계산기.",
    heroSubtitle: "Google Gemini 모델 전용 토큰 계산",
    heroDescription:
      "Gemini 2.5 Pro, 2.5 Flash, 3 Pro Preview 등 Google 모든 모델의 토큰 수와 API 비용을 실시간으로 계산하세요.",
    faqs: [
      {
        question: "Gemini API 토큰이란 무엇인가요?",
        answer:
          "Gemini 토큰은 Google의 Gemini 모델이 텍스트를 처리하는 기본 단위입니다. Gemini는 SentencePiece 기반 토크나이저를 사용하며, 한국어는 글자당 약 1.5~2개 토큰으로 변환됩니다. Google AI Studio나 Vertex AI를 통해 API를 사용할 때 이 토큰 수로 비용이 산정됩니다.",
      },
      {
        question: "Gemini 2.5 Pro와 2.5 Flash의 차이는 무엇인가요?",
        answer:
          "Gemini 2.5 Pro는 최상위 성능 모델로 복잡한 추론과 분석에 강하며 입력 $1.25/출력 $10입니다. 2.5 Flash는 빠른 응답 속도와 저렴한 비용(입력 $0.3/출력 $2.5)이 장점인 범용 모델입니다. 일반적인 작업에는 Flash, 고난도 작업에는 Pro를 추천합니다.",
      },
      {
        question: "Gemini의 1M 컨텍스트 윈도우는 어떤 장점이 있나요?",
        answer:
          "Gemini의 100만 토큰 컨텍스트 윈도우는 업계 최대 수준입니다. 한국어 기준 약 50만 자, 영어 기준 약 75만 단어를 한 번에 처리할 수 있어, 대규모 코드베이스 분석, 여러 문서 동시 비교, 긴 대화 기록 유지 등에 유리합니다.",
      },
      {
        question: "Gemini Flash-Lite 모델은 어떤 경우에 사용하나요?",
        answer:
          "Flash-Lite는 Gemini 모델 중 가장 저렴한 옵션(2.0 Flash-Lite 기준 입력 $0.075/출력 $0.3)입니다. 대량의 단순 텍스트 처리, 분류, 키워드 추출 등 비용 효율이 중요한 대규모 작업에 적합합니다.",
      },
      {
        question: "Gemini 3 Pro Preview는 무엇인가요?",
        answer:
          "Gemini 3 Pro Preview는 Google의 차세대 모델 프리뷰 버전으로 입력 $2/출력 $12입니다. 기존 2.5 Pro 대비 향상된 추론 능력과 멀티모달 성능을 제공하며, 정식 출시 전 미리 테스트해볼 수 있는 버전입니다.",
      },
    ],
  },
  {
    slug: "perplexity",
    providerKey: "perplexity",
    title: "Perplexity API 토큰 계산기",
    metaTitle:
      "Perplexity API 토큰 계산기 — Sonar Pro, Deep Research 비용 계산 | 에이정",
    description:
      "Perplexity Sonar Pro, Sonar, Sonar Reasoning Pro, Sonar Deep Research 모델의 토큰 수와 API 비용을 실시간으로 계산하세요. 무료 Perplexity 토큰 계산기.",
    heroSubtitle: "Perplexity 모델 전용 토큰 계산",
    heroDescription:
      "Sonar Pro, Sonar Deep Research 등 Perplexity 모든 모델의 토큰 수와 API 비용을 실시간으로 계산하세요.",
    faqs: [
      {
        question: "Perplexity API 토큰이란 무엇인가요?",
        answer:
          "Perplexity 토큰은 Perplexity의 Sonar 모델이 텍스트를 처리하는 기본 단위입니다. Perplexity는 실시간 웹 검색 기반 AI로, 토큰 비용 외에 검색 요청당 추가 비용이 발생할 수 있습니다. API 비용은 입력/출력 토큰 수를 기준으로 산정됩니다.",
      },
      {
        question: "Sonar Pro와 일반 Sonar의 차이는 무엇인가요?",
        answer:
          "Sonar Pro는 더 정확하고 상세한 답변을 제공하는 프리미엄 모델(입력 $3/출력 $15)이며, 200K 컨텍스트를 지원합니다. 일반 Sonar는 빠르고 저렴한 모델(입력 $1/출력 $1)로 127K 컨텍스트를 지원합니다. 간단한 질문에는 Sonar, 깊은 분석에는 Sonar Pro를 추천합니다.",
      },
      {
        question: "Sonar Deep Research는 어떤 용도에 적합한가요?",
        answer:
          "Sonar Deep Research는 복잡한 주제에 대해 여러 소스를 심층 탐색하여 종합적인 답변을 생성하는 모델(입력 $2/출력 $8)입니다. 시장 조사, 학술 리서치, 기술 분석 등 깊이 있는 정보 수집이 필요한 작업에 최적입니다.",
      },
      {
        question: "Sonar Reasoning Pro는 무엇인가요?",
        answer:
          "Sonar Reasoning Pro는 논리적 추론이 강화된 모델(입력 $2/출력 $8)로, 복잡한 비교 분석, 의사결정 지원, 다단계 추론이 필요한 질문에 적합합니다. 128K 컨텍스트 윈도우를 지원합니다.",
      },
      {
        question: "Perplexity API는 다른 AI API와 어떻게 다른가요?",
        answer:
          "Perplexity는 실시간 웹 검색을 기반으로 최신 정보를 제공하는 것이 가장 큰 차별점입니다. GPT나 Claude가 학습 데이터에 기반한 답변을 하는 반면, Perplexity Sonar 모델은 실시간 웹 검색 결과를 종합하여 출처가 명시된 답변을 생성합니다.",
      },
    ],
  },
];

export function getProviderPageBySlug(
  slug: string
): ProviderPageData | undefined {
  return PROVIDER_PAGES.find((p) => p.slug === slug);
}

export function getAllProviderSlugs(): string[] {
  return PROVIDER_PAGES.map((p) => p.slug);
}
