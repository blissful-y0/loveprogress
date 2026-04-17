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

export function PrivacyModal() {
  return (
    <Dialog>
      <DialogTrigger className="text-primary underline underline-offset-2 text-sm font-bold cursor-pointer">
        자세히
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            QNA 문의 개인정보 수집 및 이용 동의
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h3 className="font-semibold text-foreground mb-1">
              수집 및 이용 목적
            </h3>
            <p>사용자의 문의 사항에 대한 정확하고 원활한 응대</p>
            <p>서비스 이용 혼선 방지 및 안전한 웹사이트 이용 환경 조성</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">
              수집하는 개인정보 항목
            </h3>
            <p>작성자명, 작성비밀번호, 문의 내용, 접속 IP 주소</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">
              보유 및 이용 기간
            </h3>
            <p>문의 처리 완료 후 1개월간 보관 후 지체 없이 파기</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">
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
