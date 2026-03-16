// ─── Enum types ───────────────────────────────────────────────

export type UserRole = "member" | "booth_member" | "admin";

export type BoardType = "notice" | "event" | "booth_private";

export type BoothAgeType = "general" | "adult";

export type BoothKeyword =
  | "그림회지"
  | "글회지"
  | "팬시굿즈"
  | "수공예품"
  | "무료나눔";

export type BannerGroup = "top_carousel" | "middle_carousel" | "fixed_banner";

// ─── Row types (matching DB tables) ──────────────────────────

export interface UserRow {
  id: string;
  username: string;
  nickname: string;
  email: string;
  password_hash: string;
  booth_name: string | null;
  phone_last4: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface BoardPostRow {
  id: string;
  board_type: BoardType;
  title: string;
  content: string;
  author_user_id: string;
  author_display_name: string;
  is_pinned: boolean;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardCommentRow {
  id: string;
  post_id: string;
  author_user_id: string;
  author_display_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface QnaPostRow {
  id: string;
  writer_name: string;
  password_hash: string | null;
  is_secret: boolean;
  image_key: string | null;
  content: string;
  consent_to_privacy: boolean;
  created_ip: string;
  created_at: string;
}

export interface QnaAnswerRow {
  id: string;
  qna_post_id: string;
  admin_user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BoothRow {
  id: string;
  name: string;
  password_last4: string | null;
  thumbnail_image_key: string;
  hover_image_key: string | null;
  age_type: BoothAgeType;
  created_at: string;
  updated_at: string;
}

export interface BoothKeywordRow {
  id: string;
  booth_id: string;
  keyword: BoothKeyword;
}

export interface BoothParticipantRow {
  id: string;
  booth_id: string;
  name: string;
  sns_url: string | null;
  role_order: number;
}

export interface MainBannerRow {
  id: string;
  group_type: BannerGroup;
  image_key: string;
  bg_color: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

// ─── Insert types (omit server-generated fields) ─────────────

export type UserInsert = Omit<UserRow, "id" | "created_at" | "updated_at">;
export type BoardPostInsert = Omit<BoardPostRow, "id" | "created_at" | "updated_at">;
export type BoardCommentInsert = Omit<BoardCommentRow, "id" | "created_at" | "updated_at">;
export type QnaPostInsert = Omit<QnaPostRow, "id" | "created_at">;
export type QnaAnswerInsert = Omit<QnaAnswerRow, "id" | "created_at" | "updated_at">;
export type BoothInsert = Omit<BoothRow, "id" | "created_at" | "updated_at">;
export type BoothKeywordInsert = Omit<BoothKeywordRow, "id">;
export type BoothParticipantInsert = Omit<BoothParticipantRow, "id">;
export type MainBannerInsert = Omit<MainBannerRow, "id">;

// ─── Update types (all fields optional except id) ────────────

export type UserUpdate = Partial<Omit<UserRow, "id" | "created_at">> & { id: string };
export type BoardPostUpdate = Partial<Omit<BoardPostRow, "id" | "created_at">> & { id: string };
export type BoardCommentUpdate = Partial<Omit<BoardCommentRow, "id" | "created_at">> & { id: string };
export type QnaAnswerUpdate = Partial<Omit<QnaAnswerRow, "id" | "created_at">> & { id: string };
export type BoothUpdate = Partial<Omit<BoothRow, "id" | "created_at">> & { id: string };
export type MainBannerUpdate = Partial<Omit<MainBannerRow, "id">> & { id: string };

// ─── Supabase Database type ──────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: Partial<UserInsert>;
      };
      board_posts: {
        Row: BoardPostRow;
        Insert: BoardPostInsert;
        Update: Partial<BoardPostInsert>;
      };
      board_comments: {
        Row: BoardCommentRow;
        Insert: BoardCommentInsert;
        Update: Partial<BoardCommentInsert>;
      };
      qna_posts: {
        Row: QnaPostRow;
        Insert: QnaPostInsert;
        Update: Partial<QnaPostInsert>;
      };
      qna_answers: {
        Row: QnaAnswerRow;
        Insert: QnaAnswerInsert;
        Update: Partial<QnaAnswerInsert>;
      };
      booths: {
        Row: BoothRow;
        Insert: BoothInsert;
        Update: Partial<BoothInsert>;
      };
      booth_keywords: {
        Row: BoothKeywordRow;
        Insert: BoothKeywordInsert;
        Update: Partial<BoothKeywordInsert>;
      };
      booth_participants: {
        Row: BoothParticipantRow;
        Insert: BoothParticipantInsert;
        Update: Partial<BoothParticipantInsert>;
      };
      main_banners: {
        Row: MainBannerRow;
        Insert: MainBannerInsert;
        Update: Partial<MainBannerInsert>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      board_type: BoardType;
      booth_age_type: BoothAgeType;
      banner_group: BannerGroup;
    };
  };
}
