# Overreacted Clone

A high-performance blog inspired by Dan Abramov's [overreacted.io](https://overreacted.io), built with Next.js 15 and React Server Components.

## Features

- **Next.js 15** with App Router and React Server Components
- **Zero-JS by default** - Pages are pre-rendered as static HTML
- **LAB color space** for smooth dark mode transitions
- **Tailwind CSS** for styling with Typography plugin
- **MDX** for enhanced markdown content
- **Optimized fonts** with next/font (Inter)
- **Image optimization** with AVIF and WebP formats
- **Lighthouse 100** performance score target

## Performance

- **Bundle size**: ~165 B per page (excluding React runtime)
- **First Load JS**: ~106 kB (React + Next.js runtime)
- **Static generation** at build time
- **Edge caching** ready for Vercel deployment
- **Prefetch enabled** for instant navigation

## Tech Stack

- Next.js 15.5.9
- React 19
- TypeScript 5
- Tailwind CSS 3.4
- MDX support
- React Markdown

## Getting Started

### Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the blog.

### Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
.
├── app/                    # Next.js App Router
│   ├── [slug]/            # Dynamic blog post routes
│   ├── layout.tsx         # Root layout (RSC)
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with LAB colors
├── components/            # React components
│   ├── Header.tsx         # Blog header
│   ├── PostCard.tsx       # Post preview card
│   └── Link.tsx           # Optimized Link wrapper
├── content/posts/         # Blog posts (Markdown/MDX)
│   └── welcome.md         # Example post
├── lib/                   # Utilities
│   └── posts.ts           # Post loading logic
└── public/                # Static assets
\`\`\`

## Writing Posts

Create a new Markdown file in \`content/posts/\`:

\`\`\`markdown
---
title: "Your Post Title"
date: "2026-01-07"
excerpt: "A brief description of your post."
lightColor: "lab(62.926 59.277 -1.573)"
darkColor: "lab(80.993 32.329 -7.093)"
---

# Your Post Content

Write your post content here using Markdown or MDX.
\`\`\`

## Deployment

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import to Vercel
3. Deploy

Vercel will automatically:
- Build the static site
- Enable edge caching
- Serve with optimal performance

## License

MIT
