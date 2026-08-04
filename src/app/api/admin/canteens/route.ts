import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 创建食堂（含便利店 type=convenience_store）
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { name, type } = await request.json();
  if (!name) return NextResponse.json({ error: "名称必填" }, { status: 400 });

  const canteen = await prisma.canteen.create({
    data: { name, type: type ?? "canteen" },
  });
  return NextResponse.json(canteen);
}

export async function GET() {
  const canteens = await prisma.canteen.findMany({
    include: { stalls: { include: { dishes: true } } },
  });
  return NextResponse.json(canteens);
}
