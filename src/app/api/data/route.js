import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const BLOB_NAME = "agenda-opex-data.json";

async function readData() {
  try {
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (blobs.length === 0) return { consultants: [], clients: [], entries: {}, admins: [] };
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("Read error:", e);
    return { consultants: [], clients: [], entries: {}, admins: [] };
  }
}

async function writeData(data) {
  await put(BLOB_NAME, JSON.stringify(data), { access: "public", addRandomSuffix: false });
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await readData();
    if (body.consultants !== undefined) db.consultants = body.consultants;
    if (body.clients !== undefined) db.clients = body.clients;
    if (body.entries !== undefined) db.entries = body.entries;
    if (body.admins !== undefined) db.admins = body.admins;
    await writeData(db);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
