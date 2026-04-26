import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_SERVICE) {
  console.error("[api/data] Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate" };
const ORG_SLUG = "opex-solutions";

function envCheck() {
  if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_SERVICE) {
    return "Configurazione server incompleta: variabili d'ambiente Supabase mancanti";
  }
  return null;
}

async function getOrgId() {
  const { data } = await supabase.from('organizations').select('id').eq('slug', ORG_SLUG).single();
  return data ? data.id : null;
}

async function readData() {
  const orgId = await getOrgId();
  if (!orgId) return null;

  const { data: users } = await supabase.from('users').select('*').eq('org_id', orgId).eq('role', 'consultant');
  const { data: admins } = await supabase.from('users').select('*').eq('org_id', orgId).eq('role', 'admin');
  const { data: clients } = await supabase.from('clients').select('*').eq('org_id', orgId);
  const { data: entries } = await supabase.from('entries').select('*, client:clients(name)').eq('org_id', orgId);
  const { data: settings } = await supabase.from('settings').select('*').eq('org_id', orgId).single();

  var consultants = (users || []).map(function(u) { return u.name; });
  var consultantEmails = {};
  (users || []).forEach(function(u) { consultantEmails[u.name] = u.email; });
  var clientNames = (clients || []).map(function(c) { return c.name; });
  var clientBudgets = {};
  var clientEndDates = {};
  (clients || []).forEach(function(c) {
    clientBudgets[c.name] = c.budget_monthly || 0;
    clientEndDates[c.name] = c.contract_end || "";
  });
  var adminList = (admins || []).map(function(a) { return { name: a.name, email: a.email, passHash: a.pass_hash || '', auth_id: a.auth_id }; });

  // Flag di sicurezza per il flusso "primo accesso"
  var userFlags = {};
  (users || []).concat(admins || []).forEach(function(u) {
    userFlags[u.name] = {
      mustChangePassword: u.must_change_password === true,
      privacyAccepted: u.privacy_accepted_at !== null && u.privacy_accepted_at !== undefined
    };
  });

  var entryMap = {};
  (entries || []).forEach(function(e) {
    var userName = null;
    var allUsers = (users || []).concat(admins || []);
    for (var i = 0; i < allUsers.length; i++) {
      if (allUsers[i].id === e.user_id) { userName = allUsers[i].name; break; }
    }
    if (!userName) return;
    if (!entryMap[userName]) entryMap[userName] = {};
    var dateStr = e.entry_date;
    if (!entryMap[userName][dateStr]) entryMap[userName][dateStr] = {};
    entryMap[userName][dateStr][e.half] = {
      status: e.status,
      client: e.client ? e.client.name : "",
      note: e.note || ""
    };
  });

  return {
    consultants: consultants,
    clients: clientNames,
    clientBudgets: clientBudgets,
    clientEndDates: clientEndDates,
    consultantEmails: consultantEmails,
    entries: entryMap,
    admins: adminList,
    targetMensile: settings ? settings.target_monthly : 0,
    userFlags: userFlags
  };
}

async function createOrUpdateAuthUser(email, password) {
  email = email.toLowerCase().trim();
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  var found = null;
  if (existingUsers && existingUsers.users) {
    for (var i = 0; i < existingUsers.users.length; i++) {
      if (existingUsers.users[i].email === email) { found = existingUsers.users[i]; break; }
    }
  }
  if (found) {
    if (password) {
      await supabaseAdmin.auth.admin.updateUserById(found.id, { password: password });
    }
    return found.id;
  } else {
    var pwd = password || 'Opex2026';
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email, password: pwd, email_confirm: true
    });
    if (error) { console.error("Auth create error:", error); return null; }
    return data.user.id;
  }
}

