import type { QnaItem } from "./types";

export const CHARACTERS = [
  { id: 1, src: "/img/qna/1-sports.png", label: "체육특기생" },
  { id: 2, src: "/img/qna/2-model.png", label: "교지모델" },
  { id: 3, src: "/img/qna/3-aviation.png", label: "항공과졸업생" },
  { id: 4, src: "/img/qna/4-pension.png", label: "연금특기생" },
  { id: 5, src: "/img/qna/5-cafe.png", label: "학내카페사장" },
  { id: 6, src: "/img/qna/6-professor.png", label: "산학협력교수" },
  { id: 7, src: "/img/qna/7-thief.png", label: "부스를훔치는자" },
] as const;

export const PLACEHOLDER_TEXT =
  "행사에 관한 문의를 남겨주세요. 확인 후 교무처장이 직접 답변을 남겨드립니다.\n등록한 질문은 수정하거나 삭제할 수 없습니다.\n안전한 서비스 이용을 위해 문의글 작성자의 IP정보를 수집합니다.";

// TODO: 실제 API 연동 시 비밀글 content는 서버에서 검증 후 반환
export const MOCK_DATA: QnaItem[] = [
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
    content: "비밀글입니다",
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
    content: "비밀글입니다",
    isSecret: true,
    answer: null,
  },
];

export const TOTAL_USERS = 128;
