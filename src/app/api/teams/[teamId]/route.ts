import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client"; 

const updateTeamSchema = z.object({
  name: z.string().min(1),
  pokemons: z.array(z.any()).max(6)
});

// --- PUT: Cập nhật Team ---
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { teamId } = await params; // Next.js 15 await params
    const body = await req.json();
    
    const { name, pokemons } = updateTeamSchema.parse(body);

    const updatedTeam = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // 1. Cập nhật tên Team
      const team = await tx.team.update({
        where: { id: teamId, userId: session.user.id },
        data: { name }
      });

      // 2. Xóa Pokemon cũ
      await tx.pokemonBuild.deleteMany({
        where: { teamId: teamId }
      });

      // 3. Tạo Pokemon mới
      if (pokemons.length > 0) {
        await tx.pokemonBuild.createMany({
          data: pokemons.map((p: any, index: number) => {
            // --- FIX LỖI Ở ĐÂY: Dùng Safe Access ---
            // Nếu payload gửi lên không có selectedMoves, ta gán mảng rỗng để tránh crash
            const moves = p.selectedMoves || [];

            return {
              teamId: teamId,
              pokedexId: p.pokedexId || p.id,
              name: p.name,
              
              // Sửa logic lấy Move: Ưu tiên move1 gửi lên, nếu null thì tìm trong mảng, nếu không có thì lấy giá trị mặc định
              // Sử dụng ?. (Optional Chaining) để không bị lỗi nếu moves là undefined
              move1: p.move1 || moves[0] || "tackle",
              move2: p.move2 || moves[1] || null,
              move3: p.move3 || moves[2] || null,
              move4: p.move4 || moves[3] || null,

              hp: p.hp || p.stats.hp,
              attack: p.attack || p.stats.attack,
              defense: p.defense || p.stats.defense,
              spAtk: p.spAtk || p.stats.spAtk,
              spDef: p.spDef || p.stats.spDef,
              speed: p.speed || p.stats.speed,
              types: p.types,
              spriteUrl: p.spriteUrl || p.sprite,
              teraType: p.teraType || null,
              order: index
            };
          })
        });
      }
      return team;
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.log("[TEAM_ID_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ... (Hàm DELETE bên dưới giữ nguyên) ...
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { teamId } = await params;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.pokemonBuild.deleteMany({ where: { teamId: teamId } });
      await tx.team.delete({ where: { id: teamId, userId: session.user.id } });
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("[TEAM_ID_DELETE]", error);
    // @ts-ignore
    if (error.code === 'P2025') return new NextResponse("Team not found", { status: 404 });
    return new NextResponse("Internal Error", { status: 500 });
  }
}