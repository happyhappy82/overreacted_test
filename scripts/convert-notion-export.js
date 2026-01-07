const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');
const matter = require('gray-matter');

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

function extractTitle(content, isHtml) {
  if (isHtml) {
    const titleMatch = content.match(/<title>(.+?)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : 'Untitled';
  } else {
    const h1Match = content.match(/^#\s+(.+)$/m);
    return h1Match ? h1Match[1].trim() : 'Untitled';
  }
}

function extractExcerpt(content) {
  // 첫 번째 ## 이후 첫 번째 문단 찾기
  const match = content.match(/^##\s+.+\n+(.+?)(?:\n\n|$)/m);
  const firstParagraph = match ? match[1] : content.split('\n\n')[0];

  return firstParagraph.slice(0, 160).trim() + (firstParagraph.length > 160 ? '...' : '');
}

function htmlToMarkdown(html) {
  // 간단한 HTML → Markdown 변환
  let md = html;

  // 제목 변환
  md = md.replace(/<h1[^>]*>(.+?)<\/h1>/gi, '# $1');
  md = md.replace(/<h2[^>]*>(.+?)<\/h2>/gi, '## $1');
  md = md.replace(/<h3[^>]*>(.+?)<\/h3>/gi, '### $1');

  // 문단
  md = md.replace(/<p[^>]*>(.+?)<\/p>/gi, '$1\n\n');

  // 리스트
  md = md.replace(/<li[^>]*>(.+?)<\/li>/gi, '- $1\n');

  // 볼드/이탤릭
  md = md.replace(/<strong[^>]*>(.+?)<\/strong>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.+?)<\/em>/gi, '*$1*');

  // 이미지
  md = md.replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');

  // 링크
  md = md.replace(/<a[^>]*href="([^"]+)"[^>]*>(.+?)<\/a>/gi, '[$2]($1)');

  // HTML 태그 제거
  md = md.replace(/<[^>]+>/g, '');

  // 연속 빈 줄 정리
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

// ===========================
// 이미지 변환
// ===========================

async function convertImagesToWebP(imagesDir, slug, outputDir) {
  if (!fs.existsSync(imagesDir)) {
    console.log('No images directory found');
    return [];
  }

  const imageFiles = fs.readdirSync(imagesDir).filter(file =>
    /\.(jpg|jpeg|png|gif)$/i.test(file)
  );

  if (imageFiles.length === 0) {
    console.log('No images to convert');
    return [];
  }

  console.log(`Converting ${imageFiles.length} images to WebP...`);

  const conversions = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const inputPath = path.join(imagesDir, imageFiles[i]);
    const outputFileName = `${slug}-image-${i + 1}.webp`;
    const outputPath = path.join(outputDir, outputFileName);

    try {
      await sharp(inputPath)
        .resize(1200, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 90 })
        .toFile(outputPath);

      const metadata = await sharp(outputPath).metadata();

      conversions.push({
        original: imageFiles[i],
        converted: outputFileName,
        width: metadata.width,
        height: metadata.height,
        size: fs.statSync(outputPath).size
      });

      console.log(`✓ ${imageFiles[i]} → ${outputFileName} (${metadata.width}x${metadata.height})`);
    } catch (error) {
      console.error(`✗ Failed to convert ${imageFiles[i]}:`, error.message);
    }
  }

  return conversions;
}

// ===========================
// 메인 변환 로직
// ===========================

