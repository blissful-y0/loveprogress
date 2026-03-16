"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CHARACTERS = [
  { id: 1, src: "/img/qna/1-sports.png", label: "체육특기생" },
  { id: 2, src: "/img/qna/2-model.png", label: "교지모델" },
  { id: 3, src: "/img/qna/3-aviation.png", label: "항공과졸업생" },
  { id: 4, src: "/img/qna/4-pension.png", label: "연금특기생" },
  { id: 5, src: "/img/qna/5-cafe.png", label: "학내카페사장" },
  { id: 6, src: "/img/qna/6-professor.png", label: "산학협력교수" },
  { id: 7, src: "/img/qna/7-thief.png", label: "부스를훔치는자" },
] as const;

const PLACEHOLDER_TEXT =
  "행사에 관한 문의를 남겨주세요. 확인 후 교무처장이 직접 답변을 남겨드립니다.\n등록한 질문은 수정하거나 삭제할 수 없습니다.\n안전한 서비스 이용을 위해 문의글 작성자의 IP정보를 수집합니다.";

interface QnaItem {
  id: number;
  name: string;
  characterId: number;
  content: string;
  isSecret: boolean;
  answer: string | null;
}

const MOCK_DATA: QnaItem[] = [
  {
    id: 5,
    name: "김파이",
    characterId: 1,
    content:
      "안녕하세요! 이번 행사에서 부스 신청은 어디서 하면 되나요? 참가비도 궁금합니다.",
    isSecret: false,
    answer:
      "안녕하세요! 부스 신청은 공식 트위터 DM으로 문의해 주세요. 참가비는 부스당 20,000원입니다.",
  },
  {
    id: 4,
    name: "이낙사",
    characterId: 3,
    content: "행사 당일 주차장 이용이 가능한가요?",
    isSecret: false,
    answer: null,
  },
  {
    id: 3,
    name: "박진도",
    characterId: 5,
    content: "비밀 문의입니다.",
    isSecret: true,
    answer: "확인 후 개별 연락드리겠습니다.",
  },
  {
    id: 2,
    name: "최사랑",
    characterId: 2,
    content: "굿즈 교환 가능한가요? 현장에서 바로 교환되는지 궁금합니다.",
    isSecret: false,
    answer: null,
  },
  {
    id: 1,
    name: "정온리",
    characterId: 7,
    content: "비밀 문의 - 개인정보 관련 질문입니다.",
    isSecret: true,
    answer: null,
  },
];

const TOTAL_USERS = 128;

/* ------------------------------------------------------------------ */
/*  Privacy Modal                                                      */
/* ------------------------------------------------------------------ */

