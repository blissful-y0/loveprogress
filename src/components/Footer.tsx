/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const TOP_BAR_TEXT =
  "파이낙사 온리전 – 사랑의 진도 2 – 어린이/아이지만 졸업으미 허접으니 #31 –";

const DISCLAIMER_TEXT =
  "본 사이트는 비공식/비영리 팬 행사 안내 사이트이며 실제 학교나 교육 기관과는 관련이 없습니다.";

export default function Footer() {
  return (
    <footer className="w-full">
      {/* Top Bar */}
      <div className="border-t border-border-light bg-white">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 flex items-center justify-between py-4">
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
              href="/"
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
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-8">
          <p className="text-[12px] text-text-light leading-[1.8] mb-5">
            {DISCLAIMER_TEXT}
          </p>

          <div className="flex flex-col gap-1.5 text-[12px] text-text-light leading-[1.8]">
            <p>
              대표자명: 교무부장
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
            <p className="text-text-lighter">release on 2025. 04. 20.</p>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-200">
            <p
              className="text-[11px] text-text-lighter leading-relaxed"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
              }}
            >
              Copyright &copy; 2026 깨달음의 나무 정원 교무지원 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
