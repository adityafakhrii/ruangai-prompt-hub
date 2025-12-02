# Setup Database Query dengan Creator Name

## ✅ Yang Sudah Dilakukan

### 1. **Migration Database (Opsional)**
File: `supabase/migrations/20251202090000_add_prompts_with_creator_view.sql`

Membuat VIEW di database yang otomatis join table `prompts` dengan `profiles`:
```sql
CREATE OR REPLACE VIEW public.prompts_with_creator AS
SELECT 
  p.*,
  prof.full_name as creator_name,
  prof.email as creator_email
FROM public.prompts p
LEFT JOIN public.profiles prof ON p.user_id = prof.id;
```

**Cara Apply Migration:**
- Jika menggunakan Supabase Local: `supabase db reset`
- Jika di production: Upload migration via Supabase Dashboard atau CLI

### 2. **Utility Functions untuk Query**
File: `src/lib/promptQueries.ts`

Dibuat helper functions yang otomatis melakukan JOIN antara `prompts` dan `profiles`:

```typescript
export interface PromptWithCreator {
  id: string;
  user_id: string;
  title: string;
  category: string;
  prompt_text: string;
  full_prompt: string;
  image_url: string | null;
  copy_count: number;
  is_viral: boolean;
  created_at: string;
  updated_at: string;
  creator_name?: string;  // ← BARU: Nama pembuat
  creator_email?: string; // ← BARU: Email pembuat
}
```

**Functions yang tersedia:**
- `fetchPromptsWithCreator()` - Generic fetch dengan options
- `fetchViralPromptsWithCreator()` - Fetch viral prompts
- `fetchMostCopiedPromptsWithCreator()` - Fetch most copied
- `fetchLatestPromptsWithCreator()` - Fetch latest prompts
- `fetchAllPromptsWithCreator()` - Fetch all dengan pagination

**Cara Query:**
```typescript
// Query dengan Supabase (manual join)
const { data } = await supabase
  .from('prompts')
  .select(`
    *,
    profiles:user_id (
      full_name,
      email
    )
  `);

// Menggunakan utility function (lebih mudah)
const { data } = await fetchViralPromptsWithCreator(5);
```

### 3. **Update Index.tsx**
File: `src/pages/Index.tsx`

**Perubahan:**
- ✅ Import `PromptWithCreator` type dan utility functions
- ✅ Update semua state types dari `Prompt[]` ke `PromptWithCreator[]`
- ✅ Ganti semua fetch functions menggunakan utility functions baru
- ✅ Update `handleCardClick` untuk include `creatorName`

**Sebelum:**
```typescript
const { data } = await supabase
  .from("prompts")
  .select("*")
  .eq("is_viral", true);
```

**Sesudah:**
```typescript
const { data, error } = await fetchViralPromptsWithCreator(5);
// Data sudah include creator_name dan creator_email
```

---

## 📋 Cara Menggunakan

### Di Components
Sekarang setiap prompt object memiliki `creator_name`:

```typescript
prompts.map((prompt) => (
  <PromptCard
    key={prompt.id}
    title={prompt.title}
    creatorName={prompt.creator_name} // ← Tersedia!
    {...otherProps}
  />
))
```

### Di Modal
Modal `PromptDetailModal` sudah siap menerima dan menampilkan creator name:

```typescript
<PromptDetailModal
  prompt={{
    title: "Test Prompt",
    category: "Image",
    prompt: "...",
    fullPrompt: "...",
    imageUrl: "...",
    creatorName: "Aditya Fakhri" // ← Akan ditampilkan
  }}
/>
```

---

## 🔧 Next Steps

### Files yang Perlu Di-update:
1. ✅ **`src/pages/Index.tsx`** - DONE!
2. ⚠️ **`src/pages/ViralPrompts.tsx`** - TODO
3. ⚠️ **`src/pages/PromptSaya.tsx`** - TODO

### Update ViralPrompts.tsx
```typescript
import { fetchViralPromptsWithCreator, PromptWithCreator } from "@/lib/promptQueries";

// Change state type
const [prompts, setPrompts] = useState<PromptWithCreator[]>([]);

// Use new utility
const { data } = await fetchViralPromptsWithCreator(20);
```

### Update PromptSaya.tsx
```typescript
// For user's own prompts, add the creator info
const { data } = await supabase
  .from('prompts')
  .select(`
    *,
    profiles:user_id (
      full_name,
      email
    )
  `)
  .eq('user_id', user.id);
```

---

## 🎯 Benefits

1. **Automatic Creator Info**: Setiap query prompts otomatis dapat nama creator
2. **Type Safety**: TypeScript interface jelas dengan `creator_name` field
3. **Reusable**: Utility functions bisa dipakai di semua pages
4. **Performance**: Single query dengan JOIN, tidak perlu query terpisah
5. **Maintainable**: Centralized query logic di `promptQueries.ts`

---

## 📊 Database Structure

```
prompts table:
├── id (uuid)
├── user_id (uuid) → FK to profiles.id
├── title
├── category
├── prompt_text
├── full_prompt
├── image_url
├── is_viral
├── copy_count
└── created_at

profiles table:
├── id (uuid) → FK to auth.users.id
├── email
├── full_name ← Diambil dari sini!
├── created_at
└── updated_at
```

**Query Join:**
```sql
SELECT p.*, prof.full_name as creator_name
FROM prompts p
LEFT JOIN profiles prof ON p.user_id = prof.id
```
