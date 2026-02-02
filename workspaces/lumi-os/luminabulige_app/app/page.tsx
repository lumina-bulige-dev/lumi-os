import type { Metadata } from "next";
import VClient from "./v/VClient";

export const metadata: Metadata = {
  title: "LUMINA",
  description: "LUMINA / LUMINA CIA / oKYC beta landing page.",
};

export default function Page() {
  return <VClient />;
}
