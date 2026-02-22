export interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  rating: number;
  released: string | null;
  genres: { id: number; name: string }[];
  playtime: number;
  metacritic: number | null;
}

interface RawgResponse {
  count: number;
  results: RawgGame[];
}

export async function searchGames(query: string): Promise<RawgGame[]> {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("search", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("page_size", "12");
  url.searchParams.set("search_precise", "true");

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];

  const data: RawgResponse = await res.json();
  return data.results ?? [];
}
