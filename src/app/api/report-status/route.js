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

async function getOrgId(supabase) {
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', ORG_SLUG).single();
  return org ? org.id : null;
}

async function resolveOrgAndUser(supabase, consultantName) {
  const orgId = await getOrgId(supabase);
  if (!orgId) return null;
  const { data: user } = await supabase.from('users').select('id').eq('org_id', orgId).eq('name', consultantName).single();
  if (!user) return null;
  return { orgId: orgId, userId: user.id };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/report-status?year=YYYY&month=M — stato "report generato" di tutti i consulenti per il mese (month 0-based, coerente con lo stato interno del frontend)
export async function GET(request) {
  const envErr = envCheck();
  if (envErr) return NextResponse.json({ error: envErr }, { status: 500, headers: HEADERS });
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year'), 10);
    const month = parseInt(searchParams.get('month'), 10);
    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json({ error: 'Parametri year/month mancanti o non validi' }, { status: 400, headers: HEADERS });
    }

    const supabase = getClient();
    const orgId = await getOrgId(supabase);
    if (!orgId) return NextResponse.json({ error: 'Organizzazione non trovata' }, { status: 404, headers: HEADERS });

    const { data: users } = await supabase.from('users').select('id, name').eq('org_id', orgId).eq('role', 'consultant');
    const { data: statusRows } = await supabase.from('report_status').select('user_id, generated_at').eq('org_id', orgId).eq('year', year).eq('month', month);

    var generatedByUserId = {};
    (statusRows || []).forEach(function (r) { generatedByUserId[r.user_id] = r.generated_at; });

    var result = (users || []).map(function (u) {
      return { consultantName: u.name, generatedAt: generatedByUserId[u.id] || null };
    });

    return NextResponse.json({ statuses: result }, { status: 200, headers: HEADERS });
  } catch (e) {
    console.error('[api/report-status GET]', e);
    return NextResponse.json({ error: e.message }, { status: 500, headers: HEADERS });
  }
}

// POST /api/report-status — segna il report come generato per un consulente/mese (upsert)
export async function POST(request) {
  const envErr = envCheck();
  if (envErr) return NextResponse.json({ error: envErr }, { status: 500, headers: HEADERS });
  try {
    const body = await request.json();
    const consultantName = body.consultantName;
    const year = parseInt(body.year, 10);
    const month = parseInt(body.month, 10);

    if (!consultantName || isNaN(year) || isNaN(month)) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti: consultantName, year, month' }, { status: 400, headers: HEADERS });
    }

    const supabase = getClient();
    const ids = await resolveOrgAndUser(supabase, consultantName);
    if (!ids) return NextResponse.json({ error: 'Consulente non trovato: ' + consultantName }, { status: 404, headers: HEADERS });

    const { error } = await supabase.from('report_status').upsert({
      org_id: ids.orgId,
      user_id: ids.userId,
      year: year,
      month: month,
      generated_at: new Date().toISOString()
    }, { onConflict: 'user_id,year,month' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: HEADERS });
    return NextResponse.json({ ok: true }, { status: 200, headers: HEADERS });
  } catch (e) {
    console.error('[api/report-status POST]', e);
    return NextResponse.json({ error: e.message }, { status: 500, headers: HEADERS });
  }
}
