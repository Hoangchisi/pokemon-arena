import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// --- VALIDATION SCHEMA ---
// Cho phép linh hoạt hơn (optional/nullable) để tránh lỗi 422 không đáng có
const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  pokemons: z.array(z.object({
    pokedexId: z.number().or(z.string().transform(Number)), // Chấp nhận cả string ID rồi convert
    name: z.string(),
    
    // Moves: Cho phép string, null, hoặc undefined
    move1: z.string().nullable().optional(),
    move2: z.string().nullable().optional(),
    move3: z.string().nullable().optional(),
    move4: z.string().nullable().optional(),
    
    // Stats: Bắt buộc
    hp: z.number(),
    attack: z.number(),
    defense: z.number(),
    spAtk: z.number(),
    spDef: z.number(),
    speed: z.number(),
    
    // Metadata
    types: z.array(z.string()),
    spriteUrl: z.string().nullable().optional(),
    teraType: z.string().nullable().optional(),
    order: z.number()
  })).max(6, "Maximum 6 Pokemons allowed")
});

// --- 1. POST: Dùng cho Team Builder (Lưu Team Mới) ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // 1. Validate dữ liệu đầu vào
    const parseResult = createTeamSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.error("[VALIDATION_ERROR]", parseResult.error);
      return new NextResponse("Invalid request data", { status: 422 });
    }

    const { name, pokemons } = parseResult.data;

    // 2. Lưu vào Database
    // Sử dụng Nested Write để tạo Team và Pokemon cùng lúc
    const team = await prisma.team.create({
      data: {
        name,
        // Liên kết với User
        // LƯU Ý: Nếu schema bạn dùng quan hệ 'user: { connect: ... }' thì sửa lại dòng dưới
        // Ở đây giả định schema có trường 'userId'
        userId: session.user.id, 
        
        // Tạo danh sách Pokemon con (Relation: SavedPokemon)
        pokemons: {
          create: pokemons.map((p) => ({
            pokedexId: typeof p.pokedexId === 'string' ? parseInt(p.pokedexId) : p.pokedexId,
            name: p.name,
            
            // Stats
            hp: p.hp,
            attack: p.attack,
            defense: p.defense,
            spAtk: p.spAtk,
            spDef: p.spDef,
            speed: p.speed,
            
            // Info
            types: p.types,
            spriteUrl: p.spriteUrl || "", // Fallback chuỗi rỗng nếu null
            order: p.order,
            
            // Moves & Mechanics (Xử lý null an toàn)
            move1: p.move1 || "tackle",
            move2: p.move2 || null,
            move3: p.move3 || null,
            move4: p.move4 || null,
            teraType: p.teraType || null,
          }))
        }
      },
      // QUAN TRỌNG: Trả về kèm danh sách pokemon để Frontend hiển thị ngay
      include: {
        pokemons: {
            orderBy: { order: 'asc' }
        }
      } 
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("[TEAMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- 2. GET: Dùng cho Arena Lobby (Lấy danh sách Team) ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const teams = await prisma.team.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        pokemons: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("[TEAMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}