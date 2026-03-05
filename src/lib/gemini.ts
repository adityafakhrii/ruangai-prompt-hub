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
    hasImage: boolean
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
1. Judul harus spesifik dan merepresentasikan isi prompt dengan baik.
2. Kedetailan: Prompt harus detail (idealnya memiliki konteks, instruksi spesifik, dan format output yang diinginkan). Prompt yang hanya 1-3 kalimat pendek atau instruksi yang sangat basic (misal: "buatkan artikel SEO", "gambar kucing") HARUS DITOLAK karena kurang berguna bagi komunitas.
3. Kategori Visual: Jika Kategori adalah "Image" atau "Video", pengguna WAJIB menyertakan gambar aslinya (hasImage harus true) karena pengguna lain butuh melihat seperti apa hasil gambar dari prompt tersebut. Jika hasImage false untuk kategori visual, TOLAK (verified: false) dan minta pengguna mengupload gambar hasilnya.
4. Prompt tidak boleh mengandung unsur SARA, pornografi, atau konten ilegal. Jika ada, langsung tolak (verified: false) dengan peringatan.

Berikut adalah data prompt yang disubmit:
Judul: "${title}"
Kategori: "${category}"
Apakah menyertakan gambar contoh?: ${hasImage ? "Ya" : "Tidak"}
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
