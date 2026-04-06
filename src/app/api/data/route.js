import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "db.json");

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ consultants: [], clients: [], entries: {}, admins: [] }));
  }
}

function readDB() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeDB(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readDB();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ consultants: [], clients: [], entries: {}, admins: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = readDB();

    if (body.consultants !== undefined) db.consultants = body.consultants;
    if (body.clients !== undefined) db.clients = body.clients;
    if (body.entries !== undefined) db.entries = body.entries;
    if (body.admins !== undefined) db.admins = body.admins;

    writeDB(db);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
