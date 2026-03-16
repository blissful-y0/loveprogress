export interface QnaItem {
  id: number;
  name: string;
  characterId: number;
  content: string;
  isSecret: boolean;
  answer: string | null;
}
