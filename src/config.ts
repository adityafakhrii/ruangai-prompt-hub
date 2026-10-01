/**
 * Maintenance Mode Configuration
 * 
 * Best Practice On/Off Maintenance:
 * 1. Via Environment Variable (.env atau Dashboard Hosting seperti Vercel/Netlify):
 *    VITE_MAINTENANCE_MODE=true  -> Mengaktifkan mode maintenance
 *    VITE_MAINTENANCE_MODE=false -> Menonaktifkan mode maintenance
 * 
 * 2. Via Konfigurasi Manual (Fallback):
 *    Jika env variable tidak diset, ubah nilai `DEFAULT_MAINTENANCE_MODE` di bawah:
 *    false = Web normal (buka)
 *    true  = Web maintenance (tutup)
 * 
 * 3. Fitur Secret Bypass (Khusus Dev / Admin):
 *    Saat maintenance aktif, buka URL dengan parameter "?bypass=true" (contoh: ruangai.id/?bypass=true)
 *    untuk tetap bisa mengakses website tanpa terblokir halaman maintenance.
 */

// Set default ke false (Maintenance dimatikan / website dibuka)
const DEFAULT_MAINTENANCE_MODE = false;

// Cek konfigurasi dari Environment Variable (jika tersedia)
const envMaintenance = import.meta.env.VITE_MAINTENANCE_MODE;
const isMaintenanceEnabled =
  typeof envMaintenance !== "undefined"
    ? envMaintenance === "true" || envMaintenance === "1"
    : DEFAULT_MAINTENANCE_MODE;

// Helper untuk memeriksa apakah admin menggunakan query parameter bypass
const checkBypass = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("bypass") === "true") {
      sessionStorage.setItem("maintenance_bypass", "true");
      return true;
    }
    if (params.get("bypass") === "false") {
      sessionStorage.removeItem("maintenance_bypass");
      return false;
    }
    return sessionStorage.getItem("maintenance_bypass") === "true";
  } catch {
    return false;
  }
};

export const config = {
  get maintenanceMode(): boolean {
    if (!isMaintenanceEnabled) return false;
    if (checkBypass()) return false;
    return true;
  },
};

