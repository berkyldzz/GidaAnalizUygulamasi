// Gıda veritabanı tipini tanımlıyoruz
type GidaBilgisi = {
  etki: "zararlı" | "nötr" | "dikkat"; // Belirli tipleri zorunlu yapıyoruz
  açıklama: string;
};

// GIDA_VERITABANI nesnesini tanımlıyoruz
export const GIDA_VERITABANI: Record<string, GidaBilgisi> = {
  "E621": { etki: "zararlı", açıklama: "MSG (Monosodyum Glutamat), aşırı tüketildiğinde baş ağrısı yapabilir." },
  "E951": { etki: "zararlı", açıklama: "Aspartam, kanserojen olabileceği şüphesiyle araştırılmaktadır." },
  "E330": { etki: "nötr", açıklama: "Sitrik Asit, çoğunlukla güvenli kabul edilir." },
  "Şeker": { etki: "dikkat", açıklama: "Yüksek miktarda tüketildiğinde obeziteye yol açabilir." },
};