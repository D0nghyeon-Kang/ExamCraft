'use client';
import { useState, useRef } from 'react';
import styles from './page.module.css';
import { generateSplitDocx } from './docxBuilder';

const QUESTION_TYPES = [
  { id: 1,  label: '글의 목적 파악' },
  { id: 2,  label: '심경 변화 파악' },
  { id: 3,  label: '함축적 의미 파악' },
  { id: 4,  label: '요지 파악' },
  { id: 5,  label: '주장 파악' },
  { id: 6,  label: '주제 파악' },
  { id: 7,  label: '제목 파악' },
  { id: 9,  label: '내용 일치·불일치 (설명문)' },
  { id: 10, label: '내용 일치·불일치 (실용문)' },
  { id: 11, label: '어법 정확성 파악' },
  { id: 12, label: '어휘 적절성 파악' },
  { id: 13, label: '빈칸 내용 추론 (1)' },
  { id: 14, label: '빈칸 내용 추론 (2)' },
  { id: 15, label: '흐름에 무관한 문장 찾기' },
  { id: 16, label: '문단 내 글의 순서 파악' },
  { id: 17, label: '문단 속에 문장 넣기' },
  { id: 18, label: '문단 요약' },
  { id: 19, label: '장문 독해 (1)' },
  { id: 20, label: '장문 독해 (2)' },
];

const PROMPTS = {
  1: (p) => `다음 영어 지문을 읽고, "글의 목적 파악" 유형의 수능 문제를 만들어줘. 필자가 글을 쓴 목적을 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해줘.\n문제 형식: "다음 글의 목적으로 가장 적절한 것은?"\n\n[지문]\n${p}`,
  2: (p) => `다음 영어 지문을 읽고, "심경 변화 파악" 유형의 수능 문제를 만들어줘. 글에 나타난 인물의 심경 변화를 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해줘.\n문제 형식: "밑줄 친 부분에 나타난 화자의 심경 변화로 가장 적절한 것은?"\n중요: 지문에서 밑줄을 쳐야 하는 부분은 텍스트에서 __이렇게__ 밑줄 두 개로 감싸서 표시해줘 (마크다운 밑줄 표기).\n\n[지문]\n${p}`,
  3: (p) => `다음 영어 지문을 읽고, "함축적 의미 파악" 유형의 수능 문제를 만들어줘. 밑줄 친 표현의 함축적 의미를 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해줘.\n중요: 지문에서 밑줄을 쳐야 하는 부분은 텍스트에서 __이렇게__ 밑줄 두 개로 감싸서 표시해줘 (마크다운 밑줄 표기).\n\n[지문]\n${p}`,
  4: (p) => `다음 영어 지문을 읽고, "요지 파악" 유형의 수능 문제를 만들어줘. 글의 요지를 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해줘.\n문제 형식: "다음 글의 요지로 가장 적절한 것은?"\n\n[지문]\n${p}`,
  5: (p) => `다음 영어 지문을 읽고, "주장 파악" 유형의 수능 문제를 만들어줘. 글에서 필자가 주장하는 바를 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해줘.\n문제 형식: "다음 글에서 필자가 주장하는 바로 가장 적절한 것은?"\n\n[지문]\n${p}`,
  6: (p) => `다음 영어 지문을 읽고, "주제 파악" 유형의 수능 문제를 만들어줘. 글의 주제를 묻는 5지선다 문제(영어 선택지)를 만들고, 정답과 해설도 포함해줘.\n문제 형식: "다음 글의 주제로 가장 적절한 것은?"\n\n[지문]\n${p}`,
  7: (p) => `다음 영어 지문을 읽고, "제목 파악" 유형의 수능 문제를 만들어줘. 글의 제목을 묻는 5지선다 문제(영어 선택지)를 만들고, 정답과 해설도 포함해줘.\n문제 형식: "다음 글의 제목으로 가장 적절한 것은?"\n\n[지문]\n${p}`,
  9: (p) => `다음 영어 지문을 읽고, "내용 일치·불일치 (설명문)" 유형의 수능 문제를 만들어줘. 글의 내용과 일치하지 않는 것을 고르는 5지선다 문제(선택지는 한국어)를 만들고, 정답과 해설도 포함해줘.\n문제 형식: "다음 글의 내용과 일치하지 않는 것은?"\n\n[지문]\n${p}`,
  10: (p) => `다음 영어 지문을 읽고, "내용 일치·불일치 (실용문)" 유형의 수능 문제를 만들어줘. 안내문/광고문 형식으로 재구성하여 내용과 일치하지 않는 것을 고르는 5지선다 문제(선택지는 한국어)를 만들고, 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
  11: (p) => `다음 영어 지문을 읽고, "어법 정확성 파악" 유형의 수능 문제를 만들어줘. 지문에서 5군데를 골라 ①②③④⑤ 번호를 매기고, 어법상 틀린 것을 고르는 문제를 만들어줘. 반드시 하나만 틀려야 하며, 정답과 해설도 포함해줘.\n중요: 번호가 매겨진 5군데 표현은 모두 텍스트에서 __이렇게__ 밑줄 두 개로 감싸서 표시해줘 (마크다운 밑줄 표기). 예: ① __is__\n\n[지문]\n${p}`,
  12: (p) => `다음 영어 지문을 읽고, "어휘 적절성 파악" 유형의 수능 문제를 만들어줘. 지문에서 5개 단어에 ①②③④⑤ 번호를 매기고 각각 적절한/부적절한 단어를 괄호로 제시하여, 문맥상 쓰임이 적절하지 않은 것을 고르는 문제를 만들고, 정답과 해설도 포함해줘.\n중요: 번호가 매겨진 5개 단어는 모두 텍스트에서 __이렇게__ 밑줄 두 개로 감싸서 표시해줘 (마크다운 밑줄 표기). 예: ① __flexibility__\n\n[지문]\n${p}`,
  13: (p) => `다음 영어 지문을 읽고, "빈칸 내용 추론 (1)" 유형의 수능 문제를 만들어줘. 지문의 핵심 단어/구절에 빈칸을 만들고, 빈칸에 알맞은 표현을 고르는 5지선다 문제(영어 선택지)를 만들고, 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
  14: (p) => `다음 영어 지문을 읽고, "빈칸 내용 추론 (2)" 유형의 수능 문제를 만들어줘. 앞의 빈칸 추론과 다른 위치에 빈칸을 만들고, 빈칸에 알맞은 표현을 고르는 5지선다 문제(영어 선택지)를 만들고, 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
  15: (p) => `다음 영어 지문을 읽고, "흐름에 무관한 문장 찾기" 유형의 수능 문제를 만들어줘. 지문에 흐름과 무관한 문장 하나를 ①②③④⑤로 표시하여 삽입하고, 무관한 문장을 찾는 문제를 만들고, 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
  16: (p) => `다음 영어 지문을 읽고, "문단 내 글의 순서 파악" 유형의 수능 문제를 만들어줘. 지문을 도입부와 (A)(B)(C) 세 단락으로 나누고, 올바른 순서를 찾는 5지선다 문제를 만들고, 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
  17: (p) => `다음 영어 지문을 읽고, "문단 속에 문장 넣기" 유형의 수능 문제를 만들어줘. 주어진 문장을 지문의 ①②③④⑤ 중 알맞은 위치에 넣는 문제를 만들고, 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
  18: (p) => `다음 영어 지문을 읽고, "문단 요약" 유형의 수능 문제를 만들어줘. 지문의 내용을 요약한 한 문장에서 빈칸 (A)(B) 2개를 만들고, 각각에 알맞은 단어를 고르는 문제(각 빈칸에 3개 선택지)를 만들고, 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
  19: (p) => `다음 영어 지문을 읽고, "장문 독해 (1)" 유형의 수능 문제를 만들어줘. 2개의 문제를 만들어줘: (1) 글의 제목 (2) 빈칸 추론. 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
  20: (p) => `다음 영어 지문을 읽고, "장문 독해 (2)" 유형의 수능 문제를 만들어줘. 3개의 문제를 만들어줘: (1) 어휘 적절성 (2) 내용 일치 (3) 빈칸 추론. 정답과 해설도 포함해줘.\n\n[지문]\n${p}`,
};