async function writeData(body) {
  const orgId = await getOrgId();
  if (!orgId) return false;

  if (body.consultants !== undefined) {
    const { data: existing } = await supabase.from('users').select('name, email').eq('org_id', orgId).eq('role', 'consultant');
    var existingNames = (existing || []).map(function(u) { return u.name; });
    var newNames = body.consultants || [];
    var emails = body.consultantEmails || {};
    var passwords = body.consultantPasswords || {};

    for (var i = 0; i < existingNames.length; i++) {
      if (newNames.indexOf(existingNames[i]) < 0) {
        await supabase.from('users').delete().eq('org_id', orgId).eq('name', existingNames[i]).eq('role', 'consultant');
      }
    }
    for (var j = 0; j < newNames.length; j++) {
      var n = newNames[j];
      var em = emails[n] || '';
      if (existingNames.indexOf(n) < 0) {
        var authId = null;
        if (em) authId = await createOrUpdateAuthUser(em, passwords[n] || null);
        // Nuovo utente: must_change_password = TRUE per forzare il primo accesso
        await supabase.from('users').insert({ org_id: orgId, name: n, email: em, role: 'consultant', auth_id: authId, must_change_password: true });
      } else {
        if (em) {
          await supabase.from('users').update({ email: em }).eq('org_id', orgId).eq('name', n).eq('role', 'consultant');
          if (passwords[n]) await createOrUpdateAuthUser(em, passwords[n]);
        }
      }
    }
  }

  if (body.clients !== undefined) {
    const { data: existing } = await supabase.from('clients').select('name').eq('org_id', orgId);
    var existingClients = (existing || []).map(function(c) { return c.name; });
    var newClients = body.clients || [];
    var budgets = body.clientBudgets || {};
    var endDates = body.clientEndDates || {};

    for (var i2 = 0; i2 < existingClients.length; i2++) {
      if (newClients.indexOf(existingClients[i2]) < 0) {
        await supabase.from('clients').delete().eq('org_id', orgId).eq('name', existingClients[i2]);
      }
    }
    for (var j2 = 0; j2 < newClients.length; j2++) {
      var c = newClients[j2];
      if (existingClients.indexOf(c) < 0) {
        await supabase.from('clients').insert({ org_id: orgId, name: c, budget_monthly: budgets[c] || 0, contract_end: endDates[c] || null });
      } else {
        await supabase.from('clients').update({ budget_monthly: budgets[c] || 0, contract_end: endDates[c] || null }).eq('org_id', orgId).eq('name', c);
      }
    }
  }

  if (body.targetMensile !== undefined) {
    const { data: existing } = await supabase.from('settings').select('id').eq('org_id', orgId).single();
    if (existing) {
      await supabase.from('settings').update({ target_monthly: body.targetMensile }).eq('org_id', orgId);
    } else {
      await supabase.from('settings').insert({ org_id: orgId, target_monthly: body.targetMensile });
    }
  }

  if (body.admins !== undefined) {
    const { data: existingAdmins } = await supabase.from('users').select('name').eq('org_id', orgId).eq('role', 'admin');
    var existingAdminNames = (existingAdmins || []).map(function(a) { return a.name; });
    var newAdmins = body.admins || [];
    var newAdminNames = newAdmins.map(function(a) { return a.name; });

    for (var ia = 0; ia < existingAdminNames.length; ia++) {
      if (newAdminNames.indexOf(existingAdminNames[ia]) < 0) {
        await supabase.from('users').delete().eq('org_id', orgId).eq('name', existingAdminNames[ia]).eq('role', 'admin');
      }
    }
    for (var ja = 0; ja < newAdmins.length; ja++) {
      var adm = newAdmins[ja];
      if (existingAdminNames.indexOf(adm.name) < 0) {
        var admAuthId = null;
        if (adm.email) admAuthId = await createOrUpdateAuthUser(adm.email, adm.password || null);
        // Nuovo admin: must_change_password = TRUE
        await supabase.from('users').insert({ org_id: orgId, name: adm.name, email: adm.email || '', role: 'admin', auth_id: admAuthId, pass_hash: adm.passHash || '', must_change_password: true });
      } else {
        var updateData = { pass_hash: adm.passHash || '' };
        if (adm.email) updateData.email = adm.email;
        await supabase.from('users').update(updateData).eq('org_id', orgId).eq('name', adm.name).eq('role', 'admin');
        if (adm.email && adm.password) await createOrUpdateAuthUser(adm.email, adm.password);
      }
    }
  }

  if (body.entries !== undefined) {
    const { data: allUsers } = await supabase.from('users').select('id, name').eq('org_id', orgId);
    const { data: allClients } = await supabase.from('clients').select('id, name').eq('org_id', orgId);
    var userMap = {};
    (allUsers || []).forEach(function(u) { userMap[u.name] = u.id; });
    var clientMap = {};
    (allClients || []).forEach(function(c) { clientMap[c.name] = c.id; });

    await supabase.from('entries').delete().eq('org_id', orgId);

    var inserts = [];
    var entryData = body.entries || {};
    Object.keys(entryData).forEach(function(userName) {
      var userId = userMap[userName];
      if (!userId) return;
      var days = entryData[userName];
      Object.keys(days).forEach(function(dateStr) {
        var day = days[dateStr];
        ['am', 'pm'].forEach(function(half) {
          if (day[half] && day[half].status) {
            inserts.push({
              org_id: orgId, user_id: userId, entry_date: dateStr, half: half,
              status: day[half].status,
              client_id: day[half].client ? clientMap[day[half].client] || null : null,
              note: day[half].note || ''
            });
          }
        });
      });
    });

    for (var b = 0; b < inserts.length; b += 500) {
      await supabase.from('entries').insert(inserts.slice(b, b + 500));
    }
  }

  return true;
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const envErr = envCheck();
  if (envErr) return NextResponse.json({ error: envErr }, { status: 500, headers: HEADERS });
  try {
    const data = await readData();
    if (!data) return NextResponse.json({}, { status: 500, headers: HEADERS });
    return new NextResponse(JSON.stringify(data), { status: 200, headers: HEADERS });
  } catch (e) {
    console.error("GET error:", e);
    return NextResponse.json({ error: e.message }, { status: 500, headers: HEADERS });
  }
}

export async function POST(request) {
  const envErr = envCheck();
  if (envErr) return NextResponse.json({ ok: false, error: envErr }, { status: 500, headers: HEADERS });
  try {
    const body = await request.json();
    console.log("POST body keys:", Object.keys(body));
    console.log("POST consultants:", body.consultants);
    console.log("POST emails:", body.consultantEmails);
    const ok = await writeData(body);
    return new NextResponse(JSON.stringify({ ok }), { status: 200, headers: HEADERS });
  } catch (e) {
    console.error("POST error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500, headers: HEADERS });
  }
}
