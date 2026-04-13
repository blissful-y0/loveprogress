/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const TOP_BAR_TEXT = "파이낙사 온리전 :: 사랑의 진도 2 ~9학년이지만 졸업유예하겠습니다!~";

const DISCLAIMER_TEXT =
  "이 행사는 오직 2차 창작 교류를 위한 행사로, 비공식/비영리 행위임을 밝힙니다.";

export default function Footer() {
  return (
    <footer className="w-full">
      {/* Top Bar */}
      <div className="border-t border-border-light bg-white">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 flex items-center justify-between py-2.5">
          <p className="text-[13px] text-text-light leading-relaxed">
            {TOP_BAR_TEXT}
          </p>
          <div className="flex items-center gap-4 shrink-0 ml-6">
            <Link
              href="https://x.com/phainaxa_event"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="opacity-50 hover:opacity-80 transition-opacity"
            >
              <img src="/img/main/footer/twitter_1.png" alt="Twitter" width={18} height={18} />
            </Link>
            <Link
              href="https://phainaxa.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Home"
              className="opacity-50 hover:opacity-80 transition-opacity"
            >
              <img src="/img/main/footer/home.png" alt="Home" width={18} height={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="bg-[#f8f9fa]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-3">
          <p className="text-[12px] font-light text-text-muted leading-[1.8] mb-2">
            {DISCLAIMER_TEXT}
          </p>

          <div className="flex flex-col gap-0.5 text-[12px] font-light text-text-muted leading-[1.8]">
            <p>
              대표자명: 총장
              <span className="mx-2 text-border">|</span>
              TWT:{" "}
              <Link
                href="https://x.com/phainaxa_event"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-sub transition-colors"
              >
                @phainaxa_event
              </Link>
              <span className="mx-2 text-border">|</span>
              이메일:{" "}
              <Link
                href="mailto:admin@phainaxa.com"
                className="hover:text-text-sub transition-colors"
              >
                admin@phainaxa.com
              </Link>
            </p>
            <p className="text-text-lighter">release on 2026.04.18</p>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200">
            <p
              className="text-[11px] text-text-lighter leading-relaxed"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
              }}
            >
              Copyright &copy; 2026 파이낙사 온리전 총장 All right reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
