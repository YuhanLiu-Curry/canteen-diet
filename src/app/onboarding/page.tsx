import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { saveOnboarding } from "./actions";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  // 已设置过目标就直接进首页
  if (user?.dailyKcalTarget) redirect("/");

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <form
        action={saveOnboarding}
        className="w-full max-w-md space-y-5 pt-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">设置你的减脂目标</h1>
          <p className="text-sm text-gray-500 mt-1">
            用于计算每日热量目标，之后可随时修改
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">性别</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center justify-center rounded border py-2 cursor-pointer has-checked:bg-black has-checked:text-white">
              <input type="radio" name="gender" value="male" required className="sr-only" />
              男
            </label>
            <label className="flex items-center justify-center rounded border py-2 cursor-pointer has-checked:bg-black has-checked:text-white">
              <input type="radio" name="gender" value="female" required className="sr-only" />
              女
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">年龄</label>
          <input
            type="number"
            name="age"
            required
            min={15}
            max={60}
            placeholder="如 21"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">身高 (cm)</label>
            <input
              type="number"
              name="heightCm"
              required
              step="0.1"
              placeholder="如 175"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">体重 (kg)</label>
            <input
              type="number"
              name="weightKg"
              required
              step="0.1"
              placeholder="如 70"
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">目标体重 (kg)</label>
          <input
            type="number"
            name="targetWeightKg"
            required
            step="0.1"
            placeholder="如 62"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">减脂速度</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col items-center rounded border py-3 cursor-pointer has-checked:bg-black has-checked:text-white">
              <input type="radio" name="pace" value="mild" required className="sr-only" />
              <span className="font-medium">温和</span>
              <span className="text-xs opacity-70">每日 -300 kcal</span>
            </label>
            <label className="flex flex-col items-center rounded border py-3 cursor-pointer has-checked:bg-black has-checked:text-white">
              <input type="radio" name="pace" value="aggressive" required className="sr-only" />
              <span className="font-medium">激进</span>
              <span className="text-xs opacity-70">每日 -500 kcal</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded bg-black py-3 text-white font-medium"
        >
          计算我的每日目标
        </button>
      </form>
    </main>
  );
}
