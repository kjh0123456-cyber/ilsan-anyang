"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product, Category } from "@/lib/types";
import { revalidatePath } from "next/cache";

const CATEGORIES: Category[] = ["vacuum", "air", "speaker", "light", "hub"];
const IMAGE_BUCKET = "product-images";
const DUPLICATE_WINDOW_MS = 10_000;

async function uploadProductImages(files: File[]): Promise<string[]> {
  const admin = createAdminClient();
  const urls: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await admin.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type });

    if (error) throw error;

    const { data } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

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

export async function getAllProducts(
  includeDeleted = false
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

export async function getProductForAdmin(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Product;
}

export async function createProduct(formData: FormData) {
  const name = ((formData.get("name") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const category = formData.get("category") as string;
  const imageFiles = formData.getAll("images") as File[];

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

  const { data: recentDuplicate } = await supabase
    .from("products")
    .select("id")
    .eq("name", name)
    .eq("price", price)
    .eq("category", category)
    .gte(
      "created_at",
      new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString()
    )
    .limit(1)
    .maybeSingle();

  if (recentDuplicate) {
    return { error: "방금 동일한 상품이 등록되었습니다. 중복 등록을 방지했습니다." };
  }

  let images: string[];
  try {
    images = await uploadProductImages(imageFiles);
  } catch {
    return { error: "이미지 업로드에 실패했습니다." };
  }

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
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const name = ((formData.get("name") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const category = formData.get("category") as string;
  const isActive = formData.get("is_active") === "on";
  const imageFiles = formData.getAll("images") as File[];
  const keptImages = JSON.parse(
    (formData.get("existingImages") as string) ?? "[]"
  ) as string[];

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

  let uploadedImages: string[];
  try {
    uploadedImages = await uploadProductImages(imageFiles);
  } catch {
    return { error: "이미지 업로드에 실패했습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      description,
      price,
      stock,
      category,
      is_active: isActive,
      images: [...keptImages, ...uploadedImages],
    })
    .eq("id", id);

  if (error) return { error: "상품 수정에 실패했습니다." };

  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);

  if (error) return { error: "상품 삭제에 실패했습니다." };

  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
  return { success: true };
}

export async function restoreProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: null, is_active: true })
    .eq("id", id);

  if (error) return { error: "상품 복구에 실패했습니다." };

  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
  return { success: true };
}
