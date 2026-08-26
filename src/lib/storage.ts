import { supabase } from "./supabaseClient";

const PARTITIONS_BUCKET = "partitions";

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
