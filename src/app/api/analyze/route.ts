import { NextRequest, NextResponse } from 'next/server';
import type { SozlesmeSartlari, AnalizYaniti } from '@/types';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SISTEM_ISTEMI = `Today's date is: ${new Date().toISOString().split('T')[0]}. Use this to precisely calculate relative deadlines like 'in 10 days' or 'next week'.

You are an AI contract arbitration assistant. Analyze the negotiation transcript and extract contract terms.

Return ONLY valid JSON with no text outside the object:
{
  "miktar": null or number (SOL payment amount),
  "sonTarih": null or "YYYY-MM-DD" (ISO 8601 deadline),
  "kapsam": null or "project scope description",
  "odemeKosullari": null or "payment conditions",
  "guvenSeviyesi": 0.0 to 1.0 (extraction confidence),
  "eksikBilgiler": ["missing item", ...] or [],
  "markdown_ozet": "💰 **Agreed Price:** X SOL\n⏳ **Deadline:** YYYY-MM-DD\n📋 **Conditions:**\n1. First condition\n2. Second condition"
}

Rules:
- SOL amount must be a numeric value; use null only if no number is mentioned at all
- EXTRAPOLATE and CALCULATE sonTarih (YYYY-MM-DD) by adding relative time (e.g., "3 days", "next week", "end of month") to Today's date above; never return null if any time reference exists
- For kapsam, aggressively extract ANY project details mentioned (e.g., "NFT design", "drone software", "website"); summarize them and NEVER return null if there is even a slight hint of a deliverable
- Be highly confident (guvenSeviyesi > 0.8) whenever you successfully extract both miktar and sonTarih
- Dates must be ISO 8601 (YYYY-MM-DD)
- markdown_ozet must have exactly these 3 sections with emoji headers and numbered bullet points
- Do not add any text outside the JSON object`;

function sartlariAyristir(jsonMetin: string): { sartlar: SozlesmeSartlari; markdownOzet: string } {
  const temizMetin = jsonMetin
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  const veri = JSON.parse(temizMetin);
  const sartlar: SozlesmeSartlari = {
    miktar: typeof veri.miktar === 'number' ? veri.miktar : null,
    sonTarih: typeof veri.sonTarih === 'string' ? veri.sonTarih : null,
    kapsam: typeof veri.kapsam === 'string' ? veri.kapsam : null,
    odemeKosullari: typeof veri.odemeKosullari === 'string' ? veri.odemeKosullari : null,
    guvenSeviyesi:
      typeof veri.guvenSeviyesi === 'number'
        ? Math.max(0, Math.min(1, veri.guvenSeviyesi))
        : 0.5,
    eksikBilgiler: Array.isArray(veri.eksikBilgiler)
      ? veri.eksikBilgiler.filter((x: unknown) => typeof x === 'string')
      : [],
  };
  const markdownOzet = typeof veri.markdown_ozet === 'string' ? veri.markdown_ozet : '';
  return { sartlar, markdownOzet };
}

export async function POST(request: NextRequest) {
  const apiAnahtari = process.env.GROQ_API_KEY;
  if (!apiAnahtari || apiAnahtari === 'YOUR_GROQ_KEY_HERE') {
    return NextResponse.json({ hata: 'GROQ_API_KEY not configured.' }, { status: 503 });
  }

  let govde: { transkript: unknown };
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ hata: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!Array.isArray(govde.transkript)) {
    return NextResponse.json({ hata: '"transkript" must be a string array.' }, { status: 400 });
  }

  const transkriptler = govde.transkript.filter(
    (t): t is string => typeof t === 'string' && t.trim().length > 0
  );

  if (transkriptler.length === 0) {
    return NextResponse.json({ hata: 'Transcript array is empty.' }, { status: 400 });
  }

  const birlesikTranskript = transkriptler.join('\n');

  if (birlesikTranskript.length > 15000) {
    return NextResponse.json({ hata: 'Transcript too long. Maximum 15,000 characters.' }, { status: 400 });
  }

  try {
    console.log(`[API/analyze] Analyzing ${transkriptler.length} transcripts...`);

    const yanit = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiAnahtari}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SISTEM_ISTEMI },
          {
            role: 'user',
            content: `Analyze the following negotiation transcript and extract contract terms:\n\n${birlesikTranskript}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!yanit.ok) {
      const hataVerisi = await yanit.json().catch(() => ({}));
      console.error('[API/analyze] Groq error:', yanit.status, hataVerisi);
      if (yanit.status === 401) {
        return NextResponse.json({ hata: 'Invalid Groq API key (401).' }, { status: 401 });
      }
      if (yanit.status === 429) {
        return NextResponse.json({ hata: 'Groq rate limit exceeded (429).' }, { status: 429 });
      }
      return NextResponse.json({ hata: `Groq API error: ${yanit.status}` }, { status: yanit.status });
    }

    const veri = await yanit.json();
    const yanıtMetni = veri.choices?.[0]?.message?.content;

    if (!yanıtMetni) {
      throw new Error('Groq returned an empty response.');
    }

    const { sartlar, markdownOzet } = sartlariAyristir(yanıtMetni);

    console.log(`[API/analyze] Done — confidence: ${(sartlar.guvenSeviyesi * 100).toFixed(0)}%, amount: ${sartlar.miktar}`);

    const sonuc: AnalizYaniti = {
      sartlar,
      ozet: markdownOzet || `Amount: ${sartlar.miktar ?? '?'} SOL · Deadline: ${sartlar.sonTarih ?? '?'}`,
    };

    return NextResponse.json(sonuc);
  } catch (hata) {
    console.error('[API/analyze] Error:', hata);
    return NextResponse.json(
      { hata: `Analysis failed: ${hata instanceof Error ? hata.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
