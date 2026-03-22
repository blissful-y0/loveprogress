"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  placeholder?: string;
}

export function ImageUpload({ value, onChange, folder, placeholder = "이미지 선택" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "업로드 실패");
        return;
      }
      onChange(data.url);
    } catch {
      setError("업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="미리보기"
          className="w-full max-h-40 object-contain rounded-[8px] border border-[#e0e0e0] bg-[#fafafa]"
        />
      )}
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[13px] px-4 py-2 border border-[#e0e0e0] rounded-[8px] hover:border-primary hover:text-primary disabled:opacity-50 transition-colors"
        >
          {uploading ? "업로드 중..." : placeholder}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[12px] text-[#aaa] hover:text-red-500 transition-colors"
          >
            삭제
          </button>
        )}
      </div>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
