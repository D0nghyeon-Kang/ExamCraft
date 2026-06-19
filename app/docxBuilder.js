import {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';

// Remove common markdown syntax / HTML entities that AI chat responses tend to include,
// since the pasted text is meant to read as a clean document, not raw markdown.
function stripMarkdown(line) {
  let s = line;
  s = s.replace(/^#{1,6}\s*/, '');                 // headings: ### Title -> Title
  s = s.replace(/^```.*$/, '');                     // code fences
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '$1');         // bold+italic ***text***
  s = s.replace(/\*\*(.+?)\*\*/g, '$1');             // bold **text**
  s = s.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '$1'); // italics *text*
  s = s.replace(/^[-*]\s+(?=\S)/, '');               // leading markdown bullet "- " or "* "
  s = s.replace(/`([^`]*)`/g, '$1');                 // inline code `text`
  s = s.replace(/&apos;/g, "'");
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  return s.trim();
}

// Find the literal [문제 N] markers ExamCraft's prompts ask the AI to include,
// and use them as the only valid split points. Anything before the first marker
// (greetings, intros like "제시해주신 지문을 바탕으로...") is discarded entirely.
function splitIntoBlocks(rawText) {
  const text = rawText.trim();
  if (!text) return [];

  const markerRegex = /\[\s*문제\s*(\d+)\s*\][^\n]*/g;
  const matches = [...text.matchAll(markerRegex)];

  if (matches.length === 0) {
    return [text];
  }

  const blocks = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    blocks.push(text.slice(start, end).trim());
  }
  return blocks;
}

// Split a single block (which starts with its own [문제 N] marker line) into
// { title, body, answer }. The marker line itself becomes the title and is
// removed from the body so it never appears twice.
function splitBlock(block) {
  const lines = block.split('\n');
  let title = '';
  let titleConsumed = false;
  const bodyLines = [];
  const answerLines = [];
  let inAnswer = false;

  for (const rawLine of lines) {
    const cleaned = stripMarkdown(rawLine.trimEnd());

    if (!titleConsumed && /^\[\s*문제\s*\d+\s*\]/.test(cleaned)) {
      title = cleaned;
      titleConsumed = true;
      continue;
    }
    if (cleaned.includes('【정답')) inAnswer = true;

    if (inAnswer) answerLines.push(cleaned);
    else bodyLines.push(cleaned);
  }

  return {
    title,
    body: bodyLines.join('\n').trim(),
    answer: answerLines.join('\n').trim(),
  };
}

function textParagraphs(text) {
  const paragraphs = [];
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
      continue;
    }
    if (line.includes('【정답')) {
      paragraphs.push(new Paragraph({
        spacing: { before: 160 },
        children: [new TextRun({ text: line.trim(), bold: true, color: 'B30000' })],
      }));
      continue;
    }
    if (line.includes('【해설】')) {
      paragraphs.push(new Paragraph({
        spacing: { before: 60 },
        children: [new TextRun({ text: line.trim(), bold: true, color: '444444' })],
      }));
      continue;
    }
    paragraphs.push(new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: line })],
    }));
  }
  return paragraphs;
}

function titleParagraph(title, fallbackNumber) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: title || `문제 ${fallbackNumber}`, bold: true })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 4 } },
  });
}

function dividerParagraph() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 1 } },
    children: [new TextRun('')],
  });
}

function buildDoc(titleText, children) {
  return new Document({
    styles: {
      default: { document: { run: { font: 'Malgun Gothic', size: 22 } } },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Malgun Gothic' },
          paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Malgun Gothic' },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
          children: [new TextRun({ text: titleText, bold: true })],
        }),
        ...children,
      ],
    }],
  });
}

// Generates TWO separate .docx files: one with questions only, one with answers/explanations only.
export async function generateSplitDocx(rawText, baseTitle = 'ExamCraft') {
  const blocks = splitIntoBlocks(rawText)
    .map(splitBlock)
    .filter(b => b.body.trim().length > 0 || b.answer.trim().length > 0);

  const questionChildren = [];
  const answerChildren = [];

  blocks.forEach((b, idx) => {
    questionChildren.push(titleParagraph(b.title, idx + 1));
    questionChildren.push(...textParagraphs(b.body));
    if (idx < blocks.length - 1) questionChildren.push(dividerParagraph());

    answerChildren.push(titleParagraph(b.title, idx + 1));
    answerChildren.push(...textParagraphs(b.answer || '(정답·해설을 찾지 못했습니다. 원문을 확인해주세요.)'));
    if (idx < blocks.length - 1) answerChildren.push(dividerParagraph());
  });

  const questionDoc = buildDoc(`${baseTitle} - 문제`, questionChildren);
  const answerDoc = buildDoc(`${baseTitle} - 정답 및 해설`, answerChildren);

  const [questionBlob, answerBlob] = await Promise.all([
    Packer.toBlob(questionDoc),
    Packer.toBlob(answerDoc),
  ]);

  saveAs(questionBlob, `${baseTitle}_문제지.docx`);
  saveAs(answerBlob, `${baseTitle}_해설지.docx`);
}
