import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// --- VALIDATION SCHEMA ---
// Dùng để kiểm tra dữ liệu đầu vào khi Lưu Team
const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  pokemons: z.array(z.object({
    pokedexId: z.number(),
    name: z.string(),
    move1: z.string(),
    move2: z.string().nullable(),
    move3: z.string().nullable(),
    move4: z.string().nullable(),
    hp: z.number(),
    attack: z.number(),
    defense: z.number(),
    spAtk: z.number(),
    spDef: z.number(),
    speed: z.number(),
    types: z.array(z.string()),
    spriteUrl: z.string().nullable(),
    teraType: z.string().nullable(),
    order: z.number()
  })).max(6, "Maximum 6 Pokemons allowed")
});

// --- 1. POST: Dùng cho Team Builder (Lưu Team) ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Validate dữ liệu
    const { name, pokemons } = createTeamSchema.parse(body);

    // Lưu vào Database (Transaction: Tạo Team -> Tạo các Pokemon con)
    const team = await prisma.team.create({
      data: {
        name,
        userId: session.user.id,
        pokemons: {
          create: pokemons.map((p) => ({
            pokedexId: p.pokedexId,
            name: p.name,
            move1: p.move1,
            move2: p.move2,
            move3: p.move3,
            move4: p.move4,
            hp: p.hp,
            attack: p.attack,
            defense: p.defense,
            spAtk: p.spAtk,
            spDef: p.spDef,
            speed: p.speed,
            types: p.types,
            spriteUrl: p.spriteUrl,
            teraType: p.teraType,
            order: p.order
          }))
        }
      }
    });

    return NextResponse.json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    console.log("[TEAMS_POST]", error);
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
    console.log("[TEAMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}