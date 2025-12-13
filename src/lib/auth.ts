import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Import Adapter
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // 1. KẾT NỐI PRISMA ADAPTER (Tự động tạo User/Account trong DB)
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt", // Dùng JWT để linh hoạt, không bắt buộc query DB mỗi lần F5
  },
  
  providers: [
    // 2. CẤU HÌNH GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Cho phép link tài khoản Google với tài khoản Email đã tồn tại
      allowDangerousEmailAccountLinking: true, 
    }),

    // 3. CẤU HÌNH LOGIN BẰNG MẬT KHẨU
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Nếu không có user hoặc user đó tạo bằng Google (không có password)
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      }
    }),
  ],

  // 4. CALLBACKS: Chuyển ID từ DB vào Session
  callbacks: {
    async jwt({ token, user, account }) {
      // Khi mới login (có user object)
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // @ts-ignore
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Đường dẫn trang login của bạn
  }
};