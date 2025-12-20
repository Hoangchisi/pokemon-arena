import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Đảm bảo đường dẫn này đúng với file auth của bạn
import { prisma } from "@/lib/db"; // <--- ĐÃ SỬA: Import từ file lib/db.ts của bạn

export async function GET(req: Request) {
  try {
    // 1. Lấy session người dùng
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userEmail = session.user.email;

    // 2. Truy vấn Database bằng Prisma từ lib/db.ts
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { maxStageUnlocked: true }
    });

    // Nếu chưa có dữ liệu, trả về 0
    if (!user) {
        return NextResponse.json({ maxStageUnlocked: 0 });
    }

    return NextResponse.json({ maxStageUnlocked: user.maxStageUnlocked });

  } catch (error) {
    console.error("[USER_PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Xác thực
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userEmail = session.user.email;

    // 2. Lấy dữ liệu gửi lên
    const body = await req.json();
    const { stageUnlocked } = body;

    if (typeof stageUnlocked !== 'number') {
      return new NextResponse("Invalid data", { status: 400 });
    }

    // 3. Logic cập nhật DB
    // Tìm user hiện tại
    const currentUser = await prisma.user.findUnique({
       where: { email: userEmail }
    });

    if (!currentUser) {
        // Tùy logic: Nếu user không tồn tại trong DB dù đã có session
        // Bạn có thể trả về lỗi 404 hoặc tự động tạo user mới tại đây
        return new NextResponse("User not found in database", { status: 404 });
    }

    // Chỉ cập nhật nếu tiến độ mới cao hơn cũ
    if (stageUnlocked > currentUser.maxStageUnlocked) {
        await prisma.user.update({
            where: { email: userEmail },
            data: { maxStageUnlocked: stageUnlocked }
        });
    }

    return NextResponse.json({ 
        success: true, 
        savedStage: Math.max(stageUnlocked, currentUser.maxStageUnlocked) 
    });

  } catch (error) {
    console.error("[USER_PROGRESS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}