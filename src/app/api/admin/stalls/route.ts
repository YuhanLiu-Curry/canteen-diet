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
  const { name, canteenId } = await request.json();
  if (!name || !canteenId) {
    return NextResponse.json({ error: "名称和食堂必填" }, { status: 400 });
  }
  const stall = await prisma.stall.create({ data: { name, canteenId } });
  return NextResponse.json(stall);
}
