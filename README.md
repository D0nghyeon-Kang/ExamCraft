# ExamCraft

영어 지문을 입력하면 수능 특강 20개 유형 문제 프롬프트를 자동으로 만들어주고, ChatGPT/Gemini/Claude의 답변을 워드 파일로 바로 다운로드할 수 있는 웹 앱입니다.

API 키가 필요 없습니다 (프롬프트 생성 + 클라이언트 워드 변환 방식).

---

## 사용 방법

1. 영어 지문 입력
2. 원하는 문제 유형 선택 (최대 20개)
3. "프롬프트 생성하기" → 복사 → ChatGPT/Gemini/Claude에 붙여넣기
4. AI가 만들어준 답변을 다시 ExamCraft에 붙여넣기 → "워드(.docx) 파일로 다운로드"

---

## 배포 방법 (GitHub + Vercel)

### 1단계 — GitHub에 올리기

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/내아이디/ExamCraft.git
git push -u origin main
```

### 2단계 — Vercel에 배포하기

1. [vercel.com](https://vercel.com) → GitHub 계정으로 로그인
2. **Add New → Project** → 저장소 선택 → Import
3. **Deploy** 클릭 (환경변수 설정 필요 없음!)

---

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

http://localhost:3000 접속
