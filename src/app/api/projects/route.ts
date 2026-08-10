import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { isVideoSrc } from "@/lib/project-media";
import { slugify } from "@/lib/slug";
import type { Project, ProjectImage, ProjectType } from "@/lib/types/project";

const VALID_TYPES: ProjectType[] = ["gallery", "demo", "hybrid"];

function isAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const secret = process.env.LOCAL_API_SECRET;
  if (!secret) {
    return false;
  }

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function generateBlur(buffer: Buffer): Promise<string> {
  const resized = await sharp(buffer)
    .resize(10, 10, { fit: "inside" })
    .jpeg({ quality: 40 })
    .toBuffer();

  return `data:image/jpeg;base64,${resized.toString("base64")}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const description = String(formData.get("description") ?? "").trim();
    const tagsRaw = String(formData.get("tags") ?? "");
    const type = String(formData.get("type") ?? "gallery") as ProjectType;
    const demoSlug = String(formData.get("demoSlug") ?? "").trim() || null;
    const featured = String(formData.get("featured") ?? "false") === "true";
    const github = String(formData.get("github") ?? "").trim() || null;
    const live = String(formData.get("live") ?? "").trim() || null;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }

    const slug = slugify(title);
    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const imageEntries = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const hoverImageEntry = formData.get("hoverImage");
    const hoverImageFile =
      hoverImageEntry instanceof File && hoverImageEntry.size > 0
        ? hoverImageEntry
        : null;

    const projectDir = path.join(process.cwd(), "public/projects", slug);
    await fs.mkdir(projectDir, { recursive: true });

    const images: ProjectImage[] = [];

    for (let index = 0; index < imageEntries.length; index++) {
      const file = imageEntries[index];
      const extension = path.extname(file.name) || ".png";
      const filename = `${String(index + 1).padStart(2, "0")}${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const outputPath = path.join(projectDir, filename);

      await fs.writeFile(outputPath, buffer);

      const src = `/projects/${slug}/${filename}`;
      const entry: ProjectImage = {
        src,
        alt: `${title} - ${index + 1}`,
      };
      if (!isVideoSrc(src)) {
        entry.blurDataURL = await generateBlur(buffer);
      }
      images.push(entry);
    }

    if (hoverImageFile && images.length > 0) {
      const hoverExtension = path.extname(hoverImageFile.name) || ".gif";
      const hoverFilename = `hover${hoverExtension}`;
      const hoverBuffer = Buffer.from(await hoverImageFile.arrayBuffer());
      await fs.writeFile(path.join(projectDir, hoverFilename), hoverBuffer);
      images[0].hoverSrc = `/projects/${slug}/${hoverFilename}`;
    }

    const project: Project = {
      slug,
      title,
      description,
      tags,
      type,
      demoSlug,
      featured,
      images,
      roadmap: [],
      links: { github, live },
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const contentDir = path.join(process.cwd(), "content/projects");
    await fs.mkdir(contentDir, { recursive: true });
    await fs.writeFile(
      path.join(contentDir, `${slug}.json`),
      JSON.stringify(project, null, 2),
      "utf8"
    );

    return NextResponse.json({
      slug,
      url: `/projects/${slug}`,
      project,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
