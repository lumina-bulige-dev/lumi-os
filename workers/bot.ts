- const { title, body, base = "main", head } = await req.json<any>();
+ const { title, body, base = "main", head } =
+   (await req.json()) as { title?: string; body?: string; base?: string; head?: string };

...

- const { path, content, message, pr_title, base = "main", branch } = await req.json<any>();
+ const { path, content, message, pr_title, base = "main", branch } =
+   (await req.json()) as {
+     path?: string; content?: string; message?: string; pr_title?: string; base?: string; branch?: string;
+   };
