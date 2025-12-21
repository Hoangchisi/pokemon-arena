import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// --- GET: Lấy tiến độ hiện tại ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ưu tiên dùng ID để tìm kiếm (nhanh & chính xác hơn email)
    // Nếu NextAuth config chưa trả về id, fallback sang email
    const whereCondition = session.user.id 
      ? { id: session.user.id } 
      : { email: session.user.email! };

    const user = await prisma.user.findUnique({
      where: whereCondition,
      select: { maxStageUnlocked: true }
    });

    // Nếu user chưa có (trường hợp hiếm) hoặc chưa có data, trả về 0
    return NextResponse.json({ 
      maxStageUnlocked: user?.maxStageUnlocked ?? 0 
    });

  } catch (error) {
    console.error("[USER_PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- POST: Cập nhật tiến độ khi thắng ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { stageUnlocked } = body;

    // Validate dữ liệu đầu vào
    if (typeof stageUnlocked !== 'number') {
      return new NextResponse("Invalid data: stageUnlocked must be a number", { status: 400 });
    }

    const whereCondition = session.user.id 
      ? { id: session.user.id } 
      : { email: session.user.email! };

    // 1. Lấy tiến độ hiện tại trong DB
    const currentUser = await prisma.user.findUnique({
      where: whereCondition,
      select: { maxStageUnlocked: true }
    });

    if (!currentUser) {
       return new NextResponse("User not found", { status: 404 });
    }

    // 2. Logic Cập nhật: Chỉ lưu nếu stage mới CAO HƠN stage cũ
    // (Tránh trường hợp chơi lại màn 1 mà bị reset tiến độ về 1)
    let finalStage = currentUser.maxStageUnlocked;

    if (stageUnlocked > currentUser.maxStageUnlocked) {
      const updatedUser = await prisma.user.update({
        where: whereCondition,
        data: { maxStageUnlocked: stageUnlocked },
        select: { maxStageUnlocked: true }
      });
      finalStage = updatedUser.maxStageUnlocked;
    }

    // Trả về kết quả mới nhất để Frontend cập nhật Store
    return NextResponse.json({ 
      success: true, 
      maxStageUnlocked: finalStage 
    });

  } catch (error) {
    console.error("[USER_PROGRESS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}