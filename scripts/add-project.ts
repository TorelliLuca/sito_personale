import fs from "fs";
import path from "path";

interface CliArgs {
  title?: string;
  description?: string;
  tags?: string;
  type?: string;
  demo?: string;
  featured?: boolean;
  github?: string;
  live?: string;
  images: string[];
  hoverImage?: string;
  apiUrl: string;
  secret?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    images: [],
    apiUrl: process.env.API_URL ?? "http://localhost:5000/api/projects",
    secret: process.env.LOCAL_API_SECRET,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    switch (token) {
      case "--title":
        args.title = argv[++i];
        break;
      case "--desc":
      case "--description":
        args.description = argv[++i];
        break;
      case "--tags":
        args.tags = argv[++i];
        break;
      case "--type":
        args.type = argv[++i];
        break;
      case "--demo":
      case "--demoSlug":
        args.demo = argv[++i];
        break;
      case "--featured":
        args.featured = true;
        break;
      case "--github":
        args.github = argv[++i];
        break;
      case "--live":
        args.live = argv[++i];
        break;
      case "--images":
        args.images.push(argv[++i]);
        break;
      case "--hover-image":
        args.hoverImage = argv[++i];
        break;
      case "--api":
        args.apiUrl = argv[++i];
        break;
      default:
        if (token.endsWith(".png") || token.endsWith(".jpg") || token.endsWith(".jpeg") || token.endsWith(".webp") || token.endsWith(".svg") || token.endsWith(".gif")) {
          args.images.push(token);
        }
        break;
    }
  }

  return args;
}

function expandImages(imagePaths: string[]): string[] {
  const resolved: string[] = [];

  for (const input of imagePaths) {
    const absolute = path.resolve(input);

    if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) {
      const files = fs
        .readdirSync(absolute)
        .filter((file) => /\.(png|jpe?g|webp|svg|gif)$/i.test(file))
        .map((file) => path.join(absolute, file));
      resolved.push(...files);
      continue;
    }

    if (input.includes("*")) {
      const dir = path.dirname(absolute);
      const pattern = path.basename(absolute).replace(/\*/g, ".*");
      const regex = new RegExp(`^${pattern}$`, "i");
      const files = fs
        .readdirSync(dir)
        .filter((file) => regex.test(file))
        .map((file) => path.join(dir, file));
      resolved.push(...files);
      continue;
    }

    resolved.push(absolute);
  }

  return resolved;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.title) {
    console.error("Usage: npm run add-project -- --title \"Titolo\" [--desc \"...\"] [--tags rl,threejs] [--type gallery|demo|hybrid] [--demo slug] [--featured] [--github url] [--live url] [--images path1 path2] [--hover-image preview.gif]");
    process.exit(1);
  }

  const images = expandImages(args.images);
  const form = new FormData();

  form.append("title", args.title);
  if (args.description) form.append("description", args.description);
  if (args.tags) form.append("tags", args.tags);
  form.append("type", args.type ?? "gallery");
  if (args.demo) form.append("demoSlug", args.demo);
  form.append("featured", String(Boolean(args.featured)));
  if (args.github) form.append("github", args.github);
  if (args.live) form.append("live", args.live);

  for (const imagePath of images) {
    const buffer = fs.readFileSync(imagePath);
    const blob = new Blob([buffer]);
    form.append("images", blob, path.basename(imagePath));
  }

  if (args.hoverImage) {
    const hoverPath = path.resolve(args.hoverImage);
    const hoverBuffer = fs.readFileSync(hoverPath);
    form.append("hoverImage", new Blob([hoverBuffer]), path.basename(hoverPath));
  }

  const headers: Record<string, string> = {};
  if (args.secret) {
    headers.Authorization = `Bearer ${args.secret}`;
  }

  const response = await fetch(args.apiUrl, {
    method: "POST",
    headers,
    body: form,
  });

  const payload = await response.json();

  if (!response.ok) {
    console.error("Errore:", payload);
    process.exit(1);
  }

  console.log("Progetto creato:");
  console.log(`- slug: ${payload.slug}`);
  console.log(`- url: ${payload.url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
