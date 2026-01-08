import { webcrypto } from "crypto";
const { subtle } = webcrypto;

const kp = await subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"]
);

const priv = await subtle.exportKey("jwk", kp.privateKey);
const pub  = await subtle.exportKey("jwk", kp.publicKey);

console.log("PRIVATE_JWK=" + JSON.stringify(priv));
console.log("PUBLIC_JWK="  + JSON.stringify(pub));
