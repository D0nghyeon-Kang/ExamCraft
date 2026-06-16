export const runtime = 'edge';

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, mediaType } = body;

    if (!imageBase64 || !mediaType) {
      return new Response(JSON.stringify({ error: '이미지 데이터가 없습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API 키가 설정되지 않았습니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                text: '이 이미지에서 영어 지문(본문 텍스트)만 정확하게 추출해주세요. 문제 번호, 지시문, 선택지, 한국어 설명 등은 제외하고 순수한 영어 지문 텍스트만 출력해주세요. 원문의 단락 구조를 유지해주세요. 다른 설명 없이 영어 텍스트만 출력하세요.',
              },
            ],
          }],
          generationConfig: { maxOutputTokens: 2000 },
        }),
      }
    );

    const responseText = await geminiRes.text();

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
      return new Response(JSON.stringify({ error: 'API 응답 파싱 실패' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || `API 오류 (${geminiRes.status})` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return new Response(JSON.stringify({ text }), {
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
