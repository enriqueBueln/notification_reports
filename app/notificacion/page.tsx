''

import { NotificationForm } from "@/components/notification-form";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Image from "next/image";
import LogoutButton from "@/components/logout-button";

export default async function Home() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-primary/90">
      <header className="bg-white shadow py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={48} height={48} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Notificación de inasistencia
              </h2>
              <p className="text-gray-700">
                Generación de documento administrativo
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <NotificationForm />
      </main>
    </div>
  );
}
