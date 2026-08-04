import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md space-y-6 pt-8">
        <h1 className="text-2xl font-bold text-center">设置你的目标</h1>
        <p className="text-center text-gray-500">目标设置表单开发中（F4）</p>
      </div>
    </main>
  );
}