function PrivacyModal() {
  return (
    <Dialog>
      <DialogTrigger
        className="text-[#34aa8f] underline underline-offset-2 text-sm cursor-pointer"
      >
        자세히
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#212121]">
            QNA 문의 개인정보 수집 및 이용 동의
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm text-[#505050] leading-relaxed">
          <section>
            <h3 className="font-semibold text-[#212121] mb-1">
              수집 및 이용 목적
            </h3>
            <p>사용자의 문의 사항에 대한 정확하고 원활한 응대</p>
            <p>서비스 이용 혼선 방지 및 안전한 웹사이트 이용 환경 조성</p>
          </section>

          <section>
            <h3 className="font-semibold text-[#212121] mb-1">
              수집하는 개인정보 항목
            </h3>
            <p>작성자명, 작성비밀번호, 문의 내용, 접속 IP 주소</p>
          </section>

          <section>
            <h3 className="font-semibold text-[#212121] mb-1">
              보유 및 이용 기간
            </h3>
            <p>문의 처리 완료 후 1개월간 보관 후 지체 없이 파기</p>
          </section>

          <section>
            <h3 className="font-semibold text-[#212121] mb-1">
              동의를 거부할 권리 및 불이익 안내
            </h3>
            <p>
              귀하는 위 개인정보 수집 및 이용에 대한 동의를 거부할 수 있습니다.
            </p>
            <p>
              단, 수집 동의를 거부하실 경우 QNA 문의 접수 및 답변 안내가 제한될
              수 있습니다.
            </p>
          </section>
        </div>

        <DialogFooter>
          <DialogClose render={<Button />}>확인</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  QnA Card                                                           */
/* ------------------------------------------------------------------ */

function QnaCard({ item }: { item: QnaItem }) {
  const [passwordInput, setPasswordInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const character = CHARACTERS.find((c) => c.id === item.characterId);

  const handleVerify = () => {
    // Mock: any non-empty password unlocks
    if (passwordInput.trim()) {
      setUnlocked(true);
    }
  };

  const showContent = !item.isSecret || unlocked;

  return (
    <div className="border border-[#d0d0d0] rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border-b border-[#e5e5e5]">
        <span className="font-semibold text-sm text-[#212121] shrink-0">
          No. {item.id}
        </span>
        {item.isSecret && (
          <Lock size={14} className="text-[#909090] shrink-0" />
        )}

        {item.isSecret && !unlocked && (
          <>
            <input
              type="text"
              value={item.name}
              readOnly
              className="border border-[#d0d0d0] rounded-md px-2 py-1 text-sm w-24 bg-[#f9f9f9] text-[#505050]"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="border border-[#d0d0d0] rounded-md px-2 py-1 text-sm w-28"
            />
            <Button
              size="sm"
              className="bg-[#34aa8f] hover:bg-[#2d9980] text-white text-sm"
              onClick={handleVerify}
            >
              게시물 보기
            </Button>
          </>
        )}

        {(!item.isSecret || unlocked) && (
          <span className="text-sm text-[#505050]">{item.name}</span>
        )}
      </div>

      {/* Body */}
      {showContent ? (
        <div className="flex flex-col md:flex-row">
          {/* Character image */}
          <div className="flex items-center justify-center p-4 md:w-[140px] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character?.src}
              alt={character?.label ?? "character"}
              className="w-[100px] h-[120px] md:w-[120px] md:h-[150px] object-contain"
            />
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col gap-0">
            {/* Question */}
            <div className="bg-[#eaf6f4] p-4 text-sm text-[#212121] leading-relaxed min-h-[80px]">
              <p className="font-semibold text-xs text-[#34aa8f] mb-1">Q.</p>
              {item.content}
            </div>

            {/* Answer */}
            {item.answer && (
              <div className="bg-[#f0f0f0] p-4 text-sm text-[#505050] leading-relaxed min-h-[60px]">
                <p className="font-semibold text-xs text-[#909090] mb-1">A.</p>
                {item.answer}
              </div>
            )}

            {!item.answer && (
              <div className="bg-[#f9f9f9] p-4 text-sm text-[#909090] italic min-h-[60px] flex items-center">
                아직 답변이 등록되지 않았습니다.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-sm text-[#909090]">
          <Lock size={16} className="mr-2" />
          비밀글입니다. 비밀번호를 입력하여 확인하세요.
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Write Form                                                         */
/* ------------------------------------------------------------------ */

function WriteForm() {
  const [selectedChar, setSelectedChar] = useState(1);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [content, setContent] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedChar);

  const handleSubmit = () => {
    if (!name.trim() || !password.trim() || !content.trim()) {
      alert("이름, 비밀번호, 내용을 모두 입력해주세요.");
      return;
    }
    if (!privacyAgreed) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }
    alert("문의가 등록되었습니다. (데모)");
  };

  return (
    <div
      className="rounded-[10px] p-5 md:p-8"
      style={{
        background: "linear-gradient(180deg, #c2e5dd 0%, #ffffff 100%)",
      }}
    >
      {/* Top: character select + inputs */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* Left: Selected character image */}
        <div className="flex items-start justify-center md:justify-start shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedCharacter?.src}
            alt={selectedCharacter?.label ?? "character"}
            className="w-[120px] h-[150px] md:w-[150px] md:h-[150px] object-contain"
          />
        </div>

        {/* Right: selectors + inputs */}
        <div className="flex-1 space-y-4">
          {/* Character selection circles */}
          <div className="flex flex-wrap items-center gap-2">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedChar(char.id)}
                className={`w-[40px] h-[40px] rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedChar === char.id
                    ? "border-[#34aa8f] ring-2 ring-[#34aa8f]/30 scale-110"
                    : "border-[#d0d0d0] opacity-60 hover:opacity-100"
                }`}
                title={char.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={char.src}
                  alt={char.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-[#909090]">
              {TOTAL_USERS}명이 이용했어요
            </span>
          </div>

          {/* Name, Password, Secret, Submit */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="이름"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#d0d0d0] rounded-md px-3 py-2 text-sm w-full sm:w-32 focus:outline-none focus:ring-1 focus:ring-[#34aa8f]"
            />
            <input
              type="password"
              placeholder="비밀번호"
              maxLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#d0d0d0] rounded-md px-3 py-2 text-sm w-full sm:w-32 focus:outline-none focus:ring-1 focus:ring-[#34aa8f]"
            />
            <label className="flex items-center gap-1 text-sm text-[#505050] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                className="accent-[#34aa8f]"
              />
              비밀글
            </label>
            <Button
              className="bg-[#34aa8f] hover:bg-[#2d9980] text-white text-sm w-full sm:w-auto"
              onClick={handleSubmit}
            >
              작성하기
            </Button>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        placeholder={PLACEHOLDER_TEXT}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mt-4 w-full h-[160px] border border-[#d0d0d0] rounded-[10px] p-4 text-sm text-[#212121] resize-none focus:outline-none focus:ring-1 focus:ring-[#34aa8f] placeholder:text-[#b0b0b0]"
      />

      {/* Privacy consent */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#505050]">
        <span>QNA 문의 개인정보 수집 및 이용 동의</span>
        <PrivacyModal />
        <span>동의함</span>
        <input
          type="checkbox"
          checked={privacyAgreed}
          onChange={(e) => setPrivacyAgreed(e.target.checked)}
          className="accent-[#34aa8f]"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function QnaPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-[#212121] text-center">QnA</h1>

      {/* Write form */}
      <WriteForm />

      {/* QnA list */}
      <div className="space-y-4">
        {MOCK_DATA.map((item) => (
          <QnaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
