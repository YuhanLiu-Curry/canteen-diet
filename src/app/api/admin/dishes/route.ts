import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.isAdmin ? user : null;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  const body = await request.json();
  const { name, stallId, kcal, proteinG, carbsG, fatG, confidence } = body;
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed || !stallId || kcal == null || proteinG == null || carbsG == null || fatG == null) {
    return NextResponse.json({ error: "字段不完整" }, { status: 400 });
  }
  const exists = await prisma.dish.findFirst({
    where: { name: trimmed, stallId },
  });
  if (exists) {
    return NextResponse.json({ error: `该窗口下已有「${trimmed}」` }, { status: 409 });
  }
  const dish = await prisma.dish.create({
    data: {
      name: trimmed,
      stallId,
      kcal,
      proteinG,
      carbsG,
      fatG,
      confidence: confidence ?? "estimated",
    },
  });
  return NextResponse.json(dish);
}
