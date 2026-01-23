import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client (Server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create unique filename: timestamp_sanitized-name
    const filename = `${Date.now()}_${file.name.replaceAll(" ", "_")}`;

    // Upload to Supabase 'techstorm-public' bucket
    const { data, error } = await supabase
      .storage
      .from("techstorm-public")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      throw error;
    }

    // Construct Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from("techstorm-public")
      .getPublicUrl(filename);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });

  } catch (error) {
    console.error("Upload handler error: ", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}