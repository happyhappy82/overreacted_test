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
    notion_id: pageId,
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

// 특정 페이지 업데이트 (notion_id로 기존 파일 찾아서 교체)
async function updatePage(pageId) {
  console.log(`📝 Updating page: ${pageId}\n`);

  const outputDir = path.join(__dirname, '..', 'content', 'posts');

  // 먼저 기존 파일 찾아서 삭제 (제목이 바뀌었을 수 있으므로)
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const filePath = path.join(outputDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);

    if (data.notion_id === pageId) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Removed old file: content/posts/${file}`);
      break;
    }
  }

  // 새로 변환해서 저장
  const page = await notion.pages.retrieve({ page_id: pageId });
  const result = await convertPageToMarkdown(page);

  if (result) {
    const filePath = path.join(outputDir, `${result.slug}.md`);
    fs.writeFileSync(filePath, result.content, 'utf8');
    console.log(`✅ Updated: content/posts/${result.slug}.md`);
    return result;
  }
  return null;
}

// 특정 페이지 삭제 (notion_id로 파일 찾기)
async function deletePage(pageId) {
  console.log(`🗑️ Deleting page: ${pageId}\n`);

  const outputDir = path.join(__dirname, '..', 'content', 'posts');

  // 모든 md 파일에서 notion_id가 일치하는 파일 찾기
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(outputDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);

    if (data.notion_id === pageId) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: content/posts/${file}`);
      return { slug: file.replace('.md', ''), title: data.title };
    }
  }

  // notion_id로 못 찾으면 slug로 시도 (fallback)
  console.log(`⚠️ No file found with notion_id: ${pageId}`);
  console.log(`Trying to find by slug from Notion...`);

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const properties = page.properties;
    const title = properties.Title?.title?.[0]?.plain_text || 'Untitled';
    const slug = properties.Slug?.rich_text?.[0]?.plain_text || generateSlug(title);
    const filePath = path.join(outputDir, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted (by slug): content/posts/${slug}.md`);
      return { slug, title };
    }
  } catch (error) {
    console.log(`Could not retrieve page from Notion: ${error.message}`);
  }

  console.log(`❌ File not found for page_id: ${pageId}`);
  return null;
}

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

  // 웹훅에서 전달받은 action과 page_id
  const action = process.env.SYNC_ACTION || 'sync';
  const pageId = process.env.SYNC_PAGE_ID;

  console.log(`Action: ${action}`);
  if (pageId) console.log(`Page ID: ${pageId}`);
  console.log('');

  try {
    // action별 처리
    if (action === 'update' && pageId) {
      await updatePage(pageId);
      return;
    }

    if (action === 'delete' && pageId) {
      await deletePage(pageId);
      return;
    }

    // 기본 동작: 새 글 동기화 (create 또는 sync)
    // 현재 시간 (ISO 형식)
    const now = new Date().toISOString();
    console.log(`Current time: ${now}\n`);

    // Published 상태이면서 예약 시간이 현재 이전인 페이지만 가져오기
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Status',
            status: {
              equals: 'Published'
            }
          },
          {
            property: 'Date',
            date: {
              on_or_before: now
            }
          }
        ]
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending'
        }
      ]
    });

    console.log(`Found ${response.results.length} published page(s) with past date\n`);

    if (response.results.length === 0) {
      console.log('✅ No new posts to publish');
      return;
    }

    const outputDir = path.join(__dirname, '..', 'content', 'posts');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 각 페이지 변환 (이미 존재하는 파일은 스킵)
    const results = [];
    for (const page of response.results) {
      try {
        // 먼저 slug 계산해서 파일 존재 여부 확인
        const properties = page.properties;
        const title = properties.Title?.title?.[0]?.plain_text || 'Untitled';
        const slug = properties.Slug?.rich_text?.[0]?.plain_text || generateSlug(title);
        const filePath = path.join(outputDir, `${slug}.md`);

        // 이미 파일이 존재하면 스킵
        if (fs.existsSync(filePath)) {
          console.log(`⏭️ Skipping "${title}" (already exists: ${slug}.md)`);
          continue;
        }

        const result = await convertPageToMarkdown(page);

        if (result) {
          // 파일 저장
          const finalPath = path.join(outputDir, `${result.slug}.md`);
          fs.writeFileSync(finalPath, result.content, 'utf8');

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
