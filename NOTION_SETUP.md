# Notion 자동 동기화 설정 가이드

이 문서는 Notion Database에서 자동으로 블로그 포스트를 가져오는 방법을 설명합니다.

---

## 📋 목차

1. [Notion Database 생성](#1-notion-database-생성)
2. [Notion Integration 설정](#2-notion-integration-설정)
3. [GitHub Secrets 설정](#3-github-secrets-설정)
4. [테스트 및 실행](#4-테스트-및-실행)
5. [사용 방법](#5-사용-방법)
6. [문제 해결](#6-문제-해결)

---

## 1. Notion Database 생성

### 1-1. 새 데이터베이스 페이지 생성

1. Notion에서 새 페이지 생성
2. 페이지 이름: "Blog Posts" (원하는 이름)
3. `/database` 입력 → "Table - Inline" 선택

### 1-2. Database Properties 설정

다음 속성들을 추가하세요:

| Property 이름 | Type | 설명 | 필수 |
|---------------|------|------|------|
| **Title** | Title | 포스트 제목 | ✅ 필수 |
| **Status** | Status | 발행 상태 (Draft, Review, Published) | ✅ 필수 |
| **Date** | Date | 작성일 | ✅ 필수 |
| **Slug** | Text | URL slug (비어있으면 자동 생성) | 선택 |
| **Excerpt** | Text | 포스트 요약 (비어있으면 자동 생성) | 선택 |
| **Tags** | Multi-select | 태그 | 선택 |

### 1-3. Status 옵션 설정

Status 속성에 다음 옵션들을 추가:

- **Draft** (회색) - 작성 중
- **Review** (노란색) - 검토 중
- **Published** (초록색) - 발행됨 ✅

> ⚠️ **중요**: "Published" 상태의 포스트만 자동으로 블로그에 동기화됩니다!

---

## 2. Notion Integration 설정

### 2-1. Integration 생성

1. https://www.notion.so/my-integrations 접속
2. **"+ New integration"** 클릭
3. 설정:
   - **Name**: `Blog Sync` (원하는 이름)
   - **Associated workspace**: 자신의 워크스페이스 선택
   - **Type**: Internal
4. **Capabilities** 설정:
   - ✅ **Read content**
   - ✅ **Read user information** (선택)
   - ❌ Update content (불필요)
   - ❌ Insert content (불필요)
5. **Submit** 클릭

### 2-2. API Key 복사

1. Integration이 생성되면 **"Internal Integration Token"** 표시됨
2. **"Show"** 클릭 후 토큰 복사
3. 형식: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

> 🔒 **보안**: 이 토큰을 절대 공개하지 마세요!

### 2-3. Database에 Integration 연결

1. Blog Posts 데이터베이스 페이지로 이동
2. 우측 상단 **`···`** (More) 클릭
3. **"Connections"** 선택
4. **"Blog Sync"** Integration을 찾아서 연결
5. **"Confirm"** 클릭

---

## 3. GitHub Secrets 설정

### 3-1. Database ID 확인

1. Notion에서 Blog Posts 데이터베이스 페이지 열기
2. 브라우저 URL 확인:
   ```
   https://www.notion.so/{workspace}/{database_id}?v={view_id}
   ```
3. `database_id` 부분 복사 (32자 해시값)
   - 예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 3-2. GitHub Repository Secrets 추가

1. GitHub Repository → **Settings**
2. **Secrets and variables** → **Actions**
3. **"New repository secret"** 클릭

**Secret 1: NOTION_API_KEY**
- Name: `NOTION_API_KEY`
- Value: `secret_xxxxxxxxxxxxxxxx` (2-2에서 복사한 토큰)
- **Add secret** 클릭

**Secret 2: NOTION_DATABASE_ID**
- Name: `NOTION_DATABASE_ID`
- Value: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` (3-1에서 복사한 ID)
- **Add secret** 클릭

---

## 4. 테스트 및 실행

### 4-1. 테스트 포스트 작성

1. Notion Database에 새 행 추가
2. 내용 입력:
   - **Title**: "테스트 포스트"
   - **Status**: **Published** ✅
   - **Date**: 오늘 날짜
   - **Tags**: "테스트"
3. 행을 클릭하여 페이지 열기
4. 본문 작성:
   ```
   ## 소개

   이것은 테스트 포스트입니다.

   ## 내용

   - 항목 1
   - 항목 2
   - 항목 3

   ![이미지 설명](이미지 URL)
   ```

### 4-2. 수동으로 Sync 실행

1. GitHub Repository → **Actions** 탭
2. **"Sync Notion to Blog"** 워크플로우 선택
3. **"Run workflow"** 클릭
4. **"Run workflow"** 확인

### 4-3. 결과 확인

1. Actions 실행 로그 확인
2. 성공 시:
   ```
   ✅ Sync completed! 1 post(s) created/updated
   📊 Summary:
     - 테스트 포스트 (테스트-포스트)
   ```
3. Repository의 `content/posts/` 디렉토리 확인
4. 1-2분 후 Vercel 배포 완료
5. 블로그에서 포스트 확인

---

## 5. 사용 방법

### 일반적인 워크플로우

1. **Notion에서 글 작성**
   - Database에 새 행 추가
   - 페이지 열어서 본문 작성
   - Status는 **Draft**로 유지

2. **검토 및 수정**
   - 필요 시 Status를 **Review**로 변경
   - 내용 확인 및 수정

3. **발행**
   - Status를 **Published**로 변경 ✅
   - 6시간 이내 자동 동기화 대기
   - 또는 GitHub Actions 수동 실행

4. **자동 배포**
   - GitHub Actions가 자동으로 실행
   - 마크다운 변환 + 이미지 최적화
   - Git 커밋 + 푸시
   - Vercel 자동 배포

### 즉시 발행하기 (수동 실행)

기다리지 않고 바로 발행하려면:

1. GitHub → Actions → "Sync Notion to Blog"
2. "Run workflow" 클릭
3. 1-2분 후 배포 완료

### 포스트 수정하기

1. Notion에서 포스트 내용 수정
2. Status가 **Published**인지 확인
3. 다음 자동 동기화 대기 (최대 6시간)
4. 또는 수동 실행으로 즉시 반영

### 포스트 숨기기

1. Status를 **Draft** 또는 **Review**로 변경
2. 다음 동기화 때 블로그에서 제거되지 않음
3. 완전히 삭제하려면 Git에서 수동 삭제 필요

---

## 6. 문제 해결

### Q1. "No new or updated posts found in Notion" 메시지가 나와요

**원인**: Published 상태의 포스트가 없음

**해결**:
1. Notion에서 Status가 **Published**인지 확인
2. Integration이 Database에 연결되었는지 확인
3. Database ID가 올바른지 확인

### Q2. Actions 실행이 실패해요

**가능한 원인**:
1. NOTION_API_KEY가 잘못됨
2. NOTION_DATABASE_ID가 잘못됨
3. Integration이 Database에 연결 안 됨

**해결**:
1. GitHub Secrets 재확인
2. Notion Integration 재생성
3. Database Connection 재설정

### Q3. 이미지가 표시되지 않아요

**원인**: Notion 이미지 URL 만료

**해결**:
1. Notion에 직접 이미지 업로드 (외부 링크 X)
2. Sync 실행 시 자동으로 다운로드 및 WebP 변환
3. 이미지가 `public/notion-images/`에 저장됨

### Q4. 한글 제목이 깨져요

**원인**: 없음 (한글 지원함)

**확인**:
- Slug가 자동 생성됨: "제미나이 가이드" → `"제미나이-가이드"`
- 한글 유지됨

### Q5. 테이블이 제대로 변환되지 않아요

**현재 제한사항**: Notion 테이블 블록은 아직 지원하지 않음

**대안**:
1. 간단한 테이블: Markdown 테이블로 직접 작성
   ```markdown
   | 헤더1 | 헤더2 |
   |-------|-------|
   | 값1   | 값2   |
   ```
2. 복잡한 테이블: 이미지로 캡처하여 삽입

### Q6. 코드 블록이 제대로 표시되지 않아요

**해결**:
- Notion에서 `/code` 사용
- 언어 선택 (JavaScript, Python, etc.)
- 자동으로 마크다운 코드 블록으로 변환됨

---

## 📊 Notion Database 예시

| Title | Status | Date | Slug | Tags | Excerpt |
|-------|--------|------|------|------|---------|
| 제미나이 Gems 가이드 | Published ✅ | 2025-01-07 | gemini-gems-guide | AI, Google | 제미나이 Gems로 맞춤형 AI... |
| ChatGPT 플러스 리뷰 | Draft | 2025-01-08 | | AI, OpenAI | |
| Claude 코딩 팁 | Published ✅ | 2025-01-06 | claude-coding-tips | AI, Coding | Claude를 활용한 효율적인... |
| 노션 자동화 가이드 | Review | 2025-01-05 | | Notion, 자동화 | |

---

## 🎯 자동 동기화 스케줄

- **자동 실행**: 매 6시간마다 (00:00, 06:00, 12:00, 18:00 UTC)
- **한국 시간**: 09:00, 15:00, 21:00, 03:00 KST
- **수동 실행**: 언제든지 GitHub Actions에서 가능

---

## 🔗 참고 링크

- [Notion API 문서](https://developers.notion.com/)
- [Notion Integration 관리](https://www.notion.so/my-integrations)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

---

## 📝 추가 정보

### 지원되는 Notion Block Types

- ✅ Paragraph (문단)
- ✅ Heading 1, 2, 3 (제목)
- ✅ Bulleted list (순서 없는 목록)
- ✅ Numbered list (순서 있는 목록)
- ✅ To-do list (체크리스트)
- ✅ Quote (인용)
- ✅ Code block (코드)
- ✅ Divider (구분선)
- ✅ Image (이미지)
- ✅ Callout (콜아웃)
- ❌ Table (테이블) - 향후 지원 예정
- ❌ Embed (임베드) - 향후 지원 예정

### 이미지 최적화

- **자동 다운로드**: Notion 이미지 URL에서 다운로드
- **WebP 변환**: 모든 이미지 WebP로 변환
- **크기 조정**: 최대 1200px 너비
- **품질**: Quality 90 (고품질)
- **저장 위치**: `public/notion-images/`

---

궁금한 점이 있으면 이슈를 남겨주세요!
