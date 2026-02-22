export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name: string[] | null;
  cover_i: number | null;
  first_publish_year: number | null;
  subject: string[] | null;
  number_of_pages_median: number | null;
  isbn: string[] | null;
}

interface OpenLibraryResponse {
  numFound: number;
  docs: OpenLibraryBook[];
}

export function getCoverUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function searchBooks(query: string): Promise<OpenLibraryBook[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "12");
  url.searchParams.set("fields", "key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median,isbn");

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];

  const data: OpenLibraryResponse = await res.json();
  return data.docs ?? [];
}
