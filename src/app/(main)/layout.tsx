import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Header session={session} />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
