const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
};

if (req.method === "OPTIONS") return new Response(null, { headers: cors });

return new Response(JSON.stringify(...), { headers: { ...cors, "content-type": "application/json; charset=utf-8" }});
