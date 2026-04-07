import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const BLOB_NAME = "agenda-opex-data.json";
const EMPTY = { consultants: [], clients: [], clientBudgets: {}, clientEndDates: {}, entries: {}, admins: [], targetMensile: 0 };

async function readData() {
  try {
    const result = await list({ prefix: BLOB_NAME });
    if (!result.blobs || result.blobs.length === 0) return { ...EMPTY };
    const response = await fetch(result.blobs[0].url, { cache: "no-store" });
    if (!response.ok) return { ...EMPTY };
    const data = await response.json();
    return { ...EMPTY, ...data };
  } catch (e) {
    console.error("Read error:", e);
    return { ...EMPTY };
  }
}

async function writeData(data) {
  const json = JSON.stringify(data);
  await put(BLOB_NAME, json, { access: "public", addRandomSuffix: false, contentType: "application/json" });
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const data = await readData();
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (e) { return NextResponse.json(EMPTY); }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await readData();
    if (body.consultants !== undefined) db.consultants = body.consultants;
    if (body.clients !== undefined) db.clients = body.clients;
    if (body.clientBudgets !== undefined) db.clientBudgets = body.clientBudgets;
    if (body.clientEndDates !== undefined) db.clientEndDates = body.clientEndDates;
    if (body.entries !== undefined) db.entries = body.entries;
    if (body.admins !== undefined) db.admins = body.admins;
    if (body.targetMensile !== undefined) db.targetMensile = body.targetMensile;
    await writeData(db);
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); }
}

