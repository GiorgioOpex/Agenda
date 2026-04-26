import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_SERVICE) {
  console.error("[api/admin-reset-password] Missing Supabase env vars");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const ORG_SLUG = "opex-solutions";
const DEFAULT_PASSWORD = "Opex2026";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_SERVICE) {
    return NextResponse.json({ ok: false, error: "Configurazione server incompleta" }, { status: 500, headers: HEADERS });
  }
  try {
    const body = await req.json();
    const userName = body.userName;
    if (!userName) {
      return NextResponse.json({ ok: false, error: "Missing userName" }, { status: 400, headers: HEADERS });
    }

    const { data: org } = await supabase.from('organizations').select('id').eq('slug', ORG_SLUG).single();
    if (!org) {
      return NextResponse.json({ ok: false, error: "Organizzazione non trovata" }, { status: 500, headers: HEADERS });
    }

    const { data: user } = await supabase
      .from('users')
      .select('email, auth_id')
      .eq('org_id', org.id)
      .eq('name', userName)
      .single();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Utente non trovato" }, { status: 404, headers: HEADERS });
    }
    if (!user.email) {
      return NextResponse.json({ ok: false, error: "L'utente non ha un indirizzo email associato" }, { status: 400, headers: HEADERS });
    }

    // Reset password Supabase Auth
    if (user.auth_id) {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(user.auth_id, { password: DEFAULT_PASSWORD });
      if (authErr) {
        return NextResponse.json({ ok: false, error: authErr.message }, { status: 500, headers: HEADERS });
      }
    } else {
      return NextResponse.json({ ok: false, error: "Utente senza account Auth associato" }, { status: 400, headers: HEADERS });
    }

    // Forza il primo accesso al prossimo login (privacy NON resettata)
    const { error: updErr } = await supabase
      .from('users')
      .update({ must_change_password: true })
      .eq('org_id', org.id)
      .eq('name', userName);

    if (updErr) {
      return NextResponse.json({ ok: false, error: updErr.message }, { status: 500, headers: HEADERS });
    }

    return NextResponse.json({ ok: true, defaultPassword: DEFAULT_PASSWORD }, { headers: HEADERS });
  } catch (e) {
    console.error("admin-reset-password error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500, headers: HEADERS });
  }
}
