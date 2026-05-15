import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ORG_SLUG = "opex-solutions";
const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate" };

function envCheck() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return "Variabili d'ambiente Supabase mancanti";
  return null;
}

function getClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON);
}

async function resolveOrgAndUser(supabase, consultantName) {
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', ORG_SLUG).single();
  if (!org) return null;
  const { data: user } = await supabase.from('users').select('id').eq('org_id', org.id).eq('name', consultantName).single();
  if (!user) return null;
  return { orgId: org.id, userId: user.id };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// POST /api/entries/move — sposta una entry da fromDateKey a toDateKey
// half: "am" | "pm" | "full" (sposta entrambe le metà)
export async function POST(request) {
  const envErr = envCheck();
  if (envErr) return NextResponse.json({ error: envErr }, { status: 500, headers: HEADERS });
  try {
    const body = await request.json();
    const consultantName = body.consultantName;
    const fromDateKey = body.fromDateKey;
    const toDateKey = body.toDateKey;
    const half = body.half;

    if (!consultantName || !fromDateKey || !toDateKey || !half) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti: consultantName, fromDateKey, toDateKey, half' }, { status: 400, headers: HEADERS });
    }

    const supabase = getClient();
    const ids = await resolveOrgAndUser(supabase, consultantName);
    if (!ids) return NextResponse.json({ error: 'Consulente non trovato: ' + consultantName }, { status: 404, headers: HEADERS });

    const uid = ids.userId;
    const oid = ids.orgId;

    // Legge le entry di origine
    const { data: srcEntries, error: srcErr } = await supabase
      .from('entries').select('*').eq('user_id', uid).eq('entry_date', fromDateKey);
    if (srcErr) return NextResponse.json({ error: srcErr.message }, { status: 500, headers: HEADERS });

    var halfsToMove = (half === 'full') ? ['am', 'pm'] : [half];

    for (var i = 0; i < halfsToMove.length; i++) {
      var h = halfsToMove[i];
      var src = null;
      for (var j = 0; j < (srcEntries || []).length; j++) {
        if (srcEntries[j].half === h) { src = srcEntries[j]; break; }
      }
      if (!src) continue;

      // Upsert a destinazione
      var upsRes = await supabase.from('entries').upsert({
        org_id: oid,
        user_id: uid,
        entry_date: toDateKey,
        half: h,
        status: src.status,
        client_id: src.client_id,
        note: src.note || ''
      }, { onConflict: 'user_id,entry_date,half' });
      if (upsRes.error) return NextResponse.json({ error: upsRes.error.message }, { status: 500, headers: HEADERS });

      // Cancella dall'origine
      var delRes = await supabase.from('entries').delete()
        .eq('user_id', uid).eq('entry_date', fromDateKey).eq('half', h);
      if (delRes.error) return NextResponse.json({ error: delRes.error.message }, { status: 500, headers: HEADERS });
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: HEADERS });
  } catch (e) {
    console.error('[api/entries/move POST]', e);
    return NextResponse.json({ error: e.message }, { status: 500, headers: HEADERS });
  }
}
