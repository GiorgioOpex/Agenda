import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE) {
  console.error("[api/first-login] Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE) {
    return NextResponse.json({ ok: false, error: "Configurazione server incompleta" }, { status: 500, headers: HEADERS });
  }
  try {
    const body = await req.json();
    const authId = body.authId;
    if (!authId) {
      return NextResponse.json({ ok: false, error: "Missing authId" }, { status: 400, headers: HEADERS });
    }

    // Recupera lo stato attuale per non sovrascrivere privacy_accepted_at se gia' valorizzato
    const { data: existing, error: selErr } = await supabaseAdmin
      .from('users')
      .select('privacy_accepted_at, must_change_password')
      .eq('auth_id', authId)
      .single();

    if (selErr || !existing) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404, headers: HEADERS });
    }

    const updateData = { must_change_password: false };
    if (!existing.privacy_accepted_at) {
      updateData.privacy_accepted_at = new Date().toISOString();
    }

    const { error: updErr } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('auth_id', authId);

    if (updErr) {
      return NextResponse.json({ ok: false, error: updErr.message }, { status: 500, headers: HEADERS });
    }

    return NextResponse.json({ ok: true }, { headers: HEADERS });
  } catch (e) {
    console.error("first-login error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500, headers: HEADERS });
  }
}
