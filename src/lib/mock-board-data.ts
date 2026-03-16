export interface BoardPost {
  id: string;
  boardType: "notice" | "event";
  title: string;
  content: string;
  authorDisplayName: string;
  isPinned: boolean;
  createdAt: string;
}

const NOTICE_POSTS: BoardPost[] = [
  {
    id: "1",
    boardType: "notice",
    title: "[필독] 파이낙사 온리전 :: 사랑의 진도 행사 안내 및 유의사항",
    content:
      "안녕하세요, 파이낙사 온리전 :: 사랑의 진도 운영진입니다.\n\n이번 행사는 2026년 4월 20일에 개최됩니다. 행사 참여에 앞서 아래 유의사항을 반드시 확인해 주세요.\n\n1. 행사장 내 음식물 반입은 금지됩니다.\n2. 촬영은 부스어 동의 하에만 가능합니다.\n3. 행사장 내 질서를 유지해 주세요.\n4. 분실물은 운영 본부에 문의해 주세요.\n\n즐거운 행사가 되길 바랍니다. 감사합니다.",
    authorDisplayName: "교무부장",
    isPinned: true,
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "2",
    boardType: "notice",
    title: "부스 배치도 확정 안내",
    content:
      "부스 배치도가 확정되었습니다.\n\n첨부된 이미지를 참고하여 본인 부스 위치를 확인해 주세요. 변경 사항이 있을 경우 운영진에게 문의 바랍니다.\n\n부스 설치 시간은 당일 오전 8시부터이며, 행사 시작 30분 전까지 완료해 주시기 바랍니다.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-04-05T14:00:00Z",
  },
  {
    id: "3",
    boardType: "notice",
    title: "참가비 입금 확인 안내",
    content:
      "참가비 입금이 확인된 분들께 순차적으로 안내 메시지를 발송하고 있습니다.\n\n입금 후 3일 이내에 확인 메시지를 받지 못하신 분은 트위터 DM으로 문의해 주세요.\n\n입금 계좌: 카카오뱅크 3333-00-0000000 (예금주: 운영진)\n참가비: 50,000원",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-04-03T10:30:00Z",
  },
  {
    id: "4",
    boardType: "notice",
    title: "홈페이지 회원가입 안내",
    content:
      "사랑의 진도 홈페이지가 오픈되었습니다.\n\n회원가입 후 부스어 인증을 받으시면 부스어 전용 게시판을 이용하실 수 있습니다.\n\n회원가입 방법:\n1. 우측 상단 '회원가입' 클릭\n2. 필수 정보 입력\n3. 부스이름 입력 (부스어인 경우)\n4. 가입 완료 후 운영진에게 등업 요청",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-28T11:00:00Z",
  },
  {
    id: "5",
    boardType: "notice",
    title: "굿즈 제작 가이드라인",
    content:
      "굿즈 제작 시 아래 가이드라인을 참고해 주세요.\n\n1. 2차 창작물은 원작의 저작권을 존중해 주세요.\n2. 성인용 굿즈는 반드시 성인 부스에서만 판매 가능합니다.\n3. 무료 나눔 굿즈도 사전 신고가 필요합니다.\n4. 식품류 굿즈는 위생 관련 규정을 준수해 주세요.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-25T16:00:00Z",
  },
  {
    id: "6",
    boardType: "notice",
    title: "트위터 공식 계정 안내",
    content:
      "파이낙사 온리전 :: 사랑의 진도의 공식 트위터 계정을 안내드립니다.\n\n@phainaxa_event\n\n행사 관련 최신 소식과 공지사항을 트위터에서도 확인하실 수 있습니다. 많은 팔로우 부탁드립니다.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-20T09:00:00Z",
  },
  {
    id: "7",
    boardType: "notice",
    title: "부스 참가 신청 마감 안내",
    content:
      "부스 참가 신청이 마감되었습니다.\n\n총 신청 부스 수: 45개\n확정 부스 수: 40개\n\n대기 번호를 받으신 분들은 추가 모집 시 우선 연락드리겠습니다. 감사합니다.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-15T18:00:00Z",
  },
  {
    id: "8",
    boardType: "notice",
    title: "행사장 오시는 길",
    content:
      "행사장 위치 및 교통편을 안내드립니다.\n\n주소: 서울특별시 OO구 OO로 123\n\n대중교통:\n- 지하철 O호선 OO역 3번 출구 도보 5분\n- 버스 OO번, OO번 OO정류장 하차\n\n주차 안내:\n- 행사장 내 주차가 불가합니다.\n- 인근 공영주차장을 이용해 주세요.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-10T12:00:00Z",
  },
];

