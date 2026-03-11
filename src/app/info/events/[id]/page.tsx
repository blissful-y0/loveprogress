export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-bold text-[#212121]">학내 행사 상세</h1>
      <p className="text-[#909090]">게시글 #{id} - 준비 중입니다</p>
    </div>
  );
}
