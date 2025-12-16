import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // Thư viện thông báo
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import BackgroundMusic from "@/components/layout/BackgroundMusic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pokemon Battle Simulator",
  description: "Build team and fight!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <AuthProvider>
          {/* Navbar hiển thị ở mọi trang */}
          <Navbar />
          
          {/* Thêm padding-top để nội dung không bị Navbar che khuất */}
          <main className="pt-16 min-h-screen">
            {children}
          </main>
          
          <Toaster position="bottom-right" toastOptions={{
             style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
          }}/>
          <BackgroundMusic />
        </AuthProvider>
      </body>
    </html>
  );
}