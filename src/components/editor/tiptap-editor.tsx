"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListIcon,
  ListOrderedIcon,
  ImageIcon,
  LinkIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  QuoteIcon,
  SeparatorHorizontalIcon,
  Undo2Icon,
  Redo2Icon,
  UploadIcon,
  CodeIcon,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  uploadEndpoint?: string;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
        active
          ? "bg-primary/15 text-primary"
          : "text-[#666] hover:bg-[#f0f0f0] hover:text-[#333]"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-[#e0e0e0] mx-0.5" />;
}

export default function TiptapEditor({ content, onChange, placeholder = "내용을 입력하세요...", uploadEndpoint }: TiptapEditorProps) {
  const [showHtml, setShowHtml] = useState(false);
  const [htmlSource, setHtmlSource] = useState(content);

  // Tiptap의 onUpdate 콜백은 useEditor 초기화 시점에 closure로 고정되므로
  // HTML 모드 여부를 ref로 참조해 WYSIWYG 업데이트가 HTML 편집을 덮어쓰지 않게 한다.
  const showHtmlRef = useRef(showHtml);
  useEffect(() => {
    showHtmlRef.current = showHtml;
  }, [showHtml]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full rounded-lg" },
        allowBase64: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      if (showHtmlRef.current) return;
      const html = e.getHTML();
      setHtmlSource(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none px-4 py-3 min-h-[300px] focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const addImageByUrl = () => {
    const url = window.prompt("이미지 URL을 입력하세요");
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        alert("http 또는 https URL만 입력 가능합니다.");
        return;
      }

      // Ask for alignment
      const alignment = window.prompt("정렬을 선택하세요 (left, center, right)", "center");
      const validAlign = ["left", "center", "right"].includes(alignment ?? "") ? alignment! : "center";

      // Ask for link
      const linkUrl = window.prompt("이미지에 연결할 링크 URL (없으면 비워두세요)", "");

      if (linkUrl) {
        try {
          const parsedLink = new URL(linkUrl);
          if (!["http:", "https:"].includes(parsedLink.protocol)) {
            alert("http 또는 https URL만 입력 가능합니다.");
            return;
          }
        } catch {
          alert("올바른 URL을 입력해주세요.");
          return;
        }
        // Insert image wrapped in a link using HTML
        const imgHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer"><img src="${url}" style="display:block;${validAlign === "center" ? "margin:0 auto;" : validAlign === "right" ? "margin-left:auto;" : ""}" /></a>`;
        editor.chain().focus().insertContent(imgHtml).run();
      } else {
        editor.chain().focus().setImage({ src: url }).run();
        // Apply alignment after inserting
        if (validAlign !== "left") {
          editor.chain().focus().setTextAlign(validAlign).run();
        }
      }
    } catch {
      alert("올바른 URL을 입력해주세요.");
    }
  };

  const addImageByUpload = () => {
    if (!uploadEndpoint) { addImageByUrl(); return; }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(uploadEndpoint, { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          // Ask for alignment
          const alignment = window.prompt("정렬을 선택하세요 (left, center, right)", "center");
          const validAlign = ["left", "center", "right"].includes(alignment ?? "") ? alignment! : "center";

          // Ask for link
          const linkUrl = window.prompt("이미지에 연결할 링크 URL (없으면 비워두세요)", "");

          if (linkUrl) {
            try {
              const parsedLink = new URL(linkUrl);
              if (!["http:", "https:"].includes(parsedLink.protocol)) {
                alert("http 또는 https URL만 입력 가능합니다.");
                return;
              }
            } catch {
              alert("올바른 URL을 입력해주세요.");
              return;
            }
            const imgHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer"><img src="${data.url}" style="display:block;${validAlign === "center" ? "margin:0 auto;" : validAlign === "right" ? "margin-left:auto;" : ""}" /></a>`;
            editor.chain().focus().insertContent(imgHtml).run();
          } else {
            editor.chain().focus().setImage({ src: data.url }).run();
            if (validAlign !== "left") {
              editor.chain().focus().setTextAlign(validAlign).run();
            }
          }
        } else {
          alert(data.error ?? "이미지 업로드에 실패했습니다.");
        }
      } catch {
        alert("이미지 업로드에 실패했습니다.");
      }
    };
    input.click();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL을 입력하세요", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        alert("http 또는 https URL만 입력 가능합니다.");
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } catch {
      alert("올바른 URL을 입력해주세요.");
    }
  };

  const toggleHtmlView = () => {
    if (!showHtml) {
      // WYSIWYG → HTML: editor HTML을 그대로 초기값으로
      setHtmlSource(editor.getHTML());
      setShowHtml(true);
      return;
    }
    // HTML → WYSIWYG: Tiptap schema로 재파싱되어 <br>/링크 감싼 이미지 등 일부 구조가 유실될 수 있음
    if (
      !window.confirm(
        "WYSIWYG으로 돌아가면 Tiptap이 HTML을 재정규화해서 일부 태그(중첩 <a><img>, 연속 <br>, 이미지 정렬 등)가 손실될 수 있습니다.\n\n저장은 HTML 모드에서 직접 가능합니다. 계속하시겠습니까?",
      )
    ) {
      return;
    }
    // ref를 먼저 false로 내린 뒤 setContent 트리거 (onUpdate가 stale closure 값에 의존하지 않도록)
    showHtmlRef.current = false;
    editor.commands.setContent(htmlSource);
    onChange(htmlSource);
    setShowHtml(false);
  };

  const iconSize = "size-4";

  return (
    <div className="border border-[#e0e0e0] rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#e8e8e8] bg-[#fafafa]">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="실행 취소">
          <Undo2Icon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="다시 실행">
          <Redo2Icon className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="제목 1">
          <Heading1Icon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="제목 2">
          <Heading2Icon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="제목 3">
          <Heading3Icon className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="굵게">
          <BoldIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="기울임">
          <ItalicIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="밑줄">
          <UnderlineIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="취소선">
          <StrikethroughIcon className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="왼쪽 정렬">
          <AlignLeftIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="가운데 정렬">
          <AlignCenterIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="오른쪽 정렬">
          <AlignRightIcon className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="글머리 기호">
          <ListIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="번호 목록">
          <ListOrderedIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용">
          <QuoteIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
          <SeparatorHorizontalIcon className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="링크">
          <LinkIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={addImageByUrl} title="이미지 URL">
          <ImageIcon className={iconSize} />
        </ToolbarButton>
        {uploadEndpoint && (
          <ToolbarButton onClick={addImageByUpload} title="이미지 업로드">
            <UploadIcon className={iconSize} />
          </ToolbarButton>
        )}

        <ToolbarDivider />

        <ToolbarButton onClick={toggleHtmlView} active={showHtml} title="HTML 보기">
          <CodeIcon className={iconSize} />
        </ToolbarButton>
      </div>

      {/* Editor / HTML source view */}
      {showHtml ? (
        <>
          <div className="px-4 py-2 bg-[#fff8e5] border-b border-[#ffe9a8] text-[11.5px] text-[#8a6300] leading-relaxed">
            HTML 원본 편집 모드입니다. 입력한 HTML이 그대로 저장됩니다.
            <br />
            &lt;br&gt;, &lt;a href&gt;&lt;img&gt;&lt;/a&gt;, 이미지 정렬 style 등 자유롭게 작성하세요.
            <br />
            단, 표시 단계에서 보안 정리가 이뤄져 &lt;iframe&gt;·&lt;script&gt;·이벤트 핸들러·허용 외 CSS는 제거됩니다.
          </div>
          <textarea
            value={htmlSource}
            onChange={(e) => {
              const next = e.target.value;
              setHtmlSource(next);
              onChange(next);
            }}
            className="w-full px-4 py-3 min-h-[300px] text-sm font-mono text-[#333] bg-[#fafafa] focus:outline-none resize-y"
            spellCheck={false}
          />
        </>
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
