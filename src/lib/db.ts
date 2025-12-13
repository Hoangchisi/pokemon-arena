import { PrismaClient } from "@prisma/client";

// Mở rộng global object để TypeScript không báo lỗi
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Bật log để xem câu lệnh SQL chạy thế nào (rất hữu ích khi debug)
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;