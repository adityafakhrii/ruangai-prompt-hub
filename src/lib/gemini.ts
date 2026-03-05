import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export interface AIVerificationResult {
    verified: boolean;
    feedback: string;
    isError?: boolean;
}

export const verifyPromptByAI = async (
    title: string,
    category: string,
    fullPrompt: string,
    hasImage: boolean,
    hasAdditionalInfo: boolean
): Promise<AIVerificationResult> => {
    if (!apiKey) {
        console.warn("Gemini API key is missing. Skipping AI verification.");
        return {
            verified: false,
            feedback: "API key Gemini belum dikonfigurasi.",
            isError: true,
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const promptText = `
Anda adalah seorang AI reviewer/kurator ahli untuk platform direktori prompt bernama "RuangAI Prompt Hub".
Tugas Anda adalah meninjau KUALITAS prompt yang dikirim oleh pengguna secara SANGAT KRITIS dan TEGAS.

Jika prompt memiliki KUALITAS TINGGI, SANGAT DETAIL, TERSTRUKTUR, dan memiliki judul yang jelas, maka "verified" harus bernilai true.
Jika prompt berkualitas rendah, terlalu singkat, membingungkan, terkesan malas (lazy prompting), atau meminta fungsi visual tapi tidak menyertakan contoh visual, maka "verified" harus bernilai false dan beri "feedback" yang jelas tentang apa masalahnya dan cara merevisinya.

KRITERIA WAJIB:
1. Judul dan Isi HARUS KONSISTEN. Judul harus spesifik dan merepresentasikan isi prompt. Jika judul dan prompt bertolak belakang (misal: judul "Resep Masakan" tapi isi prompt "Minta kode React"), TOLAK (verified: false) dan sebutkan ketidakkonsistenannya.
2. Kedetailan & Pengecualian Meta-Prompt: Prompt harus detail (idealnya memiliki konteks, instruksi spesifik, dan format output yang diinginkan). Prompt yang hanya 1-3 kalimat pendek atau instruksi yang sangat basic HARUS DITOLAK. PENGECUALIAN: Jika prompt bertujuan untuk "membuat prompt lain" (Meta-Prompt), prompt diizinkan mesikpun singkat, asalkan *hasAdditionalInfo* bernilai true (pengguna sudah mengisi Keterangan Tambahan). Jika *hasAdditionalInfo* false, TOLAK (verified: false) dan wajibkan pengguna menuliskan detail di kolom "Keterangan Tambahan".
3. Kategori Visual Wajib Gambar: 
   - Kategori "Image": WAJIB ada gambar aslinya (hasImage harus true).
   - Kategori "Video": WAJIB melampirkan screenshot/preview cuplikan videonya (hasImage harus true).
   - Kategori "Vibe Coding": WAJIB melampirkan screenshot tampilan hasil web/aplikasinya (hasImage harus true).
   Jika Kategori memuat unsur visual di atas namun tidak ada lampiran gambar (hasImage false), TOLAK (verified: false) dan minta pengguna spesifik mengupload gambar sesuai kategorinya.
4. Spam & Konten Ilegal: Prompt TIDAK BOLEH mengandung unsur SARA, pornografi, maupun SPAM eksplisit/implisit (termasuk tapi tidak terbatas pada promosikan judi online/judol, pinjaman online/pinjol ilegal, malware, scam). Jika terdeteksi, LANGSUNG TOLAK (verified: false) dengan peringatan tegas tanpa toleransi.

Berikut adalah data prompt yang disubmit:
Judul: "${title}"
Kategori: "${category}"
Apakah menyertakan gambar contoh?: ${hasImage ? "Ya" : "Tidak"}
Apakah kolom Keterangan Tambahan diisi?: ${hasAdditionalInfo ? "Ya" : "Tidak"}
Isi Prompt:
"${fullPrompt}"

Berikan hasil evaluasi Anda HANYA dalam format JSON dengan skema berikut, tanpa tambahan markdown code block atau teks lainnya di luar JSON:
{
  "verified": boolean,
  "feedback": "string (berikan penjelasan dalam bahasa Indonesia. Jika verified true, isikan feedback kosong atau pujian singkat. Jika false, jelaskan secara spesifik kekurangannya dan apa yang perlu direvisi.)"
}
`;

        const result = await model.generateContent(promptText);
        const textResponse = result.response.text();

        // Parse the JSON. Clean up potential markdown formatting (e.g. ```json ... ```)
        let cleanedText = textResponse.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/^```json/, "");
        }
        if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/^```/, "");
        }
        if (cleanedText.endsWith("```")) {
            cleanedText = cleanedText.replace(/```$/, "");
        }
        cleanedText = cleanedText.trim();

        const parsedResult = JSON.parse(cleanedText) as AIVerificationResult;
        return parsedResult;
    } catch (error) {
        console.error("Error during AI verification:", error);
        return {
            verified: false,
            feedback: "Maaf, sistem verifikasi AI sedang mengalami kendala. Prompt akan masuk antrean manual.",
            isError: true,
        };
    }
};
