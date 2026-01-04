// lib/github-service.ts

// These should be in your .env.local file, but can be hardcoded for testing if needed
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN; 
const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER || "xusanboyman22-gif";
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || "v0-book-reading-app";
const BRANCH = "main";

export interface GithubFileParams {
  path: string;
  content: string | ArrayBuffer;
  message: string;
  isBinary?: boolean;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function utf8_to_b64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export async function uploadToGithub({ path, content, message, isBinary = false }: GithubFileParams) {
  if (!GITHUB_TOKEN) {
    throw new Error("GitHub Token is missing. Please add NEXT_PUBLIC_GITHUB_TOKEN to your .env.local file.");
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  // 1. Check if file exists (to get SHA for update)
  let sha: string | undefined;
  try {
    const existing = await fetch(url, {
      headers: { 
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json"
      },
      cache: "no-store"
    });
    
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }
  } catch (e) {
    console.log("File checking error (might be new file):", e);
  }

  // 2. Prepare content
  let contentBase64 = "";
  if (isBinary && content instanceof ArrayBuffer) {
    contentBase64 = arrayBufferToBase64(content);
  } else if (typeof content === "string") {
    contentBase64 = utf8_to_b64(content);
  }

  // 3. Upload
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: BRANCH,
      sha // Include SHA if updating existing file
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub Error: ${errorText}`);
  }

  return await response.json();
}
