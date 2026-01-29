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
    const line = lines[i];
    const trimmed = line.trim();

    // Detect Q&A section start (## or ### with Q&A, 질문, or 자주 묻는 질문)
    if (trimmed.match(/^#{2,3}\s*\*{0,2}.*?(Q&?A|자주\s*묻는\s*질문)/i)) {
      inQnA = true;
      continue;
    }

    // Exit Q&A section when hitting another heading (h2 or h3) or ---
    if (inQnA && (trimmed.match(/^#{2,3}\s+[^#]/) || trimmed === '---')) {
      if (currentQuestion && currentAnswer) {
        items.push({
          question: cleanQuestion(currentQuestion),
          answer: cleanAnswer(currentAnswer)
        });
      }
      // Only exit if it's a different section (not Q&A header again)
      if (!trimmed.match(/^#{2,3}\s*\*{0,2}.*?(Q&?A|자주\s*묻는\s*질문)/i)) {
        inQnA = false;
        break;
      }
    }

    // Detect question patterns:
    // 1. Q. or **Q. format
    // 2. - bullet point format (Notion toggle)
    // 3. ▶ toggle format
    if (inQnA) {
      const isQFormat = trimmed.match(/^(\*\*)?Q\./);
      const isBulletFormat = trimmed.match(/^-\s+.+/) && !trimmed.match(/^-\s+A\./);
      const isToggleFormat = trimmed.match(/^▶\s+.+/);

      if (isQFormat || isBulletFormat || isToggleFormat) {
        // Save previous Q&A if exists
        if (currentQuestion && currentAnswer) {
          items.push({
            question: cleanQuestion(currentQuestion),
            answer: cleanAnswer(currentAnswer)
          });
        }
        currentQuestion = trimmed;
        currentAnswer = '';
        continue;
      }
    }

    // Detect answer (starts with A. or indented A.)
    if (inQnA && currentQuestion && trimmed.match(/^A\./)) {
      currentAnswer = trimmed;

      // Collect multi-line answers
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        // Stop if empty line followed by new question or section
        if (nextLine === '') {
          // Check if next non-empty line is a new question
          let k = j + 1;
          while (k < lines.length && lines[k].trim() === '') k++;
          if (k < lines.length) {
            const futureLineTrimmed = lines[k].trim();
            if (futureLineTrimmed.match(/^(\*\*)?Q\./) ||
                futureLineTrimmed.match(/^-\s+[^A]/) ||
                futureLineTrimmed.match(/^▶\s+/) ||
                futureLineTrimmed.match(/^#{2,3}\s+/)) {
              break;
            }
          }
          continue;
        }
        // Stop if new question or section
        if (nextLine.match(/^(\*\*)?Q\./) ||
            nextLine.match(/^-\s+[^A]/) ||
            nextLine.match(/^▶\s+/) ||
            nextLine.match(/^#{2,3}\s+/)) {
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
      question: cleanQuestion(currentQuestion),
      answer: cleanAnswer(currentAnswer)
    });
  }

  return items;
}

function cleanQuestion(question: string): string {
  return question
    .replace(/^\*\*Q\.\s*|\*\*$/g, '')  // Remove **Q. and trailing **
    .replace(/^Q\.\s*/g, '')             // Remove Q.
    .replace(/^-\s+/g, '')               // Remove bullet point
    .replace(/^▶\s*/g, '')               // Remove toggle arrow
    .trim();
}

function cleanAnswer(answer: string): string {
  return answer
    .replace(/^A\.\s*/g, '')
    .trim();
}

export function removeQnASection(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inQnA = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect Q&A section start (## or ### with Q&A, 질문, or 자주 묻는 질문)
    if (trimmed.match(/^#{2,3}\s*\*{0,2}.*?(Q&?A|자주\s*묻는\s*질문)/i)) {
      inQnA = true;
      continue;
    }

    // Exit Q&A when hitting next section (h2 or h3) or separator
    if (inQnA && (trimmed.match(/^#{2,3}\s+[^#]/) || trimmed === '---')) {
      // Check if it's not another Q&A section
      if (!trimmed.match(/^#{2,3}\s*\*{0,2}.*?(Q&?A|자주\s*묻는\s*질문)/i)) {
        if (trimmed === '---') continue;
        inQnA = false;
      }
    }

    if (!inQnA) {
      result.push(line);
    }
  }

  return result.join('\n');
}