async function convertNotionExport() {
  const tempUploadsDir = path.join(__dirname, '..', 'temp-uploads');
  const tempNotionDir = path.join(__dirname, '..', 'temp-notion');
  const outputDir = path.join(__dirname, '..', 'content', 'posts');
  const imagesOutputDir = path.join(__dirname, '..', 'public', 'notion-images');

  // 디렉토리 생성
  if (!fs.existsSync(tempNotionDir)) {
    fs.mkdirSync(tempNotionDir, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(imagesOutputDir)) {
    fs.mkdirSync(imagesOutputDir, { recursive: true });
  }

  // ZIP 파일 찾기
  const zipFiles = fs.readdirSync(tempUploadsDir).filter(f => f.endsWith('.zip'));

  if (zipFiles.length === 0) {
    console.error('No ZIP files found in temp-uploads/');
    process.exit(1);
  }

  console.log(`Found ${zipFiles.length} ZIP file(s)`);

  for (const zipFile of zipFiles) {
    const zipPath = path.join(tempUploadsDir, zipFile);

    console.log(`\n=== Processing ${zipFile} ===`);

    // ZIP 추출
    console.log('Extracting ZIP...');
    try {
      execSync(`unzip -o "${zipPath}" -d "${tempNotionDir}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to extract ZIP:', error.message);
      continue;
    }

    // 중첩 ZIP 확인 및 재추출
    const nestedZips = fs.readdirSync(tempNotionDir).filter(f => f.endsWith('.zip'));
    if (nestedZips.length > 0) {
      console.log('Found nested ZIP, extracting...');
      for (const nestedZip of nestedZips) {
        const nestedZipPath = path.join(tempNotionDir, nestedZip);
        execSync(`unzip -o "${nestedZipPath}" -d "${tempNotionDir}"`, { stdio: 'inherit' });
        fs.unlinkSync(nestedZipPath);
      }
    }

    // HTML 또는 Markdown 파일 찾기
    const files = fs.readdirSync(tempNotionDir);
    const htmlFile = files.find(f => f.endsWith('.html'));
    const mdFile = files.find(f => f.endsWith('.md'));

    const contentFile = htmlFile || mdFile;

    if (!contentFile) {
      console.error('No HTML or Markdown file found in ZIP');
      continue;
    }

    const isHtml = contentFile.endsWith('.html');
    const contentPath = path.join(tempNotionDir, contentFile);
    let content = fs.readFileSync(contentPath, 'utf8');

    console.log(`Found content file: ${contentFile} (${isHtml ? 'HTML' : 'Markdown'})`);

    // HTML을 Markdown으로 변환
    if (isHtml) {
      content = htmlToMarkdown(content);
    }

    // 제목 추출
    const title = extractTitle(content, false);
    const slug = generateSlug(title);

    console.log(`Title: ${title}`);
    console.log(`Slug: ${slug}`);

    // Excerpt 추출
    const excerpt = extractExcerpt(content);

    // 이미지 변환
    const conversions = await convertImagesToWebP(tempNotionDir, slug, imagesOutputDir);

    // 이미지 경로 업데이트
    let updatedContent = content;
    conversions.forEach((conv, index) => {
      const imageNumber = index + 1;
      // 다양한 이미지 참조 패턴 대응
      const patterns = [
        new RegExp(`!\\[([^\\]]*)\\]\\(${conv.original}\\)`, 'g'),
        new RegExp(`!\\[([^\\]]*)\\]\\([^)]*${conv.original.replace(/\./g, '\\.')}\\)`, 'g'),
        new RegExp(conv.original.replace(/\./g, '\\.'), 'g')
      ];

      patterns.forEach(pattern => {
        updatedContent = updatedContent.replace(
          pattern,
          `![$1](/notion-images/${conv.converted})`
        );
      });
    });

    // 첫 번째 h1 제거 (중복 제목 방지)
    updatedContent = updatedContent.replace(/^#\s+.+\n*/m, '').trim();

    // Frontmatter 생성
    const today = new Date().toISOString().split('T')[0];
    const frontmatter = {
      title,
      date: today,
      excerpt,
      lightColor: '#0066cc',
      darkColor: '#0052a3'
    };

    // 마크다운 파일 생성
    const markdownContent = matter.stringify(updatedContent, frontmatter);
    const outputPath = path.join(outputDir, `${slug}.md`);

    fs.writeFileSync(outputPath, markdownContent, 'utf8');

    console.log(`\n✅ Blog post created: ${outputPath}`);
    console.log(`📄 File: content/posts/${slug}.md`);
    console.log(`🖼️  Images: ${conversions.length} converted to WebP`);
    console.log(`🔗 Slug: ${slug}`);
    console.log(`📅 Date: ${today}`);

    // 통계 출력
    if (conversions.length > 0) {
      const totalSize = conversions.reduce((sum, c) => sum + c.size, 0);
      console.log(`💾 Total image size: ${(totalSize / 1024).toFixed(2)} KB`);
    }
  }

  console.log('\n✅ All conversions completed!');
}

// ===========================
// 실행
// ===========================

convertNotionExport().catch(error => {
  console.error('Conversion failed:', error);
  process.exit(1);
});