const EVENT_POSTS: BoardPost[] = [
  {
    id: "101",
    boardType: "event",
    title: "[이벤트] 사랑의 진도 스탬프 랠리 안내",
    content:
      "행사 당일 스탬프 랠리를 진행합니다!\n\n참여 방법:\n1. 입장 시 스탬프 용지를 수령합니다.\n2. 지정된 5개 부스를 방문하여 스탬프를 받습니다.\n3. 스탬프를 모두 모은 후 운영 본부에서 경품을 수령합니다.\n\n경품:\n- 1등: 한정판 아크릴 스탠드\n- 2등: 스티커 세트\n- 참가상: 엽서 1장\n\n많은 참여 부탁드립니다!",
    authorDisplayName: "교무부장",
    isPinned: true,
    createdAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "102",
    boardType: "event",
    title: "트위터 팔로우 이벤트",
    content:
      "공식 트위터 계정 팔로우 이벤트를 진행합니다.\n\n기간: 2026.03.20 ~ 2026.04.19\n\n참여 방법:\n1. @phainaxa_event 팔로우\n2. 이벤트 게시글 RT\n3. 인용 RT로 기대평 남기기\n\n추첨을 통해 5명에게 행사 굿즈 세트를 선물로 드립니다.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-20T14:00:00Z",
  },
  {
    id: "103",
    boardType: "event",
    title: "코스프레 참가 안내",
    content:
      "사랑의 진도 행사에서 코스프레를 환영합니다!\n\n코스프레 참가 시 유의사항:\n1. 행사장 내 탈의실을 이용해 주세요.\n2. 무기류 소품은 안전 검사를 받아야 합니다.\n3. 촬영은 상대방 동의 하에 진행해 주세요.\n4. 행사장 외부 코스프레 시 주의해 주세요.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-18T11:30:00Z",
  },
  {
    id: "104",
    boardType: "event",
    title: "현장 럭키드로우 이벤트",
    content:
      "행사 당일 현장에서 럭키드로우를 진행합니다.\n\n참여 조건: 부스에서 1만원 이상 구매한 영수증 지참\n\n경품:\n- 대상: 태블릿\n- 금상: 블루투스 이어폰\n- 은상: 문화상품권 1만원\n- 동상: 음료 교환권\n\n추첨 시간: 오후 4시 (메인 무대)",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-15T09:00:00Z",
  },
  {
    id: "105",
    boardType: "event",
    title: "포토존 운영 안내",
    content:
      "행사장 내 포토존을 운영합니다.\n\n위치: 메인 홀 입구\n운영 시간: 10:00 ~ 17:00\n\n폴라로이드 촬영도 가능하며, 1회 촬영 시 1,000원입니다.\n데코 소품도 준비되어 있으니 자유롭게 이용해 주세요.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-12T15:00:00Z",
  },
  {
    id: "106",
    boardType: "event",
    title: "사전 예약 할인 이벤트",
    content:
      "사전 예약 시 입장료 할인 혜택을 제공합니다.\n\n일반 입장료: 5,000원\n사전 예약 입장료: 3,000원\n\n예약 기간: 2026.03.01 ~ 2026.04.15\n예약 방법: 구글폼 링크 (추후 공개)\n\n사전 예약하신 분은 당일 전용 입구로 빠르게 입장하실 수 있습니다.",
    authorDisplayName: "교무부장",
    isPinned: false,
    createdAt: "2026-03-01T10:00:00Z",
  },
];

const POSTS_BY_TYPE: Record<BoardPost["boardType"], BoardPost[]> = {
  notice: NOTICE_POSTS,
  event: EVENT_POSTS,
};

function sortByDateDesc(posts: readonly BoardPost[]): BoardPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPostsByType(type: BoardPost["boardType"]): BoardPost[] {
  return sortByDateDesc(POSTS_BY_TYPE[type]);
}

export function getPostById(
  type: BoardPost["boardType"],
  id: string
): BoardPost | undefined {
  return POSTS_BY_TYPE[type].find((p) => p.id === id);
}

export function getAdjacentPosts(
  type: BoardPost["boardType"],
  id: string
): { prev: BoardPost | null; next: BoardPost | null } {
  const sorted = getPostsByType(type);
  const index = sorted.findIndex((p) => p.id === id);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < sorted.length - 1 ? sorted[index + 1] : null,
    next: index > 0 ? sorted[index - 1] : null,
  };
}

export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
