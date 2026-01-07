# 블로그 자동화 워크플로우 지침서

이 문서는 Notion 콘텐츠를 블로그 포스트로 자동 변환하고 배포하는 전체 프로세스를 정의합니다.

---

## 📋 목차

1. [개요](#개요)
2. [Notion ZIP 파일 처리](#notion-zip-파일-처리)
3. [이미지 최적화](#이미지-최적화)
4. [마크다운 변환 규칙](#마크다운-변환-규칙)
5. [컴포넌트 자동 적용](#컴포넌트-자동-적용)
6. [품질 검증](#품질-검증)
7. [배포 프로세스](#배포-프로세스)

---

## 개요

### 목적
사용자가 Notion에서 내보낸 ZIP 파일을 제공하면, 자동으로 다음을 수행합니다:
1. ZIP 파일 추출 및 콘텐츠 파싱
2. 이미지 최적화 (WebP 변환, 고품질 설정)
3. 마크다운 파일 생성 및 frontmatter 추가
4. Q&A 섹션 자동 변환
5. Git 커밋 및 Vercel 자동 배포

### 기술 스택
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript, React Server Components
- **스타일링**: Tailwind CSS
- **마크다운**: ReactMarkdown + remark-gfm
- **이미지 처리**: Sharp
- **배포**: Vercel (자동)

---

## Notion ZIP 파일 처리

### 1. ZIP 파일 감지 및 추출

**입력 패턴**:
```
사용자: "c:/Users/yongs/Downloads/export-12345.zip"
사용자: "이것도 업로드해줘 [ZIP 파일 경로]"
```

**자동 실행 순서**:

```bash
# 1. 임시 디렉토리 생성
mkdir -p ./temp-notion

# 2. ZIP 파일 추출
unzip -o "c:/Users/yongs/Downloads/export-12345.zip" -d ./temp-notion

# 3. 중첩 ZIP 확인 및 재추출 (Notion은 종종 2단계 ZIP 구조)
cd ./temp-notion
if ls *.zip 1> /dev/null 2>&1; then
  unzip -o *.zip
  rm *.zip
fi

# 4. HTML/Markdown 파일 찾기
find . -name "*.html" -o -name "*.md"
```

### 2. 콘텐츠 파싱

**HTML 파싱** (Notion HTML 내보내기인 경우):
- `<title>` 태그에서 제목 추출
- `<article>` 또는 `<div id="notion-app">` 내부 콘텐츠 추출
- 이미지 경로 수집 (예: `content-123456-0.jpg`)

**Markdown 파싱** (Notion Markdown 내보내기인 경우):
- 첫 번째 `#` 헤딩을 제목으로 추출
- 본문 내용 전체 보존
- 이미지 참조 `![](image.jpg)` 경로 수집

### 3. Slug 생성

```javascript
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')  // 특수문자 제거, 한글 유지
    .replace(/\s+/g, '-')                // 공백을 하이픈으로
    .replace(/-+/g, '-')                 // 연속 하이픈 제거
    .trim();
}
```

**예시**:
- "제미나이 Gems 만들기 및 설정방법 (PC, 모바일)" → `"제미나이-gems-만들기-및-설정방법-pc-모바일"`

---

## 이미지 최적화

### 1. WebP 변환 (필수)

**모든 이미지는 반드시 WebP로 변환합니다.**

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertToWebP(imagePath, slug, imageNumber) {
  const outputFileName = `${slug}-image-${imageNumber}.webp`;
  const outputPath = path.join(__dirname, 'public', 'notion-images', outputFileName);

  await sharp(imagePath)
    .resize(1200, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .webp({ quality: 90 })  // 고품질 설정 (Google 선호)
    .toFile(outputPath);

  // 메타데이터 추출 (width, height)
  const metadata = await sharp(outputPath).metadata();

  // 원본 JPG/PNG 삭제
  fs.unlinkSync(imagePath);

  return {
    fileName: outputFileName,
    width: metadata.width,
    height: metadata.height
  };
}
```

### 2. 이미지 최적화 설정

| 설정 | 값 | 이유 |
|------|-----|------|
| 포맷 | WebP | 파일 크기 40-50% 감소, 브라우저 호환성 우수 |
| 최대 너비 | 1200px | Google은 고품질 이미지 선호, 모바일/데스크톱 모두 대응 |
| Quality | 90 | 눈에 띄는 화질 저하 없이 최적 품질 |
| withoutEnlargement | true | 작은 이미지는 확대하지 않음 |

### 3. 이미지 파일명 규칙

```
입력: content/perplexity-123456-0.jpg
출력: /notion-images/perplexity-ai-pricing-guide-image-1.webp

입력: gemini-gems/screenshot-1.png
출력: /notion-images/gemini-gems-guide-image-1.webp
```

### 4. 마크다운 이미지 참조 업데이트

```markdown
<!-- 변환 전 -->
![이미지 설명](content-123456-0.jpg)

<!-- 변환 후 -->
![이미지 설명](/notion-images/perplexity-ai-pricing-guide-image-1.webp)
```

---

## 마크다운 변환 규칙

### 1. Frontmatter 생성

**모든 블로그 포스트는 다음 frontmatter를 가져야 합니다:**

```yaml
---
title: "제목 (HTML <title> 또는 첫 번째 # 헤딩에서 추출)"
date: "YYYY-MM-DD" (현재 날짜 사용)
excerpt: "첫 번째 문단에서 추출 (최대 160자)"
lightColor: "#0066cc"  (기본값, 또는 랜덤 블루 계열)
darkColor: "#0052a3"   (기본값, lightColor보다 어두운 톤)
---
```

**Excerpt 추출 로직**:
```javascript
function extractExcerpt(content) {
  // 첫 번째 ## 이후 첫 번째 문단 찾기
  const match = content.match(/^##\s+.+\n+(.+?)(?:\n\n|$)/m);
  const firstParagraph = match ? match[1] : content.split('\n\n')[0];

  return firstParagraph.slice(0, 160).trim() + (firstParagraph.length > 160 ? '...' : '');
}
```

### 2. 제목 처리 (중복 제거)

**문제**: Notion에서 `# 제목`과 frontmatter `title: "제목"`이 모두 존재하면 제목이 두 번 렌더링됨

**해결**: `lib/posts.ts`에서 첫 번째 h1 자동 제거

```typescript
// lib/posts.ts 내부
const { data, content } = matter(fileContents);

// 첫 번째 h1 제거
const contentWithoutTitle = content.replace(/^#\s+.+\n*/m, '').trim();

return {
  slug,
  title: data.title || slug,
  content: contentWithoutTitle,  // h1이 제거된 content 사용
  // ...
};
```

### 3. 테이블 렌더링

**필수**: `remark-gfm` 플러그인 사용

```tsx
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {content}
</ReactMarkdown>
```

**테이블 마크다운 예시**:
```markdown
| 구분 | 요금(월) | 요금(연) | 비고 |
|------|----------|----------|------|
| Free | 무료 | 무료 | Pro 검색 일 5회 제한 |
| Pro | $20 | $200 | 파일 업로드 지원 |
```

### 4. 볼드 마크다운 제거 (헤딩에서)

**문제**: `## **핵심 체크리스트**` → 목차에 `**핵심 체크리스트**`로 표시됨

**해결**: 헤딩 파싱 시 `**` 제거

```typescript
// app/[slug]/page.tsx
components={{
  h2: ({ children }) => {
    const text = String(children).replace(/\*\*/g, '');
    const id = generateId(text);
    return <h2 id={id}>{children}</h2>;
  },
  h3: ({ children }) => {
    const text = String(children).replace(/\*\*/g, '');
    const id = generateId(text);
    return <h3 id={id}>{children}</h3>;
  }
}}
```

---

## 컴포넌트 자동 적용

### 1. 목차(TOC) 자동 생성

**조건**: h2, h3 헤딩이 2개 이상 있을 때 자동 생성

**동작**:
- 오른쪽에 sticky positioning (xl 화면 이상에서만 표시)
- 클릭 시 해당 섹션으로 스크롤
- 현재 보고 있는 섹션 하이라이트 (IntersectionObserver)

**구현**: `components/TableOfContents.tsx`

```tsx
<TableOfContents content={post.content} />
```

**헤딩 ID 생성**:
```typescript
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// 예시: "핵심 체크리스트" → "핵심-체크리스트"
```

### 2. Q&A 스니펫 자동 변환

**감지 패턴**:
```markdown
## 자주 묻는 질문(Q&A)

**Q. 질문 내용?**

A. 답변 내용입니다. 여러 줄에 걸쳐 작성될 수 있습니다.

**Q. 또 다른 질문?**

A. 또 다른 답변입니다.
```

**변환 로직**: `lib/qna-utils.ts`

```typescript
export function extractQnA(content: string): QnAItem[] {
  // 1. "## Q&A" 또는 "## 자주 묻는 질문" 섹션 찾기
  // 2. **Q. 로 시작하는 질문 파싱
  // 3. A. 로 시작하는 답변 파싱 (여러 줄 지원)
  // 4. 다음 질문 또는 다음 섹션까지 수집
}

export function removeQnASection(content: string): string {
  // Q&A 섹션을 content에서 제거하여 중복 렌더링 방지
}
```

**렌더링**: `components/QnA.tsx`

```tsx
{qnaItems.length > 0 && (
  <>
    <h2 id="자주-묻는-질문">자주 묻는 질문</h2>
    <QnA items={qnaItems} />
  </>
)}
```

**스타일**:
- `<details>` / `<summary>` 기반 아코디언
- 클릭 시 펼침/접힘
- 화살표(▶) 회전 애니메이션
- 호버 시 배경색 변경

---

## 품질 검증

### 1. 파일 생성 체크리스트

생성된 마크다운 파일이 다음 조건을 만족하는지 확인:

- [ ] `content/posts/{slug}.md` 경로에 생성됨
- [ ] Frontmatter에 title, date, excerpt, lightColor, darkColor 모두 존재
- [ ] 첫 번째 h1 제목이 제거됨 (frontmatter의 title만 사용)
- [ ] 모든 이미지가 WebP로 변환됨
- [ ] 이미지 경로가 `/notion-images/{slug}-image-N.webp` 형식
- [ ] 테이블이 올바른 GFM 형식 (파이프 `|` 구분, 헤더 구분선)
- [ ] Q&A 섹션이 감지되고 제거됨 (별도 컴포넌트로 렌더링)
- [ ] 임시 디렉토리 `./temp-notion` 삭제됨

### 2. 이미지 최적화 체크리스트

- [ ] 모든 이미지가 `.webp` 확장자
- [ ] 원본 JPG/PNG 파일이 삭제됨
- [ ] 이미지 최대 너비 1200px 이하
- [ ] WebP quality 90 설정
- [ ] 파일명이 slug 기반 명명 규칙 준수

### 3. 빌드 테스트

```bash
# 로컬 빌드 테스트
npm run build

# 예상 결과: ✓ Compiled successfully
# 에러 발생 시: 빌드 로그 확인 후 수정
```

### 4. 성능 검증

**목표**: Lighthouse 성능 점수 95+ 유지

**체크 항목**:
- [ ] 시스템 폰트 사용 (웹폰트 로드 없음)
- [ ] 모든 이미지 WebP 포맷
- [ ] hover 효과 최소화 (필요한 곳만)
- [ ] 다크모드 제거 (CSS 복잡도 감소)
- [ ] JavaScript 최소화 (RSC 활용)

---

## 배포 프로세스

### 1. Git 커밋

**자동 실행**:

```bash
# 1. 변경사항 스테이징
git add content/posts/{slug}.md
git add public/notion-images/{slug}-image-*.webp

# 2. 커밋 메시지 생성
git commit -m "Add blog post: {제목}

- Convert Notion export to blog post
- Optimize {N} images to WebP (1200px, quality 90)
- Extract {N} Q&A items to accordion component
- Generate table of contents from {N} headings

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 3. GitHub에 푸시
git push origin main
```

### 2. Vercel 자동 배포

**트리거**: `git push origin main` 실행 시 자동 배포

**배포 시간**: 약 1-2분

**확인 방법**:
1. Vercel 대시보드에서 배포 상태 확인
2. 배포 완료 후 URL 방문하여 포스트 확인
3. Lighthouse 점수 확인 (95+ 목표)

### 3. 배포 완료 메시지

사용자에게 다음 형식으로 결과 보고:

```
✅ Notion ZIP 변환 완료!

📄 파일: content/posts/perplexity-ai-pricing-guide.md
🖼️ 이미지: 0개 (이 글은 이미지 없음)
🔗 Slug: perplexity-ai-pricing-guide
📅 Date: 2025-01-07
❓ Q&A: 5개 항목 추출됨

✓ WebP 변환 완료 (1200px, quality 90)
✓ Frontmatter 생성 완료
✓ 테이블 GFM 형식 적용
✓ Q&A 아코디언 변환
✓ 목차 자동 생성 (6개 헤딩)
✓ 임시 파일 정리 완료

배포 중... (약 1-2분 소요)
완료 후 URL: https://overreacted-test.vercel.app/perplexity-ai-pricing-guide
```

---

## 에러 처리

### 일반적인 에러 및 해결 방법

#### 1. ZIP 파일 추출 실패
```
Error: End of central directory record signature not found
```
**해결**:
- ZIP 파일 경로 확인
- Windows 경로 형식 변환 (`C:\` → `C:/`)
- 파일 손상 여부 확인

#### 2. 중첩 ZIP 감지 실패
```
Warning: No .html or .md files found in extracted directory
```
**해결**:
- `ls -la ./temp-notion` 실행하여 내부 ZIP 파일 확인
- 중첩 ZIP 재추출: `unzip ./temp-notion/*.zip -d ./temp-notion`

#### 3. 이미지 변환 실패 (Windows 파일 잠금)
```
Error: EPERM: operation not permitted
Error: EBUSY: resource busy or locked
```
**해결**:
- 임시 디렉토리 사용: `public/notion-images-temp/`
- 변환 후 복사 방식으로 변경 (이동 대신)
```javascript
await sharp(inputPath).webp().toFile(tempPath);
fs.copyFileSync(tempPath, finalPath);
fs.unlinkSync(tempPath);
```

#### 4. Q&A 파싱 오류
```
Warning: Q&A section detected but no items extracted
```
**해결**:
- `**Q.` 패턴 확인 (볼드 + 마침표 필수)
- `A.` 패턴 확인
- 섹션 헤딩 확인: `## Q&A` 또는 `## 자주 묻는 질문`

#### 5. 빌드 에러 (client/server 경계)
```
Error: Attempted to call extractQnA() from the server
```
**해결**:
- 유틸리티 함수는 `lib/` 디렉토리에 분리
- 클라이언트 컴포넌트는 `"use client"` 지시어 사용
- 서버 컴포넌트에서 클라이언트 함수 호출 금지

---

## 환경 설정

### 필수 패키지

```json
{
  "dependencies": {
    "next": "15.5.9",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.2",
    "remark-gfm": "^4.0.0",
    "gray-matter": "^4.0.3",
    "reading-time": "^1.5.0"
  },
  "devDependencies": {
    "sharp": "^0.33.5",
    "tailwindcss": "^3.4.1",
    "@tailwindcss/typography": "^0.5.10",
    "typescript": "^5.3.3"
  }
}
```

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    optimizePackageImports: ["react-icons", "react-markdown"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};
```

### tailwind.config.ts

```typescript
const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#000000",
            a: { color: "#0066cc", textDecoration: "underline" },
            h1: { color: "#000000", fontWeight: "800" },
            h2: { color: "#000000", fontWeight: "700", marginTop: "2em" },
            h3: { color: "#000000", fontWeight: "600" },
            code: { color: "#000000" },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
```

---

## 성능 최적화 원칙

### 1. Zero JavaScript 우선
- React Server Components 최대 활용
- 클라이언트 컴포넌트는 필수 인터랙션만 (TOC, QnA accordion)

### 2. 폰트 최적화
- **시스템 폰트 사용** (웹폰트 다운로드 제거)
```css
font-family: 'Nanum Gothic', 'Malgun Gothic', 'Apple SD Gothic Neo',
             -apple-system, BlinkMacSystemFont, sans-serif;
```

### 3. CSS 최소화
- **다크모드 제거**: CSS 변수 및 조건부 스타일 제거
- **호버 효과 최소화**: 필수 인터랙션만 유지
- **CSS 변수 제거**: 직접 색상 값 사용

```css
/* 제거됨: CSS 변수 */
/* :root { --bg: #ffffff; } */

/* 직접 사용 */
body { background: #ffffff; color: #000000; }
```

### 4. 이미지 최적화
- WebP 포맷 (40-50% 파일 크기 감소)
- 1200px 최대 너비 (고품질 유지)
- Quality 90 (시각적 품질 우선)

---

## 체크리스트 (전체 프로세스)

### Notion ZIP → 블로그 포스트 변환

- [ ] **1. ZIP 파일 입력 감지**
  - [ ] 파일 경로 정규화 (`C:\` → `C:/`)
  - [ ] 파일 존재 여부 확인

- [ ] **2. ZIP 파일 추출**
  - [ ] `./temp-notion` 디렉토리 생성
  - [ ] ZIP 파일 추출
  - [ ] 중첩 ZIP 확인 및 재추출

- [ ] **3. 콘텐츠 파싱**
  - [ ] HTML 또는 Markdown 파일 찾기
  - [ ] 제목 추출 (`<title>` 또는 `# 헤딩`)
  - [ ] 본문 내용 추출
  - [ ] 이미지 경로 수집

- [ ] **4. Slug 생성**
  - [ ] 제목 → slug 변환 (한글 지원)
  - [ ] URL 안전 문자열 확인

- [ ] **5. 이미지 최적화**
  - [ ] 모든 이미지 WebP 변환 (1200px, quality 90)
  - [ ] `public/notion-images/` 디렉토리에 저장
  - [ ] Slug 기반 파일명으로 변경
  - [ ] 원본 JPG/PNG 삭제
  - [ ] 메타데이터 추출 (width, height)

- [ ] **6. Frontmatter 생성**
  - [ ] title 설정
  - [ ] date 설정 (현재 날짜)
  - [ ] excerpt 추출 (최대 160자)
  - [ ] lightColor, darkColor 설정

- [ ] **7. 마크다운 변환**
  - [ ] 첫 번째 h1 제거 (중복 방지)
  - [ ] 이미지 경로 업데이트 (WebP 경로로)
  - [ ] 테이블 GFM 형식 확인
  - [ ] Q&A 섹션 추출 및 제거

- [ ] **8. 파일 저장**
  - [ ] `content/posts/{slug}.md` 생성
  - [ ] 파일 내용 검증

- [ ] **9. 임시 파일 정리**
  - [ ] `./temp-notion` 디렉토리 삭제
  - [ ] 기타 임시 파일 정리

- [ ] **10. Git 커밋 및 배포**
  - [ ] 변경사항 스테이징
  - [ ] 커밋 메시지 생성 (상세 정보 포함)
  - [ ] GitHub 푸시
  - [ ] Vercel 자동 배포 대기

- [ ] **11. 결과 보고**
  - [ ] 파일 경로 출력
  - [ ] 이미지 개수 및 크기 절감 보고
  - [ ] Q&A 개수 보고
  - [ ] 배포 URL 제공

---

## 예시: 전체 워크플로우 실행

### 입력
```
사용자: "c:/Users/yongs/Downloads/gemini-export.zip 이것도 업로드해줘"
```

### 자동 실행 순서

```bash
# 1. ZIP 추출
mkdir -p ./temp-notion
unzip -o "c:/Users/yongs/Downloads/gemini-export.zip" -d ./temp-notion
cd ./temp-notion && unzip -o *.zip && cd ..

# 2. 파일 탐색
find ./temp-notion -name "*.html"
# 결과: ./temp-notion/제미나이 Gems 만들기.html

# 3. 콘텐츠 파싱
# - 제목: "제미나이 Gems 만들기 및 설정방법 (PC, 모바일)"
# - 이미지: [image-1.jpg, image-2.jpg, image-3.jpg, image-4.jpg]
# - Q&A: 4개 항목

# 4. Slug 생성
# "제미나이-gems-만들기-및-설정방법-pc-모바일"

# 5. 이미지 변환
node convert-images.js
# - image-1.jpg → gemini-gems-guide-image-1.webp (1200px, 90 quality)
# - image-2.jpg → gemini-gems-guide-image-2.webp
# - image-3.jpg → gemini-gems-guide-image-3.webp
# - image-4.jpg → gemini-gems-guide-image-4.webp

# 6. 마크다운 생성
cat > content/posts/gemini-gems-guide.md <<EOF
---
title: "제미나이 Gems 만들기 및 설정방법 (PC, 모바일)"
date: "2025-01-07"
excerpt: "제미나이 Gems로 맞춤형 AI 도구를 만들어 업무 효율을 높이는 방법을 알아봅니다."
lightColor: "#0066cc"
darkColor: "#0052a3"
---

## 요약
[본문 내용...]

![Gems 관리 메뉴](/notion-images/gemini-gems-guide-image-1.webp)
...
EOF

# 7. 임시 파일 정리
rm -rf ./temp-notion

# 8. Git 커밋
git add content/posts/gemini-gems-guide.md
git add public/notion-images/gemini-gems-guide-image-*.webp
git commit -m "Add blog post: 제미나이 Gems 만들기

- Convert Notion export to blog post
- Optimize 4 images to WebP (saved 156KB, 42% reduction)
- Extract 4 Q&A items to accordion component
- Generate table of contents from 6 headings

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin main
```

### 출력 (사용자에게 보고)

```
✅ Notion ZIP 변환 완료!

📄 파일: content/posts/gemini-gems-guide.md
🖼️ 이미지: 4개 변환 (156KB 절감, 42% 감소)
🔗 Slug: gemini-gems-guide
📅 Date: 2025-01-07
❓ Q&A: 4개 항목 추출됨

✓ WebP 변환 완료 (1200px, quality 90)
✓ Frontmatter 생성 완료
✓ 테이블 GFM 형식 적용
✓ Q&A 아코디언 변환
✓ 목차 자동 생성 (6개 헤딩)
✓ 임시 파일 정리 완료

배포 중... Vercel 자동 배포 대기 중 (약 1-2분 소요)
완료 후 URL: https://overreacted-test.vercel.app/gemini-gems-guide
```

---

## 주의사항

### 절대 하지 말아야 할 것

1. **웹폰트 추가 금지**
   - Google Fonts, Adobe Fonts 등 외부 폰트 로드 금지
   - 시스템 폰트만 사용 (성능 우선)

2. **다크모드 재도입 금지**
   - CSS 변수 복잡도 증가
   - 성능 저하 원인
   - 사용자 요청: 흰 배경 + 검정 텍스트 유지

3. **호버 효과 남용 금지**
   - 필수 인터랙션만 적용 (링크, 버튼, 아코디언)
   - 불필요한 transition/transform 제거

4. **이미지 품질 저하 금지**
   - WebP quality는 90 이상 유지
   - 최대 너비 1200px 유지 (800px 이하로 낮추지 않기)

5. **첫 번째 h1 제목 유지 금지**
   - 반드시 `lib/posts.ts`에서 제거
   - Frontmatter의 title만 렌더링

### 반드시 해야 할 것

1. **모든 이미지 WebP 변환**
   - JPG, PNG 원본 삭제 필수
   - 1200px, quality 90 설정 필수

2. **Q&A 자동 변환**
   - `## Q&A` 섹션 감지
   - Accordion 컴포넌트로 변환
   - 원본 섹션 제거

3. **목차 자동 생성**
   - h2, h3 헤딩 추출
   - ID 속성 자동 추가
   - sticky positioning 적용

4. **Git 커밋 메시지 상세화**
   - 변환된 내용 요약
   - 이미지 개수 및 크기 절감 표시
   - Claude Code 서명 포함

5. **빌드 테스트**
   - 배포 전 로컬 빌드 테스트 필수
   - 에러 발생 시 수정 후 재배포

---

## 참고 파일 위치

### 핵심 파일
- **블로그 포스트**: `content/posts/*.md`
- **이미지**: `public/notion-images/*.webp`
- **포스트 파싱**: `lib/posts.ts`
- **Q&A 유틸**: `lib/qna-utils.ts`

### 컴포넌트
- **목차**: `components/TableOfContents.tsx`
- **Q&A**: `components/QnA.tsx`
- **헤더**: `components/Header.tsx`
- **포스트 카드**: `components/PostCard.tsx`

### 페이지
- **홈**: `app/page.tsx`
- **포스트**: `app/[slug]/page.tsx`
- **레이아웃**: `app/layout.tsx`

### 설정
- **Next.js**: `next.config.ts`
- **Tailwind**: `tailwind.config.ts`
- **TypeScript**: `tsconfig.json`
- **Package**: `package.json`

---

## 버전 정보

- **작성일**: 2025-01-07
- **Next.js**: 15.5.9
- **React**: 19.0.0
- **Node.js**: 20.x 이상 권장

---

## 문의 및 수정

이 지침서는 사용자의 요구사항에 따라 지속적으로 업데이트됩니다.

수정 요청이나 새로운 기능 추가 시 이 파일을 업데이트하고 변경 이력을 커밋 메시지에 기록하세요.
