import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/lib/api/rawg";
import { searchAnime } from "@/lib/api/jikan";
import { searchBooks, getCoverUrl } from "@/lib/api/openlibrary";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type");

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  if (type === "GAME") {
    const games = await searchGames(query);
    const results = games.map((g) => ({
      externalId: String(g.id),
      type: "GAME",
      title: g.name,
      imageUrl: g.background_image ?? null,
      description: g.genres.map((x) => x.name).join(", ") || null,
      metadata: {
        rating: g.rating,
        released: g.released,
        playtime: g.playtime,
        metacritic: g.metacritic,
        genres: g.genres,
      },
    }));
    return NextResponse.json({ results });
  }

  if (type === "ANIME") {
    const animes = await searchAnime(query);
    const results = animes.map((a) => ({
      externalId: String(a.mal_id),
      type: "ANIME",
      title: a.title,
      imageUrl: a.images.jpg.large_image_url ?? a.images.jpg.image_url ?? null,
      description: a.synopsis ? a.synopsis.slice(0, 200) : null,
      metadata: {
        titleJa: a.title_japanese,
        score: a.score,
        episodes: a.episodes,
        year: a.year,
        status: a.status,
        genres: a.genres,
      },
    }));
    return NextResponse.json({ results });
  }

  if (type === "BOOK") {
    const books = await searchBooks(query);
    const results = books.map((b) => ({
      externalId: b.key,
      type: "BOOK",
      title: b.title,
      imageUrl: b.cover_i ? getCoverUrl(b.cover_i, "M") : null,
      description: b.author_name ? b.author_name.slice(0, 3).join(", ") : null,
      metadata: {
        authors: b.author_name,
        firstPublishYear: b.first_publish_year,
        totalPages: b.number_of_pages_median,
        subjects: b.subject?.slice(0, 5),
        isbn: b.isbn?.[0],
      },
    }));
    return NextResponse.json({ results });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
