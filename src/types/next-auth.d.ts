import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** ID của người dùng từ Database */
      id: string
    } & DefaultSession["user"]
  }

  /**
   * Mở rộng thêm User model nếu cần (thường dùng trong Adapter)
   */
  interface User {
    id: string
    // Các trường khác nếu bạn custom (vd: role, plan...)
  }
}