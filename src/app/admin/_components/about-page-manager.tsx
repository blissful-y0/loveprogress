"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadIcon, ExternalLinkIcon } from "lucide-react";

const HTML_MARKER = "<!--LOVEPROGRESS:HTML-->";

export default function AboutPageManager() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    fetch("/api/site-pages/about")
      .then((r) => r.json())
      .then((d) => setHasContent(!!d.content))
      .catch(() => {});
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setHtmlContent((ev.target?.result as string) ?? "");
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleUpload() {
    if (!htmlContent.trim()) {
      setError("HTML 파일을 선택해주세요.");
      return;
    }

    setError("");
    setSuccess(false);
    setUploading(true);

    try {
      const res = await fetch("/api/site-pages/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: HTML_MARKER + htmlContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "업로드에 실패했습니다.");
        return;
      }

      setSuccess(true);
      setHasContent(true);
      setFileName("");
      setHtmlContent("");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#505050]">
          대학소개 페이지에 표시될 HTML 파일을 업로드합니다.
        </p>
        {hasContent && (
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#34aa8f] hover:underline"
          >
            <ExternalLinkIcon className="size-4" />
            현재 페이지 보기
          </a>
        )}
      </div>

      <div className="space-y-4">
        <div
          className="flex items-center gap-3 rounded-lg border border-dashed border-[#d0d0d0] px-4 py-5 hover:border-[#34aa8f] transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon className="size-5 text-[#909090]" />
          <span className="text-sm text-[#909090]">
            {fileName || "HTML 파일을 선택하세요 (.html, .htm)"}
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".html,.htm"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && (
        <p className="text-sm text-[#34aa8f]">대학소개 페이지가 업데이트되었습니다.</p>
      )}

      <Button
        disabled={uploading || !htmlContent.trim()}
        onClick={handleUpload}
        className="bg-[#34aa8f] text-white hover:bg-[#2d9a7f]"
      >
        {uploading ? "업로드 중..." : hasContent ? "페이지 교체" : "페이지 등록"}
      </Button>
    </div>
  );
}
