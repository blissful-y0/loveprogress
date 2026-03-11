import Image from "next/image";
import Link from "next/link";

const TOP_BAR_TEXT =
  "파이낙사 온리전 – 사랑의 진도 2 – 어린이/아이지만 졸업으미 허접으니 #31 –";

const DISCLAIMER_TEXT =
  "본 사이트는 비공식/비영리 팬 행사 안내 사이트이며 실제 학교나 교육 기관과는 관련이 없습니다.";

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      {/* Top Bar */}
      <div className="border-t border-border-light">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-0 flex items-center justify-between py-3">
          <p className="text-[13px] text-text-light leading-relaxed">
            {TOP_BAR_TEXT}
          </p>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <Link
              href="https://x.com/phainaxa_event"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Image
                src="/img/main/footer/twitter_1.png"
                alt="Twitter"
                width={20}
                height={20}
              />
            </Link>
            <Link href="/" aria-label="Home">
              <Image
                src="/img/main/footer/home.png"
                alt="Home"
                width={20}
                height={20}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="bg-[#fafafa]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-0 py-6">
          <p className="text-[12px] text-text-light leading-relaxed mb-4">
            {DISCLAIMER_TEXT}
          </p>

          <div className="flex flex-col gap-1 text-[12px] text-text-light leading-relaxed">
            <p>
              대표자명: 교무부장 &nbsp;/&nbsp; TWT:{" "}
              <Link
                href="https://x.com/phainaxa_event"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                @phainaxa_event
              </Link>{" "}
              &nbsp;/&nbsp; 이메일:{" "}
              <Link
                href="mailto:admin@phainaxa.com"
                className="hover:underline"
              >
                admin@phainaxa.com
              </Link>
            </p>
            <p>release on 2025. 04. 20.</p>
          </div>

          <p
            className="mt-4 text-[11px] text-text-lighter leading-relaxed"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            }}
          >
            Copyright &copy; 2026 깨달음의 나무 정원 교무지원 All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
