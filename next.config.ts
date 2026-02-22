import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // RAWG (games)
      { protocol: "https", hostname: "media.rawg.io" },
      // Jikan / MyAnimeList (anime)
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      // Open Library (books)
      { protocol: "https", hostname: "covers.openlibrary.org" },
      // Google avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
