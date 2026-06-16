# 수능 영어 문제 자동 생성기

영어 지문을 입력하면 수능 특강 20개 유형의 문제를 자동으로 생성하는 웹 앱입니다.

---

## 배포 방법 (코딩 없이 5분 완성)

### 1단계 — GitHub에 올리기

1. [github.com](https://github.com) 에서 회원가입 (이미 있으면 로그인)
2. 오른쪽 상단 **+** 버튼 → **New repository** 클릭
3. Repository name: `examcraft` 입력 → **Create repository** 클릭
4. 화면에 나온 명령어 복사해서 터미널에서 실행:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/내아이디/examcraft.git
git push -u origin main
```

### 2단계 — Vercel에 배포하기

1. [vercel.com](https://vercel.com) 에서 **GitHub 계정으로 로그인**
2. **Add New → Project** 클릭
3. `examcraft` 저장소 선택 → **Import** 클릭
4. **Environment Variables** 섹션에서:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Anthropic API 키 입력 (https://console.anthropic.com 에서 발급)
5. **Deploy** 클릭

→ 약 1분 후 `https://examcraft.vercel.app` 주소로 접속 가능!

---

## 로컬에서 실행하기 (선택사항)

```bash
npm install
cp .env.example .env.local
# .env.local 파일에 API 키 입력
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 기능

- 수능 특강 20개 유형 문제 자동 생성
- 원하는 유형만 선택 가능
- 정답·해설 토글 보기
- API 키 서버 측 보호 (외부 노출 없음)
