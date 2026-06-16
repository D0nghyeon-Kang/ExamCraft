export const runtime = 'edge';

const QUESTION_PROMPTS = {
  1: `다음 영어 지문을 읽고, "글의 목적 파악" 유형의 수능 문제를 만들어주세요. 필자가 글을 쓴 목적을 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해주세요.\n문제 형식: "다음 글의 목적으로 가장 적절한 것은?"`,
  2: `다음 영어 지문을 읽고, "심경 변화 파악" 유형의 수능 문제를 만들어주세요. 글에 나타난 인물의 심경 변화를 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해주세요.\n문제 형식: "밑줄 친 부분에 나타난 화자의 심경 변화로 가장 적절한 것은?"`,
  3: `다음 영어 지문을 읽고, "함축적 의미 파악" 유형의 수능 문제를 만들어주세요. 밑줄 친 표현의 함축적 의미를 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해주세요. 지문에서 적절한 구절에 밑줄을 표시해주세요.`,
  4: `다음 영어 지문을 읽고, "요지 파악" 유형의 수능 문제를 만들어주세요. 글의 요지를 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해주세요.\n문제 형식: "다음 글의 요지로 가장 적절한 것은?"`,
  5: `다음 영어 지문을 읽고, "주장 파악" 유형의 수능 문제를 만들어주세요. 글에서 필자가 주장하는 바를 묻는 5지선다 문제를 만들고, 정답과 해설도 포함해주세요.\n문제 형식: "다음 글에서 필자가 주장하는 바로 가장 적절한 것은?"`,
  6: `다음 영어 지문을 읽고, "주제 파악" 유형의 수능 문제를 만들어주세요. 글의 주제를 묻는 5지선다 문제(영어 선택지)를 만들고, 정답과 해설도 포함해주세요.\n문제 형식: "다음 글의 주제로 가장 적절한 것은?"`,
  7: `다음 영어 지문을 읽고, "제목 파악" 유형의 수능 문제를 만들어주세요. 글의 제목을 묻는 5지선다 문제(영어 선택지)를 만들고, 정답과 해설도 포함해주세요.\n문제 형식: "다음 글의 제목으로 가장 적절한 것은?"`,
  8: `다음 영어 지문을 읽고, "도표 정보 파악" 유형의 수능 문제를 만들어주세요. 지문 내용을 바탕으로 가상의 도표(표 또는 그래프)를 텍스트로 묘사하고, 도표의 내용과 일치하지 않는 것을 고르는 5지선다 문제를 만들어주세요. 정답과 해설도 포함해주세요.`,
  9: `다음 영어 지문을 읽고, "내용 일치·불일치 (설명문)" 유형의 수능 문제를 만들어주세요. 글의 내용과 일치하지 않는 것을 고르는 5지선다 문제(선택지는 한국어)를 만들고, 정답과 해설도 포함해주세요.\n문제 형식: "다음 글의 내용과 일치하지 않는 것은?"`,
  10: `다음 영어 지문을 읽고, "내용 일치·불일치 (실용문)" 유형의 수능 문제를 만들어주세요. 안내문/광고문 형식으로 재구성하여 내용과 일치하지 않는 것을 고르는 5지선다 문제(선택지는 한국어)를 만들어주세요. 정답과 해설도 포함해주세요.`,
  11: `다음 영어 지문을 읽고, "어법 정확성 파악" 유형의 수능 문제를 만들어주세요. 지문에서 5군데에 밑줄(①②③④⑤)을 치고, 어법상 틀린 것을 고르는 문제를 만들어주세요. 반드시 하나만 틀려야 하며, 정답과 해설도 포함해주세요.`,
  12: `다음 영어 지문을 읽고, "어휘 적절성 파악" 유형의 수능 문제를 만들어주세요. 지문에서 5개 단어에 밑줄을 치고 각각 (A)적절한/(B)부적절한 단어를 괄호로 제시하여, 문맥상 쓰임이 적절하지 않은 것을 고르는 문제를 만들어주세요. 정답과 해설도 포함해주세요.`,
  13: `다음 영어 지문을 읽고, "빈칸 내용 추론 (1)" 유형의 수능 문제를 만들어주세요. 지문의 핵심 단어/구절에 빈칸을 만들고, 빈칸에 알맞은 표현을 고르는 5지선다 문제(영어 선택지)를 만들어주세요. 정답과 해설도 포함해주세요.`,
  14: `다음 영어 지문을 읽고, "빈칸 내용 추론 (2)" 유형의 수능 문제를 만들어주세요. 앞의 빈칸 추론과 다른 위치에 빈칸을 만들고, 빈칸에 알맞은 표현을 고르는 5지선다 문제(영어 선택지)를 만들어주세요. 정답과 해설도 포함해주세요.`,
  15: `다음 영어 지문을 읽고, "흐름에 무관한 문장 찾기" 유형의 수능 문제를 만들어주세요. 지문에 흐름과 무관한 문장 하나를 ①②③④⑤로 표시하여 삽입하고, 무관한 문장을 찾는 문제를 만들어주세요. 정답과 해설도 포함해주세요.`,
  16: `다음 영어 지문을 읽고, "문단 내 글의 순서 파악" 유형의 수능 문제를 만들어주세요. 지문을 도입부와 (A)(B)(C) 세 단락으로 나누고, 올바른 순서를 찾는 5지선다 문제를 만들어주세요. 정답과 해설도 포함해주세요.`,
  17: `다음 영어 지문을 읽고, "문단 속에 문장 넣기" 유형의 수능 문제를 만들어주세요. 주어진 문장을 지문의 ①②③④⑤ 중 알맞은 위치에 넣는 문제를 만들어주세요. 정답과 해설도 포함해주세요.`,
  18: `다음 영어 지문을 읽고, "문단 요약" 유형의 수능 문제를 만들어주세요. 지문의 내용을 요약한 한 문장에서 빈칸 (A)(B) 2개를 만들고, 각각에 알맞은 단어를 고르는 문제를 만들어주세요. 각 빈칸에 3개의 선택지를 제시해주세요. 정답과 해설도 포함해주세요.`,
  19: `다음 영어 지문을 읽고, "장문 독해 (1)" 유형의 수능 문제를 만들어주세요. 하나의 긴 지문을 바탕으로 2개의 문제를 만들어주세요: (1) 글의 제목 (2) 빈칸 추론. 정답과 해설도 포함해주세요.`,
  20: `다음 영어 지문을 읽고, "장문 독해 (2)" 유형의 수능 문제를 만들어주세요. 하나의 긴 지문을 바탕으로 3개의 문제를 만들어주세요: (1) 어휘 적절성 (2) 내용 일치 (3) 빈칸 추론. 정답과 해설도 포함해주세요.`,
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { passage, typeId } = body;

    if (!passage || !typeId) {
      return new Response(JSON.stringify({ error: '지문과 문제 유형을 입력해주세요.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API 키가 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = QUESTION_PROMPTS[typeId];
    if (!prompt) {
      return new Response(JSON.stringify({ error: '알 수 없는 문제 유형입니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: '당신은 수능 영어 문제 출제 전문가입니다. 주어진 영어 지문을 바탕으로 실제 수능 형식에 맞는 고품질 문제를 만들어주세요. 정답과 해설은 반드시 【정답】과 【해설】 형식으로 작성해주세요.',
        messages: [{ role: 'user', content: `${prompt}\n\n[지문]\n${passage}` }],
      }),
    });

    const responseText = await anthropicRes.text();

    if (!responseText) {
      return new Response(JSON.stringify({ error: 'API 응답이 비어있습니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return new Response(JSON.stringify({ error: 'API 응답 파싱 실패: ' + responseText.slice(0, 200) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!anthropicRes.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || `API 오류 (${anthropicRes.status})` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = data.content?.map((c) => c.text || '').join('') || '';
    return new Response(JSON.stringify({ result: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 오류: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
