export const CHARACTERS = [
  { id: 1, key: "1-sports", src: "/img/qna/1-sports.png", label: "체육특기생" },
  { id: 2, key: "2-model", src: "/img/qna/2-model.png", label: "교지모델" },
  {
    id: 3,
    key: "3-aviation",
    src: "/img/qna/3-aviation.png",
    label: "항공과졸업생",
  },
  {
    id: 4,
    key: "4-pension",
    src: "/img/qna/4-pension.png",
    label: "연금특기생",
  },
  { id: 5, key: "5-cafe", src: "/img/qna/5-cafe.png", label: "학내카페사장" },
  {
    id: 6,
    key: "6-professor",
    src: "/img/qna/6-professor.png",
    label: "산학협력교수",
  },
  {
    id: 7,
    key: "7-thief",
    src: "/img/qna/7-thief.png",
    label: "부스를훔치는자",
  },
] as const;

export const PLACEHOLDER_TEXT =
  "행사에 관한 문의를 남겨주세요. 확인 후 총장이 직접 답변을 남겨드립니다.\n등록한 질문은 수정하거나 삭제할 수 없습니다.\n안전한 서비스 이용을 위해 문의글 작성자의 IP정보를 수집합니다.";

export const QNA_PAGE_LIMIT = 10;

export function getCharacterByKey(key: string | null) {
  return CHARACTERS.find((c) => c.key === key) ?? CHARACTERS[0];
}
