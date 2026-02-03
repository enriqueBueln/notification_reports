"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Spinner></Spinner>
    </div>
  );
}
