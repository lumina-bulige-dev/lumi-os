 function badgeStyle(result: Result) {
-  switch (result) {
-    case "OK":
-      return { color: ui.color.ok, background: ui.color.okBg, border: `1px solid #A7F3D0` };
-    case "NG":
-      return { color: ui.color.ng, background: ui.color.ngBg, border: `1px solid #FED7AA` };
-    case "REVOKED":
-      return { color: ui.color.rev, background: ui.color.revBg, border: `1px solid #FECACA` };
-    case "UNKNOWN":
-      return { color: ui.color.unk, background: ui.color.unkBg, border: `1px solid ${ui.color.border}` };
-  }
+  const palette = {
+    OK:      { color: ui.color.ok,        bg: ui.color.okBg,                    br: "#A7F3D0" },
+    NG:      { color: "#F97316",          bg: "rgba(251,146,60,0.16)",         br: "#FED7AA" },
+    REVOKED: { color: "#EF4444",          bg: "rgba(239,68,68,0.16)",          br: "#FECACA" },
+    UNKNOWN: { color: "#94A3B8",          bg: "rgba(148,163,184,0.16)",        br: ui.color.border },
+  } as const;
+  const p = palette[result];
+  return { color: p.color, background: p.bg, border: `1px solid ${p.br}` };
 }
