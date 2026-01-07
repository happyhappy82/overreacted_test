const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');
const matter = require('gray-matter');

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 디버그: Notion Client 확인
console.log('Notion Client initialized:', !!notion);
console.log('Notion Client has databases:', !!notion.databases);
console.log('Notion Client has databases.query:', typeof notion.databases?.query);

// ===========================
// 유틸리티 함수
// ===========================

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function convertImageToWebP(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1200, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .webp({ quality: 90 })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();

  // 원본 삭제
  if (inputPath !== outputPath) {
    fs.unlinkSync(inputPath);
  }

  return {
    width: metadata.width,
    height: metadata.height,
    size: fs.statSync(outputPath).size
  };
}

// ===========================
// Notion Block → Markdown 변환
// ===========================

async function blockToMarkdown(block, slug, imageCounter) {
  const { type } = block;

  try {
    switch (type) {
      case 'paragraph':
        return richTextToMarkdown(block.paragraph.rich_text) + '\n\n';

      case 'heading_1':
        return '# ' + richTextToMarkdown(block.heading_1.rich_text) + '\n\n';

      case 'heading_2':
        return '## ' + richTextToMarkdown(block.heading_2.rich_text) + '\n\n';

      case 'heading_3':
        return '### ' + richTextToMarkdown(block.heading_3.rich_text) + '\n\n';

      case 'bulleted_list_item':
        return '- ' + richTextToMarkdown(block.bulleted_list_item.rich_text) + '\n';

      case 'numbered_list_item':
        return '1. ' + richTextToMarkdown(block.numbered_list_item.rich_text) + '\n';

      case 'to_do':
        const checked = block.to_do.checked ? 'x' : ' ';
        return `- [${checked}] ` + richTextToMarkdown(block.to_do.rich_text) + '\n';

      case 'quote':
        return '> ' + richTextToMarkdown(block.quote.rich_text) + '\n\n';

      case 'code':
        const language = block.code.language || '';
        const code = richTextToMarkdown(block.code.rich_text);
        return '```' + language + '\n' + code + '\n```\n\n';

      case 'divider':
        return '---\n\n';

      case 'image':
        const imageUrl = block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url;

        const caption = block.image.caption.length > 0
          ? richTextToMarkdown(block.image.caption)
          : 'Image';

        // 이미지 다운로드 및 WebP 변환
        const imageResult = await downloadAndConvertNotionImage(
          imageUrl,
          slug,
          imageCounter.value++
        );

        return `![${caption}](${imageResult.path})\n\n`;

      case 'table':
        // 테이블은 children blocks를 가져와야 함
        return ''; // 별도 처리 필요

      case 'callout':
        const emoji = block.callout.icon?.emoji || '💡';
        return `${emoji} **` + richTextToMarkdown(block.callout.rich_text) + '**\n\n';

      default:
        console.log(`Unsupported block type: ${type}`);
        return '';
    }
  } catch (error) {
    console.error(`Error converting block type ${type}:`, error.message);
    return '';
  }
}

function richTextToMarkdown(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return '';

  return richTextArray.map(text => {
    let content = text.plain_text;

    if (text.annotations.bold) content = `**${content}**`;
    if (text.annotations.italic) content = `*${content}*`;
    if (text.annotations.code) content = `\`${content}\``;
    if (text.annotations.strikethrough) content = `~~${content}~~`;

    if (text.href) {
      content = `[${content}](${text.href})`;
    }

    return content;
  }).join('');
}

async function downloadAndConvertNotionImage(url, slug, imageNumber) {
  const imagesDir = path.join(__dirname, '..', 'public', 'notion-images');

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 임시 다운로드 (원본 형식)
  const tempPath = path.join(imagesDir, `temp-${Date.now()}.jpg`);
  const finalFileName = `${slug}-image-${imageNumber}.webp`;
  const finalPath = path.join(imagesDir, finalFileName);

  try {
    // Notion 이미지 URL에서 다운로드
    await downloadImage(url, tempPath);

    // WebP 변환
    await convertImageToWebP(tempPath, finalPath);

    return {
      path: `/notion-images/${finalFileName}`,
      fileName: finalFileName
    };
  } catch (error) {
    console.error('Image download/conversion failed:', error.message);
    // 임시 파일 정리
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return {
      path: url, // fallback to original URL
      fileName: ''
    };
  }
}