export default function Home() {
  const [passage, setPassage] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileName, setFileName] = useState('ExamCraft');
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const toggleType = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === QUESTION_TYPES.length) setSelected(new Set());
    else setSelected(new Set(QUESTION_TYPES.map(t => t.id)));
  };

  const generatePrompt = () => {
    if (!passage.trim()) { alert('영어 지문을 입력해주세요.'); return; }
    if (selected.size === 0) { alert('문제 유형을 하나 이상 선택해주세요.'); return; }

    const selectedTypes = QUESTION_TYPES.filter(t => selected.has(t.id));
    const intro = `당신은 수능 영어 문제 출제 전문가입니다. 아래 영어 지문을 바탕으로 총 ${selectedTypes.length}개의 수능 유형 문제를 만들어주세요. 각 문제는 실제 수능 형식을 정확히 따르고, 정답과 해설은 【정답】【해설】 형식으로 작성해주세요.\n\n${'='.repeat(50)}\n\n`;

    const parts = selectedTypes.map((t, i) =>
      `[문제 ${i + 1}] ${t.label}\n${PROMPTS[t.id](passage)}`
    );

    const full = intro + parts.join('\n\n' + '-'.repeat(50) + '\n\n');
    setGeneratedPrompt(full);
    setCopied(false);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDocx = async () => {
    if (!aiResponse.trim()) {
      alert('AI가 만들어준 문제 답변을 먼저 붙여넣어주세요.');
      return;
    }
    const safeName = fileName.trim() || 'ExamCraft';
    setIsDownloading(true);
    try {
      await generateSplitDocx(aiResponse, safeName);
    } catch (e) {
      alert('워드 파일 생성 중 오류가 발생했습니다: ' + e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const extractTextFromImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    setIsExtracting(true);
    setPreviewUrl(URL.createObjectURL(file));

    // No API — just show image and let user type/paste manually
    // But we try to use browser-side if available
    setIsExtracting(false);
    alert('이미지가 업로드되었습니다. 지문을 직접 아래 텍스트 박스에 입력해주세요.');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) extractTextFromImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) extractTextFromImage(file);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>Exam</span>
            <span className={styles.logoText}>Craft</span>
          </div>
          <p className={styles.headerSub}>Generate CSAT-style English questions automatically from any passage</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inputSection}>

          {/* Step 1 */}
          <div className={styles.stepLabel}><span className={styles.stepNum}>1</span> 영어 지문 입력</div>

          <div className={styles.panel}>
            <label className={styles.panelLabel}>
              <span>직접 입력</span>
              <span className={styles.charCount}>{passage.length}자</span>
            </label>
            <textarea
              className={styles.textarea}
              value={passage}
              onChange={e => setPassage(e.target.value)}
              placeholder="여기에 영어 지문을 붙여넣으세요..."
              rows={8}
            />
          </div>

          {/* Step 2 */}
          <div className={styles.stepLabel}><span className={styles.stepNum}>2</span> 문제 유형 선택</div>

          <div className={styles.panel}>
            <div className={styles.typeHeader}>
              <span className={styles.panelLabel}>유형 선택 <span className={styles.selectedCount}>({selected.size}개 선택됨)</span></span>
              <button className={styles.toggleAllBtn} onClick={toggleAll}>
                {selected.size === QUESTION_TYPES.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            <div className={styles.typesGrid}>
              {QUESTION_TYPES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.typeChip} ${selected.has(t.id) ? styles.chipActive : ''}`}
                  onClick={() => toggleType(t.id)}
                >
                  <span className={styles.chipNum}>{String(t.id).padStart(2, '0')}</span>
                  <span className={styles.chipLabel}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className={styles.stepLabel}><span className={styles.stepNum}>3</span> 프롬프트 생성</div>

          <button
            className={styles.generateBtn}
            onClick={generatePrompt}
            disabled={selected.size === 0}
          >
            프롬프트 생성하기 ({selected.size}개 유형)
          </button>

          {/* Result */}
          {generatedPrompt && (
            <div className={styles.promptResult}>
              <div className={styles.promptResultHeader}>
                <span className={styles.promptResultTitle}>생성된 프롬프트</span>
                <div className={styles.promptActions}>
                  <a
                    href="https://chatgpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.openAiBtn}
                  >
                    ChatGPT 열기 ↗
                  </a>
                  <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={copyPrompt}>
                    {copied ? '✓ 복사됨!' : '복사하기'}
                  </button>
                </div>
              </div>
              <div className={styles.promptGuide}>
                👆 <strong>복사하기</strong> 누른 뒤 ChatGPT / Gemini / Claude에 붙여넣기 하세요
              </div>
              <pre className={styles.promptBox}>{generatedPrompt}</pre>
            </div>
          )}

          {/* Step 4 — Paste AI response & download Word */}
          <div className={styles.stepLabel}><span className={styles.stepNum}>4</span> AI 답변 붙여넣고 워드로 받기</div>

          <div className={styles.panel}>
            <label className={styles.panelLabel}>
              <span>ChatGPT / Gemini / Claude가 만들어준 문제 답변 붙여넣기</span>
              <span className={styles.charCount}>{aiResponse.length}자</span>
            </label>
            <textarea
              className={styles.textarea}
              value={aiResponse}
              onChange={e => setAiResponse(e.target.value)}
              placeholder="AI가 생성한 문제와 정답·해설 전체를 여기에 그대로 붙여넣으세요..."
              rows={10}
            />
          </div>

          <div className={styles.panel}>
            <label className={styles.panelLabel}>
              <span>워드 파일명</span>
            </label>
            <input
              type="text"
              className={styles.fileNameInput}
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="예: 모의고사1회, 3월고1모의고사 등"
            />
            <p className={styles.fileNameHint}>
              "{fileName.trim() || 'ExamCraft'}_문제지.docx" / "{fileName.trim() || 'ExamCraft'}_해설지.docx" 로 저장됩니다
            </p>
          </div>

          <button
            className={styles.downloadBtn}
            onClick={downloadDocx}
            disabled={isDownloading}
          >
            {isDownloading ? '워드 파일 만드는 중...' : '📄 문제지 + 해설지 워드(.docx) 2개 다운로드'}
          </button>
          <p className={styles.downloadHint}>문제만 담긴 파일과 정답·해설만 담긴 파일, 총 2개가 각각 다운로드됩니다</p>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by ExamCraft · 수능 영어 문제 프롬프트 생성기</p>
      </footer>
    </div>
  );
}
