import { NextRequest, NextResponse } from "next/server";

// MOCK UPLOAD HANDLER (Frontend-Only Mode)
// Since we are running in "No Backend" mode on Vercel, we simulate a successful upload.
// In a real production scenario, this would connect to S3, Cloudinary, or Supabase.

export async function POST(req: NextRequest) {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log that we received a request (for debugging)
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }
    
    console.log(`[MOCK UPLOAD] Simulating upload for file: ${file.name}`);

    // Return a random placeholder image to simulate a successful upload
    // Using a reliable placeholder service
    const mockUrl = `https://images.unsplash.com/photo-1531297425939-a5c988b0a94b?auto=format&fit=crop&w=800&q=80`;

    return NextResponse.json({ 
      success: true, 
      url: mockUrl 
    });

  } catch (error) {
    console.error("Upload handler error: ", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}