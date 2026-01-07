# Notion Export Upload Directory

이 디렉토리는 Notion에서 내보낸 ZIP 파일을 자동으로 블로그 포스트로 변환하는 데 사용됩니다.

## 사용 방법

### 방법 1: GitHub에 직접 업로드

1. Notion에서 페이지를 내보내기 (Export as ZIP)
2. 이 `uploads/` 디렉토리에 ZIP 파일을 업로드
3. Git commit & push
4. GitHub Actions가 자동으로 실행되어 블로그 포스트로 변환

```bash
# 로컬에서 실행 시
cp ~/Downloads/notion-export.zip uploads/
git add uploads/
git commit -m "Add Notion export for conversion"
git push origin main
```

### 방법 2: GitHub Actions 수동 실행

1. GitHub repository의 "Actions" 탭으로 이동
2. "Notion to Blog Post Converter" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. Notion ZIP 파일의 다운로드 가능한 URL 입력
5. (선택) 포스트 제목 입력
6. "Run workflow" 실행

## ZIP 파일 형식

- Notion에서 "Export" 기능 사용
- 형식: HTML 또는 Markdown
- 서브페이지 포함 여부: 상관없음
- 이미지 포함: 권장 (자동으로 WebP로 변환됨)

## 자동 변환 내용

변환 스크립트는 다음을 자동으로 수행합니다:

- ✅ ZIP 파일 추출 (중첩 ZIP 자동 처리)
- ✅ HTML/Markdown 파싱
- ✅ 제목 및 Slug 자동 생성
- ✅ 모든 이미지 WebP 변환 (1200px, quality 90)
- ✅ Frontmatter 자동 생성 (title, date, excerpt, colors)
- ✅ 첫 번째 h1 제목 제거 (중복 방지)
- ✅ 이미지 경로 업데이트
- ✅ `content/posts/{slug}.md` 파일 생성
- ✅ Git 자동 커밋 및 푸시
- ✅ Vercel 자동 배포

## 변환 후

변환이 완료되면:

1. ZIP 파일은 자동으로 삭제됩니다
2. 생성된 마크다운 파일은 `content/posts/` 디렉토리에 저장됩니다
3. 변환된 이미지는 `public/notion-images/` 디렉토리에 저장됩니다
4. Vercel이 자동으로 배포합니다 (약 1-2분 소요)

## 주의사항

- 대용량 ZIP 파일(100MB 이상)은 처리 시간이 오래 걸릴 수 있습니다
- 이미지가 많은 경우 변환 시간이 증가합니다
- 같은 제목의 포스트가 이미 존재하면 덮어씌워집니다

## 문제 해결

변환이 실패한 경우:

1. GitHub Actions 로그 확인
2. ZIP 파일 형식 확인 (Notion 내보내기인지)
3. ZIP 파일 손상 여부 확인
4. 이미지 파일 형식 확인 (JPG, PNG, GIF 지원)

더 자세한 내용은 `.claude/AUTOMATION_INSTRUCTIONS.md`를 참조하세요.
