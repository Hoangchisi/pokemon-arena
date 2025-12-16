import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // Có thể bỏ dòng này nếu không muốn log rác khi build
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;