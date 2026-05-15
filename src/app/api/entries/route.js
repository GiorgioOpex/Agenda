import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ORG_SLUG = "opex-solutions";
const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate" };
const VALID_STATUS = ['client', 'busy', 'commercial', 'training'];
const VALID_HALF = ['am', 'pm'];

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

async function resolveClientId(supabase, orgId, clientName) {
  if (!clientName) return null;
  const { data } = await supabase.from('clients').select('id').eq('org_id', orgId).eq('name', clientName).single();
  return data ? data.id : null;
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// POST /api/entries — crea o aggiorna una singola mezza-giornata (upsert)
export async function POST(request) {
  const envErr = envCheck();
  if (envErr) return NextResponse.json({ error: envErr }, { status: 500, headers: HEADERS });
  try {
    const body = await request.json();
    const consultantName = body.consultantName;
    const dateKey = body.dateKey;
    const half = body.half;
    const status = body.status;
    const clientName = body.client || '';
    const note = body.note || '';

    if (!consultantName || !dateKey || !half || !status) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti: consultantName, dateKey, half, status' }, { status: 400, headers: HEADERS });
    }
    if (VALID_HALF.indexOf(half) < 0) {
      return NextResponse.json({ error: 'half deve essere "am" o "pm"' }, { status: 400, headers: HEADERS });
    }
    if (VALID_STATUS.indexOf(status) < 0) {
      return NextResponse.json({ error: 'status non valido: ' + status }, { status: 400, headers: HEADERS });
    }

    const supabase = getClient();
    const ids = await resolveOrgAndUser(supabase, consultantName);
    if (!ids) return NextResponse.json({ error: 'Consulente non trovato: ' + consultantName }, { status: 404, headers: HEADERS });

    var clientId = null;
    if (status === 'client' && clientName) {
      clientId = await resolveClientId(supabase, ids.orgId, clientName);
    }

    const { error } = await supabase.from('entries').upsert({
      org_id: ids.orgId,
      user_id: ids.userId,
      entry_date: dateKey,
      half: half,
      status: status,
      client_id: clientId,
      note: note
    }, { onConflict: 'user_id,entry_date,half' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: HEADERS });
    return NextResponse.json({ ok: true }, { status: 200, headers: HEADERS });
  } catch (e) {
    console.error('[api/entries POST]', e);
    return NextResponse.json({ error: e.message }, { status: 500, headers: HEADERS });
  }
}

// DELETE /api/entries — cancella una mezza-giornata (half="am"|"pm") o l'intera giornata (half="full")
export async function DELETE(request) {
  const envErr = envCheck();
  if (envErr) return NextResponse.json({ error: envErr }, { status: 500, headers: HEADERS });
  try {
    const body = await request.json();
    const consultantName = body.consultantName;
    const dateKey = body.dateKey;
    const half = body.half;

    if (!consultantName || !dateKey || !half) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti: consultantName, dateKey, half' }, { status: 400, headers: HEADERS });
    }

    const supabase = getClient();
    const ids = await resolveOrgAndUser(supabase, consultantName);
    if (!ids) return NextResponse.json({ error: 'Consulente non trovato: ' + consultantName }, { status: 404, headers: HEADERS });

    var q = supabase.from('entries').delete().eq('user_id', ids.userId).eq('entry_date', dateKey);
    if (half !== 'full') q = q.eq('half', half);
    const { error } = await q;

    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: HEADERS });
    return NextResponse.json({ ok: true }, { status: 200, headers: HEADERS });
  } catch (e) {
    console.error('[api/entries DELETE]', e);
    return NextResponse.json({ error: e.message }, { status: 500, headers: HEADERS });
  }
}
