import { supabase } from "./supabaseClient";

const PARTITIONS_BUCKET = "partitions";
const AVATARS_BUCKET = "avatars";

export async function uploadPartitionFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "pdf";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PARTITIONS_BUCKET).upload(path, file, {
    contentType: file.type || "application/pdf",
  });
  if (error) throw error;
  const { data } = supabase.storage.from(PARTITIONS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteAvatar(url: string): Promise<void> {
  const marker = `/${AVATARS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([path]);
  if (error) throw error;
}
