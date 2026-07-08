"use server";

import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CATEGORIES: Category[] = ["vacuum", "air", "speaker", "light", "hub"];

interface ProductFilters {
  category?: Category;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest";
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Product[];
}

export async function createProduct(formData: FormData) {
  const name = ((formData.get("name") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const category = formData.get("category") as string;
  const images = ((formData.get("images") as string) ?? "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  if (!name) return { error: "상품명을 입력해주세요." };
  if (!Number.isInteger(price) || price < 0) {
    return { error: "가격을 올바르게 입력해주세요." };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "재고를 올바르게 입력해주세요." };
  }
  if (!CATEGORIES.includes(category as Category)) {
    return { error: "카테고리를 선택해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    stock,
    category,
    images,
  });

  if (error) return { error: "상품 등록에 실패했습니다." };

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
