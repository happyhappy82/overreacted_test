# Technical Specification

# 🛠️ Technical Specification: High-Performance Blog

## 1. Overview
댄 아브라모프의 `overreacted.io`를 벤치마킹하여, 극도의 로딩 속도와 사용자 경험을 제공하는 블로그 엔진을 구축한다.

## 2. Tech Stack
* **Framework:** Next.js (App Router)
* **Rendering:** Static Site Generation (SSG) via React Server Components
* **Styling:** Tailwind CSS (Zero-runtime CSS)
* **Content:** MDX (Markdown with React Components)
* **Deployment:** Vercel (Edge Network)

## 3. Key Constraints & Goals
* **Performance:** Lighthouse Performance Score 100/100.
* **Bundle Size:** 클라이언트 측 JS를 최소화하며, 인터랙션이 없는 페이지는 Zero-JS로 서빙한다.
* **Typography:** 시스템 폰트 스택을 활용하거나 `next/font`를 통해 레이아웃 시프트(CLS)를 원천 차단한다.
* **Color System:** `lab()` 컬러 함수를 참고한 부드러운 다크모드 전환을 지원한다.

## 4. Architecture Details
* **Data Fetching:** 빌드 타임에 모든 게시물을 읽어 정적 HTML로 생성.
* **Images:** `next/image`를 사용하여 WebP/Avif 포맷 및 Lazy Loading 강제 적용.
* **Caching:** 모든 정적 자산에 대해 강력한 캐싱 전략 적용.