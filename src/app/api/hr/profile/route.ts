import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const jobTitle = formData.get('jobTitle') as string;
    const file = formData.get('file') as File;

    if (!jobTitle || !file) {
      return NextResponse.json(
        { error: 'Missing job title or file' },
        { status: 400 }
      );
    }

    // TODO: VALIDATION (Optional but recommended)
    // 1. Check file size (again, for security)
    // 2. Check file type (again)

    // TODO: DATABASE & STORAGE LOGIC
    // 1. Upload `file` to S3 / Blob Storage -> Get URL (e.g., "https://s3.../jd.pdf")
    // 2. Save `jobTitle` and `fileUrl` to your database (e.g., Postgres/Prisma)
    //    const job = await prisma.job.create({ data: { title: jobTitle, jdUrl: url } })

    // Simulate a delay to show loading state on the frontend
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Saved Job:', jobTitle, file.name);

    return NextResponse.json({ success: true, message: 'Profile saved' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}