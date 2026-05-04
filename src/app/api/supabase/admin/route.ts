import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const adminEndpointSecret = process.env.ADMIN_ENDPOINT_SECRET;
  const provided = req.headers.get("x-admin-secret");

  if (!adminEndpointSecret) {
    return NextResponse.json(
      { ok: false, message: "Server admin endpoint not configured. Set ADMIN_ENDPOINT_SECRET in env." },
      { status: 500 },
    );
  }

  if (provided !== adminEndpointSecret) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { table, rows } = body as { table?: string; rows?: any[] };

    if (!table || !rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Invalid payload: provide `table` and non-empty `rows`." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from(table).insert(rows);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message ?? String(err) }, { status: 500 });
  }
}
