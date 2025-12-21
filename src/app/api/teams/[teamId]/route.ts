import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Validate dữ liệu đầu vào cơ bản
const updateTeamSchema = z.object({
  name: z.string().min(1),
  pokemons: z.array(z.any()).max(6), // Cho phép any để linh hoạt map dữ liệu bên dưới
});

// --- PUT: Cập nhật Team ---
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    // 1. Check Auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Lấy Params & Body
    const { teamId } = await params;
    const body = await req.json();
    
    // Validate
    const { name, pokemons } = updateTeamSchema.parse(body);

    // 3. Thực hiện Transaction (Cập nhật Name -> Xóa Pokemon cũ -> Tạo Pokemon mới)
    const updatedTeam = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // A. Cập nhật tên Team
      // Lưu ý: Kiểm tra cả userId để đảm bảo chỉ chủ sở hữu mới được sửa
      const team = await tx.team.update({
        where: { 
            id: teamId, 
            // Nếu schema Team có quan hệ với User qua userId thì bỏ comment dòng dưới:
            // userId: session.user.id 
        },
        data: { name },
      });

      // B. Xóa toàn bộ Pokemon cũ của Team này
      // Lưu ý: Đổi 'SavedPokemon' thành tên model thực tế trong schema của bạn (ví dụ: PokemonBuild)
      await tx.pokemonBuild.deleteMany({
        where: { teamId: teamId },
      });

      // C. Tạo danh sách Pokemon mới
      if (pokemons.length > 0) {
        await tx.pokemonBuild.createMany({
          data: pokemons.map((p: any, index: number) => {
            // --- LOGIC MAPPING DỮ LIỆU ---
            
            // 1. Xử lý Moves: Frontend có thể gửi move1... hoặc mảng selectedMoves
            const movesList = p.selectedMoves || [];
            
            // 2. Xử lý Stats: Frontend có thể gửi stats.hp hoặc hp trực tiếp
            const stats = p.stats || {};

            return {
              teamId: teamId,
              order: index,
              
              // ID & Info
              pokedexId: p.pokedexId || p.id,
              name: p.name,
              spriteUrl: p.spriteUrl || p.sprite, // Handle naming lệch (sprite vs spriteUrl)
              types: p.types, // Đảm bảo schema là String[] (Postgres) hoặc xử lý join nếu là String (MySQL)

              // Stats (Ưu tiên lấy trực tiếp, fallback vào object stats)
              hp:      p.hp      ?? stats.hp      ?? 0,
              attack:  p.attack  ?? stats.attack  ?? 0,
              defense: p.defense ?? stats.defense ?? 0,
              spAtk:   p.spAtk   ?? stats.spAtk   ?? 0,
              spDef:   p.spDef   ?? stats.spDef   ?? 0,
              speed:   p.speed   ?? stats.speed   ?? 0,

              // Moves (Ưu tiên move1, fallback vào mảng, fallback vào null)
              move1: p.move1 || movesList[0] || null,
              move2: p.move2 || movesList[1] || null,
              move3: p.move3 || movesList[2] || null,
              move4: p.move4 || movesList[3] || null,

              // Meta
              teraType: p.teraType || p.selectedTeraType || null,
            };
          }),
        });
      }

      // Trả về team đã update (kèm data mới)
      // Lưu ý: Trong transaction createMany không trả về data, nên cần query lại hoặc trả về team info cơ bản
      return team;
    });

    // Fetch lại dữ liệu đầy đủ để trả về Frontend cập nhật UI
    const finalResult = await prisma.team.findUnique({
        where: { id: teamId },
        include: { pokemons: { orderBy: { order: 'asc' } } }
    });

    return NextResponse.json(finalResult);

  } catch (error) {
    console.error("[TEAM_ID_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- DELETE: Xóa Team ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { teamId } = await params;

    // Xóa team (Cascade sẽ tự xóa SavedPokemon nếu schema cấu hình onDelete: Cascade)
    // Nếu không có cascade, dùng transaction như bạn đã viết
    await prisma.$transaction(async (tx) => {
        // Dòng này cần thiết nếu Schema không để OnDelete: Cascade
        await tx.pokemonBuild.deleteMany({ where: { teamId } });
        
        await tx.team.delete({
            where: { 
                id: teamId, 
                // userId: session.user.id // Bỏ comment để bảo mật
            } 
        });
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error("[TEAM_ID_DELETE]", error);
    if (error.code === 'P2025') {
        return new NextResponse("Team not found", { status: 404 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}