// ===========================
// Notion Page 처리
// ===========================

async function getPageBlocks(pageId) {
  const blocks = [];
  let cursor;

  while (true) {
    const { results, next_cursor } = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });

    blocks.push(...results);

    if (!next_cursor) break;
    cursor = next_cursor;
  }

  return blocks;
}

async function convertPageToMarkdown(page) {
  const pageId = page.id;
  const properties = page.properties;

  // Properties 추출
  const title = properties.Title?.title?.[0]?.plain_text || 'Untitled';
  const status = properties.Status?.status?.name || 'Draft';
  const dateValue = properties.Date?.date?.start || new Date().toISOString().split('T')[0];
  const tags = properties.Tags?.multi_select?.map(tag => tag.name) || [];
  const excerptProp = properties.Excerpt?.rich_text?.[0]?.plain_text || '';

  // Published 상태가 아니면 스킵
  if (status !== 'Published') {
    console.log(`Skipping "${title}" (Status: ${status})`);
    return null;
  }

  console.log(`\n=== Processing: ${title} ===`);
  console.log(`Date: ${dateValue}`);
  console.log(`Tags: ${tags.join(', ')}`);

  // Slug 생성
  const slug = properties.Slug?.rich_text?.[0]?.plain_text || generateSlug(title);

  // 페이지 블록 가져오기
  const blocks = await getPageBlocks(pageId);

  // Markdown 변환
  const imageCounter = { value: 1 };
  let markdown = '';

  for (const block of blocks) {
    const md = await blockToMarkdown(block, slug, imageCounter);
    markdown += md;
  }

  // Excerpt 생성 (없으면 첫 문단에서 추출)
  let excerpt = excerptProp;
  if (!excerpt) {
    const firstParagraph = markdown.split('\n\n')[0];
    excerpt = firstParagraph.slice(0, 160).trim() + (firstParagraph.length > 160 ? '...' : '');
  }

  // Frontmatter 생성
  const frontmatter = {
    title,
    date: dateValue,
    excerpt,
    lightColor: '#0066cc',
    darkColor: '#0052a3',
  };

  if (tags.length > 0) {
    frontmatter.tags = tags;
  }

  // 첫 번째 h1 제거 (중복 방지)
  markdown = markdown.replace(/^#\s+.+\n*/m, '').trim();

  // 마크다운 파일 생성
  const fullContent = matter.stringify(markdown, frontmatter);

  return {
    slug,
    content: fullContent,
    title,
    imageCount: imageCounter.value - 1,
  };
}

// ===========================
// 메인 동기화 로직
// ===========================

async function syncNotion() {
  console.log('🔄 Starting Notion sync...\n');

  if (!DATABASE_ID) {
    console.error('❌ NOTION_DATABASE_ID is not set');
    process.exit(1);
  }

  if (!process.env.NOTION_API_KEY) {
    console.error('❌ NOTION_API_KEY is not set');
    process.exit(1);
  }

  try {
    // Published 상태의 페이지만 가져오기
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Status',
        status: {
          equals: 'Published'
        }
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending'
        }
      ]
    });

    console.log(`Found ${response.results.length} published page(s)\n`);

    if (response.results.length === 0) {
      console.log('✅ No new posts to publish');
      return;
    }

    const outputDir = path.join(__dirname, '..', 'content', 'posts');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 각 페이지 변환
    const results = [];
    for (const page of response.results) {
      try {
        const result = await convertPageToMarkdown(page);

        if (result) {
          // 파일 저장
          const filePath = path.join(outputDir, `${result.slug}.md`);
          fs.writeFileSync(filePath, result.content, 'utf8');

          console.log(`✅ Created: content/posts/${result.slug}.md`);
          console.log(`   Images: ${result.imageCount}`);

          results.push(result);
        }
      } catch (error) {
        console.error(`❌ Failed to convert page:`, error.message);
        console.error(error.stack);
      }
    }

    console.log(`\n✅ Sync completed! ${results.length} post(s) created/updated`);

    // 결과 요약 출력
    if (results.length > 0) {
      console.log('\n📊 Summary:');
      results.forEach(r => {
        console.log(`  - ${r.title} (${r.slug})`);
      });
    }

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ===========================
// 실행
// ===========================

syncNotion().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
