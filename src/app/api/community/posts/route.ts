import { NextRequest, NextResponse } from "next/server";
import { initialPosts } from "@/lib/storage";
import { CommunityPost } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const tag = searchParams.get("tag")?.toLowerCase();
  const sort = searchParams.get("sort") || "latest"; // "latest" | "trending" | "popular"
  const search = searchParams.get("search")?.toLowerCase();

  let posts: CommunityPost[] = [...initialPosts];

  // Tag filter
  if (tag) {
    posts = posts.filter((p) => p.tags.some((t) => t.toLowerCase() === tag));
  }

  // Keyword search
  if (search) {
    posts = posts.filter(
      (p) =>
        p.content.toLowerCase().includes(search) ||
        p.authorName.toLowerCase().includes(search) ||
        p.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  // Sorting
  if (sort === "trending") {
    posts.sort((a, b) => {
      const scoreA = a.likes.length * 2 + a.comments.length * 3 + a.sharesCount * 4;
      const scoreB = b.likes.length * 2 + b.comments.length * 3 + b.sharesCount * 4;
      return scoreB - scoreA;
    });
  } else if (sort === "popular") {
    posts.sort((a, b) => b.likes.length - a.likes.length);
  } else {
    // Latest default
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = posts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedPosts = posts.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    posts: paginatedPosts,
  });
}
