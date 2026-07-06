"use server";

import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";

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
