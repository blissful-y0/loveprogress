import { QnaCard } from "./_components/qna-card";
import { WriteForm } from "./_components/write-form";
import { MOCK_DATA } from "./_lib/constants";

export default function QnaPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-foreground text-center">QnA</h1>

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
