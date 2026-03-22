import { QnaList } from "./_components/qna-list";

export default function QnaPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-foreground text-center">QnA</h1>

      {/* QnA list with write form and pagination */}
      <QnaList />
    </div>
  );
}
