const { google } = require('googleapis');

// 환경변수에서 설정 읽기
const SITE_URL = process.env.SITE_URL || 'https://overreacted-test.vercel.app';
const PUBLISHED_SLUG = process.env.PUBLISHED_SLUG;
const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

async function submitToGoogleIndex(url) {
  if (!GOOGLE_SERVICE_ACCOUNT) {
    console.log('⚠️ GOOGLE_SERVICE_ACCOUNT_JSON이 설정되지 않음. 인덱싱 스킵.');
    return null;
  }

  try {
    // 서비스 계정 인증
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const indexing = google.indexing({ version: 'v3', auth });

    // URL 제출 (URL_UPDATED: 새 페이지 또는 업데이트된 페이지)
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });

    console.log(`✅ Google Indexing API 요청 성공`);
    console.log(`   URL: ${url}`);
    console.log(`   응답:`, response.data);

    return response.data;
  } catch (error) {
    console.error(`❌ Google Indexing API 오류:`, error.message);
    if (error.response) {
      console.error(`   상태 코드: ${error.response.status}`);
      console.error(`   응답:`, error.response.data);
    }
    return null;
  }
}

async function main() {
  console.log('🔍 Google Search Console 인덱싱 시작\n');

  // 메인 페이지 먼저 색인
  console.log('--- 메인 페이지 ---');
  await submitToGoogleIndex(SITE_URL);
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!PUBLISHED_SLUG) {
    console.log('\nℹ️ PUBLISHED_SLUG가 없음. 메인 페이지만 인덱싱 완료.');
    return;
  }

  // slug가 여러 개일 수 있음 (콤마로 구분)
  const slugs = PUBLISHED_SLUG.split(',').filter(s => s.trim());

  if (slugs.length === 0) {
    console.log('\nℹ️ 발행된 글이 없음. 메인 페이지만 인덱싱 완료.');
    return;
  }

  console.log(`\n📄 인덱싱할 글: ${slugs.length}개\n`);

  for (const slug of slugs) {
    const url = `${SITE_URL}/${slug.trim()}`;
    console.log(`\n--- ${slug} ---`);
    await submitToGoogleIndex(url);

    // 여러 개일 경우 API rate limit 방지를 위해 1초 대기
    if (slugs.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n✅ 인덱싱 요청 완료');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
