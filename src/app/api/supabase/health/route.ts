import { NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to .env.local.",
      },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const projectRef = new URL(projectUrl).hostname.split(".")[0] ?? "unknown";

    return NextResponse.json({
      ok: true,
      projectRef,
      message: "Connected to Supabase.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to connect to Supabase. Confirm your project URL and publishable (or anon) key.",
      },
      { status: 500 },
    );
  }
}
