export interface JikanAnime {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  images: {
    jpg: { image_url: string; large_image_url: string };
  };
  synopsis: string | null;
  episodes: number | null;
  score: number | null;
  year: number | null;
  genres: { mal_id: number; name: string }[];
  status: string | null;
}

interface JikanResponse {
  data: JikanAnime[];
  pagination: { has_next_page: boolean };
}

export async function searchAnime(query: string): Promise<JikanAnime[]> {
  const url = new URL("https://api.jikan.moe/v4/anime");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "12");
  url.searchParams.set("sfw", "true");

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];

  const data: JikanResponse = await res.json();
  return data.data ?? [];
}
