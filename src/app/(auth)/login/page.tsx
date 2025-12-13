"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast"; // Dùng để thông báo lỗi đẹp hơn
import { Loader2, LogIn, Chrome } from "lucide-react"; // Icon

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // State lưu input của form
  const [data, setData] = useState({
    email: "",
    password: ""
  });

  // Xử lý Login bằng Email/Password
  const loginWithCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gọi hàm signIn của NextAuth
      // redirect: false -> Để chúng ta tự xử lý chuyển trang hoặc báo lỗi
      const callback = await signIn("credentials", {
        ...data,
        redirect: false, 
      });

      if (callback?.error) {
        toast.error("Invalid credentials!"); // Báo lỗi nếu sai mk
      }

      if (callback?.ok && !callback?.error) {
        toast.success("Logged in successfully!");
        router.push("/"); // Chuyển hướng sau khi đăng nhập thành công
        router.refresh(); // Refresh để cập nhật Session mới nhất
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Login bằng Google
  const loginWithGoogle = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/dashboard/builder" });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Trainer!</h1>
          <p className="text-slate-400 text-sm">Sign in to access your Team & Arena.</p>
        </div>

        {/* Form */}
        <form onSubmit={loginWithCredentials} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="ash@ketchum.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <button
          onClick={loginWithGoogle}
          disabled={isLoading}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Chrome size={20} /> {/* Icon minh họa cho Google */}
          Google
        </button>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}