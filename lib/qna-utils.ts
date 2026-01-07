export interface QnAItem {
  question: string;
  answer: string;
}

export function extractQnA(content: string): QnAItem[] {
  const items: QnAItem[] = [];
  const lines = content.split('\n');

  let currentQuestion = '';
  let currentAnswer = '';
  let inQnA = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect Q&A section start
    if (line.match(/^##.*Q&?A|^##.*질문/i)) {
      inQnA = true;
      continue;
    }

    // Exit Q&A section when hitting another h2 or ---
    if (inQnA && (line.startsWith('## ') || line === '---')) {
      if (currentQuestion && currentAnswer) {
        items.push({
          question: currentQuestion.replace(/^\*\*Q\.\s*|\*\*$/g, '').trim(),
          answer: currentAnswer.replace(/^A\.\s*/g, '').trim()
        });
      }
      if (line.startsWith('## ')) {
        inQnA = false;
      }
      break;
    }

    // Detect question (starts with **Q.)
    if (inQnA && line.match(/^\*\*Q\./)) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        items.push({
          question: currentQuestion.replace(/^\*\*Q\.\s*|\*\*$/g, '').trim(),
          answer: currentAnswer.replace(/^A\.\s*/g, '').trim()
        });
      }
      currentQuestion = line;
      currentAnswer = '';
      continue;
    }

    // Detect answer (starts with A.)
    if (inQnA && line.match(/^A\./)) {
      currentAnswer = line;

      // Collect multi-line answers
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine === '' || nextLine.match(/^\*\*Q\./)) {
          break;
        }
        currentAnswer += ' ' + nextLine;
        i = j;
      }
    }
  }

  // Add last Q&A if exists
  if (currentQuestion && currentAnswer) {
    items.push({
      question: currentQuestion.replace(/^\*\*Q\.\s*|\*\*$/g, '').trim(),
      answer: currentAnswer.replace(/^A\.\s*/g, '').trim()
    });
  }

  return items;
}

export function removeQnASection(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inQnA = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect Q&A section start
    if (trimmed.match(/^##.*Q&?A|^##.*질문/i)) {
      inQnA = true;
      continue;
    }

    // Exit Q&A when hitting next section or separator
    if (inQnA && (trimmed.startsWith('## ') || trimmed === '---')) {
      if (trimmed === '---') continue;
      inQnA = false;
    }

    if (!inQnA) {
      result.push(line);
    }
  }

  return result.join('\n');
}
