"use client";

import { useRouter } from "next/navigation";

import { Shell } from "../components/Shell";
import { ThemeView } from "../components/ThemeView";

export default function TemasPage() {
  const router = useRouter();
  return (
    <Shell
      eyebrow="Aparência"
      title="Temas"
      description="Escolha e personalize o tema visual do painel."
    >
      <ThemeView onClose={() => router.push("/")} />
    </Shell>
  );
}
