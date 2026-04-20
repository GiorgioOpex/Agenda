import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://shgxypwmaxloyzemdbcw.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ3h5cHdtYXhsb3l6ZW1kYmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDI0MzEsImV4cCI6MjA5MjI3ODQzMX0.rxx8scqTZw2-c5xHslxXKOJJpR59IjPoMx5gzlHUWXQ'
);

const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate" };
const ORG_SLUG = "opex-solutions";

async function getOrgId() {
  const { data } = await supabase.from('organizations').select('id').eq('slug', ORG_SLUG).single();
  return data ? data.id : null;
}

async function readData() {
  const orgId = await getOrgId();
  if (!orgId) return null;

  // Users (consultants)
  const { data: users } = await supabase.from('users').select('*').eq('org_id', orgId).eq('role', 'consultant');
  const { data: admins } = await supabase.from('users').select('*').eq('org_id', orgId).eq('role', 'admin');
  const { data: clients } = await supabase.from('clients').select('*').eq('org_id', orgId);
  const { data: entries } = await supabase.from('entries').select('*, client:clients(name)').eq('org_id', orgId);
  const { data: settings } = await supabase.from('settings').select('*').eq('org_id', orgId).single();

  // Transform to legacy format
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

  // Build entries in legacy format: { "CONSULTANT_NAME": { "2026-04-08": { am: {...}, pm: {...} } } }
  var entryMap = {};
  (entries || []).forEach(function(e) {
    var userName = null;
    // Find user name by user_id
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
    targetMensile: settings ? settings.target_monthly : 0
  };
}

async function writeData(body) {
  const orgId = await getOrgId();
  if (!orgId) return false;

  // Save consultants
  if (body.consultants !== undefined) {
    const { data: existing } = await supabase.from('users').select('name, email').eq('org_id', orgId).eq('role', 'consultant');
    var existingNames = (existing || []).map(function(u) { return u.name; });
    var newNames = body.consultants || [];
    var emails = body.consultantEmails || {};

    // Delete removed consultants
    for (var i = 0; i < existingNames.length; i++) {
      if (newNames.indexOf(existingNames[i]) < 0) {
        await supabase.from('users').delete().eq('org_id', orgId).eq('name', existingNames[i]).eq('role', 'consultant');
      }
    }
    // Add/update consultants
    for (var j = 0; j < newNames.length; j++) {
      var n = newNames[j];
      if (existingNames.indexOf(n) < 0) {
        await supabase.from('users').insert({ org_id: orgId, name: n, email: emails[n] || '', role: 'consultant' });
      } else {
        if (emails[n]) {
          await supabase.from('users').update({ email: emails[n] }).eq('org_id', orgId).eq('name', n).eq('role', 'consultant');
        }
      }
    }
  }

  // Save clients
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
      var upsertData = { org_id: orgId, name: c, budget_monthly: budgets[c] || 0, contract_end: endDates[c] || null };
      if (existingClients.indexOf(c) < 0) {
        await supabase.from('clients').insert(upsertData);
      } else {
        await supabase.from('clients').update({ budget_monthly: budgets[c] || 0, contract_end: endDates[c] || null }).eq('org_id', orgId).eq('name', c);
      }
    }
  }

  // Save settings
  if (body.targetMensile !== undefined) {
    const { data: existing } = await supabase.from('settings').select('id').eq('org_id', orgId).single();
    if (existing) {
      await supabase.from('settings').update({ target_monthly: body.targetMensile }).eq('org_id', orgId);
    } else {
      await supabase.from('settings').insert({ org_id: orgId, target_monthly: body.targetMensile });
    }
  }

  // Save admins
  if (body.admins !== undefined) {
    const { data: existingAdmins } = await supabase.from('users').select('name').eq('org_id', orgId).eq('role', 'admin');
    var existingAdminNames = (existingAdmins || []).map(function(a) { return a.name; });
    var newAdmins = body.admins || [];
    var newAdminNames = newAdmins.map(function(a) { return a.name; });

    // Delete removed admins
    for (var ia = 0; ia < existingAdminNames.length; ia++) {
      if (newAdminNames.indexOf(existingAdminNames[ia]) < 0) {
        await supabase.from('users').delete().eq('org_id', orgId).eq('name', existingAdminNames[ia]).eq('role', 'admin');
      }
    }
    // Add/update admins
    for (var ja = 0; ja < newAdmins.length; ja++) {
      var adm = newAdmins[ja];
      if (existingAdminNames.indexOf(adm.name) < 0) {
        await supabase.from('users').insert({ org_id: orgId, name: adm.name, email: adm.email || '', role: 'admin', pass_hash: adm.passHash || '' });
      } else {
        await supabase.from('users').update({ pass_hash: adm.passHash || '' }).eq('org_id', orgId).eq('name', adm.name).eq('role', 'admin');
      }
    }
  }

  // Save entries
  if (body.entries !== undefined) {
    const { data: allUsers } = await supabase.from('users').select('id, name').eq('org_id', orgId);
    const { data: allClients } = await supabase.from('clients').select('id, name').eq('org_id', orgId);
    var userMap = {};
    (allUsers || []).forEach(function(u) { userMap[u.name] = u.id; });
    var clientMap = {};
    (allClients || []).forEach(function(c) { clientMap[c.name] = c.id; });

    // Delete all entries for this org and rebuild
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
              org_id: orgId,
              user_id: userId,
              entry_date: dateStr,
              half: half,
              status: day[half].status,
              client_id: day[half].client ? clientMap[day[half].client] || null : null,
              note: day[half].note || ''
            });
          }
        });
      });
    });

    // Insert in batches of 500
    for (var b = 0; b < inserts.length; b += 500) {
      var batch = inserts.slice(b, b + 500);
      await supabase.from('entries').insert(batch);
    }
  }

  return true;
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const data = await readData();
    if (!data) return NextResponse.json({}, { status: 500 });
    return new NextResponse(JSON.stringify(data), { status: 200, headers: HEADERS });
  } catch (e) {
    console.error("GET error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const ok = await writeData(body);
    return new NextResponse(JSON.stringify({ ok }), { status: 200, headers: HEADERS });
  } catch (e) {
    console.error("POST error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
