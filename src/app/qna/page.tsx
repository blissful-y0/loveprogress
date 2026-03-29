import { QnaList } from "./_components/qna-list";
import { PageHeader } from "@/components/page-header";

export default function QnaPage() {
  return (
    <div className="max-w-[820px] mx-auto px-4 md:px-6 py-10 space-y-6">

      {/* Page header */}
      <PageHeader
        title="나무광장 · 상담 접수"
        subtitle="총장이 직접 확인하고 성실히 답변 드리겠습니다."
      />

      {/* Notice box */}
      <div className="rounded-[14px] border border-[#dff0e9] bg-[#f7fbf9] px-6 py-4">
        <p className="text-[12px] font-bold text-primary tracking-wide mb-3">이용 안내</p>
        <ul className="space-y-1.5 text-[13px] text-[#606060] leading-relaxed list-none">
          <li className="flex gap-2"><span className="text-primary shrink-0">·</span>접수된 문의는 검토 후 총장이 직접 답변을 등록합니다.</li>
          <li className="flex gap-2"><span className="text-primary shrink-0">·</span>비밀글 설정 시 작성자 본인과 관리자만 내용을 열람할 수 있습니다.</li>
          <li className="flex gap-2"><span className="text-primary shrink-0">·</span>등록된 문의는 수정 및 삭제가 불가합니다.</li>
          <li className="flex gap-2"><span className="text-primary shrink-0">·</span>허위 사실 기재 또는 비방성 내용은 사전 고지 없이 삭제될 수 있습니다.</li>
        </ul>
      </div>

      {/* QnA list with write form and pagination */}
      <QnaList />
    </div>
  );
}
