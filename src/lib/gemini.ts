import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export interface AIVerificationResult {
    verified: boolean;
    feedback: string;
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
            verified: true, // Bypass verification if no API key is set
            feedback: "API key missing, skipping verification.",
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const promptText = `
Anda adalah seorang AI reviewer untuk platform direktori prompt bernama "RuangAI Prompt Hub".
Tugas Anda adalah memverifikasi kualitas prompt yang disubmit oleh pengguna secara kritis dan tegas.
Jika prompt dinilai berkualitas tinggi, sangat detail, memiliki judul yang jelas, maka status verified harus true.
Jika kurang berkualitas, terlalu pendek, membingungkan, atau meminta gambar tapi tidak ada gambar, maka status verified harus false, dan sertakan feedback yang menjelaskan apa yang harus diperbaiki.

Kriteria:
1. Judul harus jelas dan merepresentasikan prompt.
2. Panjang dan kedetailan prompt: Prompt harus detail dan cukup panjang untuk memberikan instruksi yang jelas kepada AI. Prompt yang hanya 1-2 kalimat pendek atau kurang dari 10 kata harus ditolak karena kurang mendetail.
3. Jika Kategori adalah "Image" atau "Video", pengguna SANGAT DISARANKAN atau BAHKAN DIWAJIBKAN menyertakan gambar (hasImage harus true) karena ini mempermudah pengguna lain melihat contoh hasil. Jika Kategori "Image" atau "Video" dan tidak ada gambar, tolak (verified: false) dan minta pengguna mengupload gambar hasil prompt tersebut.
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
        // In case of error (network issue, parse issue, etc.), we can either fail or pass.
        // Let's fail safely so the user is informed there's a problem, or we can just pass them to manual admin verification.
        return {
            verified: false,
            feedback: "Maaf, terjadi kesalahan pada sistem verifikasi AI kami saat ini. Silakan coba lagi nanti atau kurangi panjang teks.",
        };
    }
};
