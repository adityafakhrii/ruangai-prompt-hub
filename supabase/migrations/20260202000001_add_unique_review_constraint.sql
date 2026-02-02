-- Hapus review duplikat, sisakan yang paling baru berdasarkan created_at
DELETE FROM reviews
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (partition BY user_id, prompt_id ORDER BY created_at DESC) as rnum
        FROM reviews
    ) t
    WHERE t.rnum > 1
);

-- Tambahkan unique constraint untuk mencegah double review di masa depan
ALTER TABLE reviews 
ADD CONSTRAINT reviews_user_id_prompt_id_key UNIQUE (user_id, prompt_id);
