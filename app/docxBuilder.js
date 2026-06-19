import {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';

// Split AI output into question blocks.
function splitIntoBlocks(rawText) {
  const text = rawText.trim();
  if (!text) return [];

  const bySeparator = text
    .split(/\n-{3,}\n|\n={3,}\n/g)
    .map(s => s.trim())
    .filter(Boolean);
  if (bySeparator.length > 1) return bySeparator;

  const byMarker = text.split(/(?=\[문제\s*\d+\])/g).map(s => s.trim()).filter(Boolean);
  if (byMarker.length > 1) return byMarker;

  return [text];
}

// Split a single block into { title, body, answer } —
// body = everything before 【정답】, answer = 【정답】 onward.
function splitBlock(block) {
  const lines = block.split('\n');
  let title = '';
  let bodyLines = [];
  let answerLines = [];
  let inAnswer = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!title && /^\[문제\s*\d+\]/.test(line.trim())) {
      title = line.trim();
      continue;
    }
    if (line.includes('【정답】')) inAnswer = true;
    if (inAnswer) answerLines.push(line);
    else bodyLines.push(line);
  }

  return { title, body: bodyLines.join('\n').trim(), answer: answerLines.join('\n').trim() };
}

function textParagraphs(text, { answerStyle = false } = {}) {
  const paragraphs = [];
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
      continue;
    }
    if (line.includes('【정답】')) {
      paragraphs.push(new Paragraph({
        spacing: { before: 160 },
        children: [new TextRun({ text: line.trim(), bold: true, color: 'B30000' })],
      }));
      continue;
    }
    if (line.includes('【해설】')) {
      paragraphs.push(new Paragraph({
        spacing: { before: 60 },
        children: [new TextRun({ text: line.trim(), color: '444444' })],
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

function titleParagraph(title, number) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: title || `문제 ${number}`, bold: true })],
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
  const blocks = splitIntoBlocks(rawText).map(splitBlock);

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
