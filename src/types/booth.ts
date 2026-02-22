interface Booth {
    id: number;
    name: string;
    location: string;
    current_user_id: number | null;
    is_active: boolean;
    is_open: boolean; // เพิ่มเพื่อใช้ในหน้า UI
    crated_at: string;
}

export type { Booth };  