'use client';
import { useState, useCallback, useRef } from 'react';
import styles from './page.module.css';

const QUESTION_TYPES = [
  { id: 1,  label: '글의 목적 파악' },
  { id: 2,  label: '심경 변화 파악' },
  { id: 3,  label: '함축적 의미 파악' },
  { id: 4,  label: '요지 파악' },
  { id: 5,  label: '주장 파악' },
  { id: 6,  label: '주제 파악' },
  { id: 7,  label: '제목 파악' },
  { id: 8,  label: '도표 정보 파악' },
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

function QuestionCard({ type, result, status }) {
  const [showAnswer, setShowAnswer] = useState(false);

  let questionBody = result;
  let answerPart = '';

  if (result) {
    const answerIdx = result.indexOf('【정답】');
    if (answerIdx !== -1) {
      questionBody = result.substring(0, answerIdx).trim();
      answerPart = result.substring(answerIdx).trim();
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.typeNum}>{String(type.id).padStart(2, '0')}</span>
        <span className={styles.typeLabel}>{type.label}</span>
        {status === 'loading' && <span className={styles.statusBadge}>생성 중...</span>}
        {status === 'done' && <span className={`${styles.statusBadge} ${styles.done}`}>완료</span>}
        {status === 'error' && <span className={`${styles.statusBadge} ${styles.error}`}>오류</span>}
      </div>
      <div className={styles.cardBody}>
        {status === 'idle' && <p className={styles.placeholder}>문제 생성 대기 중</p>}
        {status === 'loading' && (
          <div className={styles.skeleton}>
            <div className={styles.skeletonLine} style={{ width: '90%' }} />
            <div className={styles.skeletonLine} style={{ width: '75%' }} />
            <div className={styles.skeletonLine} style={{ width: '82%' }} />
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
          </div>
        )}
        {(status === 'done' || status === 'error') && (
          <>
            <pre className={styles.questionText}>{questionBody || result}</pre>
            {answerPart && (
              <>
                <button
                  className={styles.answerToggle}
                  onClick={() => setShowAnswer(v => !v)}
                >
                  {showAnswer ? '정답·해설 숨기기 ▲' : '정답·해설 보기 ▼'}
                </button>
                {showAnswer && (
                  <div className={styles.answerBox}>
                    <pre>{answerPart}</pre>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [passage, setPassage] = useState('');
  const [selected, setSelected] = useState(new Set(QUESTION_TYPES.map(t => t.id)));
  const [statuses, setStatuses] = useState({});
  const [results, setResults] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [generated, setGenerated] = useState(false);
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

  const extractTextFromImage = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    setIsExtracting(true);
    setPreviewUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(',')[1];
      const mediaType = file.type;
      try {
        const res = await fetch('/api/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        });
        const data = await res.json();
        if (data.text) {
          setPassage(data.text);
        } else {
          alert('텍스트 추출에 실패했습니다: ' + (data.error || '알 수 없는 오류'));
        }
      } catch (err) {
        alert('오류가 발생했습니다: ' + err.message);
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

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

  const generate = useCallback(async () => {
    if (!passage.trim()) { alert('영어 지문을 입력해주세요.'); return; }
    if (selected.size === 0) { alert('문제 유형을 하나 이상 선택해주세요.'); return; }
    if (isGenerating) return;

    const selectedTypes = QUESTION_TYPES.filter(t => selected.has(t.id));
    setIsGenerating(true);
    setGenerated(true);
    setProgress({ done: 0, total: selectedTypes.length });
    setResults({});
    const initStatus = {};
    selectedTypes.forEach(t => { initStatus[t.id] = 'loading'; });
    setStatuses(initStatus);

    let done = 0;
    for (const type of selectedTypes) {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passage, typeId: type.id }),
        });
        const data = await res.json();
        if (data.result) {
          setResults(prev => ({ ...prev, [type.id]: data.result }));
          setStatuses(prev => ({ ...prev, [type.id]: 'done' }));
        } else {
          setResults(prev => ({ ...prev, [type.id]: data.error || '오류가 발생했습니다.' }));
          setStatuses(prev => ({ ...prev, [type.id]: 'error' }));
        }
      } catch (e) {
        setResults(prev => ({ ...prev, [type.id]: '네트워크 오류: ' + e.message }));
        setStatuses(prev => ({ ...prev, [type.id]: 'error' }));
      }
      done++;
      setProgress({ done, total: selectedTypes.length });
    }

    setIsGenerating(false);
  }, [passage, selected, isGenerating]);

  const generatedTypes = QUESTION_TYPES.filter(t => statuses[t.id]);

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

          {/* Image Upload */}
          <div className={styles.panel}>
            <label className={styles.panelLabel}>
              <span>사진으로 지문 입력</span>
              {isExtracting && <span className={styles.extractingBadge}>인식 중...</span>}
            </label>
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${isExtracting ? styles.extracting : ''}`}
              onClick={() => !isExtracting && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {isExtracting ? (
                <div className={styles.extractingState}>
                  <div className={styles.spinner} />
                  <span>이미지에서 텍스트 인식 중...</span>
                </div>
              ) : previewUrl ? (
                <div className={styles.previewState}>
                  <img src={previewUrl} alt="업로드된 이미지" className={styles.previewImg} />
                  <span className={styles.previewChange}>클릭하여 다른 이미지 선택</span>
                </div>
              ) : (
                <div className={styles.dropZoneContent}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>이미지를 드래그하거나 클릭해서 업로드</span>
                  <span className={styles.dropZoneSub}>교재 사진, 스캔본, 캡처 이미지 모두 가능 · JPG, PNG, WEBP</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Text Input */}
          <div className={styles.panel}>
            <label className={styles.panelLabel}>
              <span>영어 지문 입력</span>
              <span className={styles.charCount}>{passage.length}자</span>
            </label>
            <textarea
              className={styles.textarea}
              value={passage}
              onChange={e => setPassage(e.target.value)}
              placeholder="여기에 영어 지문을 직접 붙여넣거나, 위에서 이미지를 업로드하세요..."
              rows={8}
            />
          </div>

          {/* Type Selector */}
          <div className={styles.panel}>
            <div className={styles.typeHeader}>
              <span className={styles.panelLabel}>문제 유형 선택</span>
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

          <button
            className={styles.generateBtn}
            onClick={generate}
            disabled={isGenerating || isExtracting || selected.size === 0}
          >
            {isGenerating
              ? `생성 중... (${progress.done} / ${progress.total})`
              : `문제 생성하기 (${selected.size}개 유형)`}
          </button>

          {isGenerating && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
          )}
        </div>

        {generated && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>생성된 문제</h2>
              {!isGenerating && (
                <span className={styles.resultsMeta}>{progress.done}개 완료</span>
              )}
            </div>
            {generatedTypes.map(type => (
              <QuestionCard
                key={type.id}
                type={type}
                result={results[type.id]}
                status={statuses[type.id] || 'idle'}
              />
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Powered by Claude AI · ExamCraft</p>
      </footer>
    </div>
  );
}
