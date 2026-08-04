"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcTDEE, calcDailyTarget } from "@/lib/tdee";
import { redirect } from "next/navigation";

export async function saveOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const gender = formData.get("gender") as string;
  const age = Number(formData.get("age"));
  const heightCm = Number(formData.get("heightCm"));
  const weightKg = Number(formData.get("weightKg"));
  const targetWeightKg = Number(formData.get("targetWeightKg"));
  const pace = formData.get("pace") as string;

  if (!gender || !age || !heightCm || !weightKg || !targetWeightKg || !pace) {
    throw new Error("请填写完整");
  }

  const tdee = calcTDEE({ gender, heightCm, weightKg, age });
  const dailyKcalTarget = calcDailyTarget(tdee, pace);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { gender, heightCm, weightKg, targetWeightKg, pace, dailyKcalTarget },
  });

  redirect("/");
}
