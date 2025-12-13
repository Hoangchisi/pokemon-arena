import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Schema validate dữ liệu đầu vào
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate dữ liệu
    const { email, name, password } = registerSchema.parse(body);

    // 2. Kiểm tra user đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 409 });
    }

    // 3. Mã hóa mật khẩu (Salt round = 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Tạo user mới
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        image: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`, // Tạo avatar pixel art ngẫu nhiên
      },
    });

    // Trả về user (nhưng không trả về password)
    return NextResponse.json({ 
      user: {
        name: user.name,
        email: user.email,
      } 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 422 });
    }
    console.error("[REGISTER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}