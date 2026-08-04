import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md space-y-6 pt-8">
        <h1 className="text-3xl font-bold text-center">今日剩余</h1>
        <p className="text-5xl font-bold text-center">— kcal</p>
        <p className="text-center text-gray-500">
          {session.user.email}，菜品库录入后即可开始记录
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="text-center"
        >
          <button className="text-sm text-gray-400 underline">退出登录</button>
        </form>
      </div>
    </main>
  );
}
