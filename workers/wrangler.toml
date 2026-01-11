export interface Env {
  GITHUB_TOKEN_BOT: string;         // Fine-grained PAT（Repo: Contents RW / PR RW / Metadata R）
  GITHUB_REPO_SLUG: string;         // 例: "<OWNER>/lumina-bulige-dev"
  CORS_ORIGIN?: string;             // 例: "https://app.luminabulige.com"
}

function json(data: unknown, status = 200, cors?: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...(cors ? { "access-control-allow-origin": cors, "vary": "origin" } : {}),
    },
  });
}

export default {
  async fetch(req: Request, env: Env) {
    const { pathname } = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": env.CORS_ORIGIN || "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "*",
        },
      });
    }

    if (pathname === "/bot/create-pr" && req.method === "POST") {
      const token = env.GITHUB_TOKEN_BOT;
      const repo = env.GITHUB_REPO_SLUG;
      const { title, body, base = "main", head } = await req.json<any>();
      if (!title || !head) return json({ error: "title/head is required" }, 400, env.CORS_ORIGIN);

      const r = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
        method: "POST",
        headers: {
          "authorization": `Bearer ${token}`,
          "accept": "application/vnd.github+json",
          "user-agent": "luminabulige-bot",
        },
        body: JSON.stringify({ title, body, base, head })
      });

      const txt = await r.text();
      try { return new Response(txt, { status: r.status, headers: { "content-type": "application/json" } }); }
      catch { return new Response(txt, { status: r.status }); }
    }

    // サンプル: 1ファイルを新規コミットしてPRまで作る（簡易版）
    if (pathname === "/bot/commit-and-pr" && req.method === "POST") {
      const token = env.GITHUB_TOKEN_BOT;
      const repo = env.GITHUB_REPO_SLUG;
      const { path, content, message, pr_title, base = "main", branch } = await req.json<any>();
      if (!path || !content || !message || !pr_title) return json({ error: "path/content/message/pr_title required" }, 400, env.CORS_ORIGIN);
      const head = branch || `bot/${Date.now()}`;

      // 1) baseの最新SHA
      const baseRef = await fetch(`https://api.github.com/repos/${repo}/git/ref/heads/${base}`, {
        headers: { "authorization": `Bearer ${token}`, "accept": "application/vnd.github+json" }
      }).then(r => r.json());
      const baseSha = baseRef.object?.sha;

      // 2) 新規ブランチ作成
      await fetch(`https://api.github.com/repos/${repo}/git/refs`, {
        method: "POST",
        headers: { "authorization": `Bearer ${token}`, "accept": "application/vnd.github+json" },
        body: JSON.stringify({ ref: `refs/heads/${head}`, sha: baseSha })
      });

      // 3) Contents APIで1ファイル追加
      const put = await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`, {
        method: "PUT",
        headers: { "authorization": `Bearer ${token}`, "accept": "application/vnd.github+json" },
        body: JSON.stringify({
          message,
          content: btoa(unescape(encodeURIComponent(content))), // utf8 -> base64
          branch: head
        })
      });
      if (!put.ok) return json({ error: await put.text() }, put.status, env.CORS_ORIGIN);

      // 4) PR作成
      const pr = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
        method: "POST",
        headers: { "authorization": `Bearer ${token}`, "accept": "application/vnd.github+json" },
        body: JSON.stringify({ title: pr_title, body: message, head, base })
      }).then(r => r.json());

      return json(pr, 201, env.CORS_ORIGIN);
    }

    return json({ ok: true, msg: "luminabulige bot online" }, 200, env.CORS_ORIGIN);
  }
} satisfies ExportedHandler<Env>;
