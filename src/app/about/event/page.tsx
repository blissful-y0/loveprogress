import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "행사안내 | 파이낙사 온리전 :: 사랑의 진도",
  description:
    "파이낙사 온리전 :: 사랑의 진도 행사 개요, 일정, 장소, 유의사항 및 운영 규칙 안내",
};

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-text-dark md:text-2xl"
    >
      {children}
    </h2>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="min-w-[100px] shrink-0 font-semibold text-text-dark">
        {label}
      </dt>
      <dd className="text-text-sub">{children}</dd>
    </div>
  );
}

export default function EventInfoPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      {/* 페이지 제목 */}
      <header className="mb-10 text-center md:mb-14">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-dark md:text-4xl">
          행사안내
        </h1>
        <p className="mt-3 text-base text-text-sub md:text-lg">
          파이낙사 온리전 :: 사랑의 진도
        </p>
      </header>

      <div className="flex flex-col gap-12 md:gap-16">
        {/* 행사 개요 */}
        <section aria-labelledby="overview">
          <SectionHeading id="overview">행사 개요</SectionHeading>
          <div className="rounded-2xl bg-[#f8faf9] p-5 md:p-8">
            <p className="leading-relaxed text-text-sub">
              <strong className="text-text-dark">
                파이낙사 온리전 :: 사랑의 진도
              </strong>
              는 창작자와 팬이 함께 만들어가는 온리전 행사입니다. 다양한 장르의
              회지, 굿즈, 수공예품 등을 직접 만나볼 수 있으며, 참가 부스어들의
              개성 넘치는 작품을 한자리에서 감상하고 소통할 수 있는 자리입니다.
            </p>
            <p className="mt-4 leading-relaxed text-text-sub">
              나무정원이 주최하며, 참가자 간의 따뜻한 교류와 건전한 팬 문화를
              지향합니다. 많은 관심과 참여 부탁드립니다.
            </p>
          </div>
        </section>

        {/* 날짜 / 장소 */}
        <section aria-labelledby="datetime">
          <SectionHeading id="datetime">날짜 / 장소</SectionHeading>
          <dl className="flex flex-col gap-4 rounded-2xl bg-[#f8faf9] p-5 md:p-8">
            <InfoRow label="행사명">
              파이낙사 온리전 :: 사랑의 진도
            </InfoRow>
            <InfoRow label="일시">2026년 4월 20일 (일) 11:00 ~ 17:00</InfoRow>
            <InfoRow label="장소">서울특별시 (상세 장소 추후 공지)</InfoRow>
            <InfoRow label="주최">나무정원</InfoRow>
            <InfoRow label="참가 규모">부스 다수 참가 예정</InfoRow>
          </dl>
        </section>

        {/* 유의사항 */}
        <section aria-labelledby="precautions">
          <SectionHeading id="precautions">유의사항</SectionHeading>
          <ul className="flex flex-col gap-3 rounded-2xl bg-[#f8faf9] p-5 md:p-8">
            {[
              "행사장 내에서는 질서를 유지하고, 다른 참가자에게 불편을 주는 행위를 삼가 주세요.",
              "촬영 시 반드시 해당 부스어의 동의를 받아주세요. 무단 촬영은 금지됩니다.",
              "음식물 반입은 제한될 수 있습니다. 행사장 내 지정 구역을 이용해 주세요.",
              "분실물에 대한 책임은 본인에게 있으며, 행사 운영팀은 별도 보관하지 않습니다.",
              "행사장 내 흡연은 지정된 흡연 구역에서만 가능합니다.",
              "귀중품은 반드시 본인이 직접 관리해 주세요.",
              "행사 관련 공지사항은 공식 트위터(@phainaxa_event) 및 본 사이트를 통해 안내됩니다.",
            ].map((text, i) => (
              <li key={i} className="flex gap-2 text-text-sub">
                <span className="mt-0.5 shrink-0 text-primary">&#8226;</span>
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 운영 규칙 */}
        <section aria-labelledby="rules">
          <SectionHeading id="rules">운영 규칙</SectionHeading>
          <ol className="flex flex-col gap-3 rounded-2xl bg-[#f8faf9] p-5 md:p-8">
            {[
              "부스 참가자는 행사 시작 1시간 전까지 입장 및 세팅을 완료해야 합니다.",
              "성인 창작물이 포함된 부스는 별도 구역에서 운영되며, 연령 확인 절차를 진행합니다.",
              "부스 이동 및 위치 변경은 운영팀의 사전 승인 없이 불가합니다.",
              "행사 종료 후 부스 구역은 원상복구하여 정리해 주세요.",
              "행사 중 발생하는 거래 관련 분쟁은 당사자 간 해결을 원칙으로 하며, 운영팀은 중재를 지원합니다.",
              "긴급 상황 발생 시 운영팀의 안내에 따라 주세요.",
              "무단 전단지 배포, 홍보물 부착 등은 금지됩니다.",
              "운영 규칙을 위반할 경우 퇴장 조치될 수 있습니다.",
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-text-sub">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* 관리자 수정 버튼 - 향후 admin 로그인 시에만 노출 */}
      {/* <div className="mt-12 flex justify-end">
        <button className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d9a80] transition-colors">
          수정하기
        </button>
      </div> */}
    </div>
  );
}
