# 사랑의 진도 웹사이트 개발 스펙

## 1. 프로젝트 개요

- **사이트 성격**: 행사 안내 + 게시판 + 부스 리스트 + QnA + 운영자 관리
- **브랜드/행사명**: **파이낙사 온리전 :: 사랑의 진도**
- **주요 목적**
  - 행사 소개 및 유의사항 안내
  - 공지/학내행사 안내 게시판 운영
  - 부스 리스트 공개
  - 비회원 포함 QnA 접수
  - 부스어 전용 게시판 운영
  - 운영진이 배너/공지/QnA 답변/부스 정보/회원 등급을 관리

---

## 2. 전역 규칙

### 2.1 폰트 및 스타일

- **기본 폰트**: Pretendard
- 원본 기획 메모상 전체 자간 `-50` 요청
- 단, 푸터의 `ⓒ` 출력 문제 때문에 푸터 일부는 시스템 기본 폰트 대체 허용
- **대표 색상**
  - 진한 텍스트: `#212121`
  - 보조 텍스트: `#505050`
  - 비선택 메뉴/연한 텍스트: `#606060`, `#909090`, `#b0b0b0`
  - 포인트 그린: `#34aa8f`
  - 구분선: `#d0d0d0`, `#e5e5e5`, `#f0f0f0`

### 2.2 회원 및 권한

권한 레벨은 최소 아래처럼 구분한다.

| 역할 | 설명 |
|------|------|
| `guest` | 로그인하지 않은 사용자. QnA 작성 가능, 일반 게시판 읽기 가능 |
| `member` | 일반 회원. 로그인 가능, 부스 전용 게시판 접근 불가 |
| `booth_member` | 부스어 승인 회원. 부스어 전용 게시판 접근/글/댓글 작성 가능 |
| `admin` | 관리자. 공지 등록, 게시글 작성/수정, QnA 답변, 배너 수정, 부스 업로드, 회원 등급 변경 가능 |

### 2.3 공통 인증 규칙

- 회원가입 필요
- 로그인 필수 영역 존재
- 관리자 로그인 시 일반 로그인 드롭다운 또는 메뉴에서 관리자 진입 가능
- 비밀번호 문의 시 강제 초기화 지원
- 초기화 기본번호: `702430`
- 아이디 저장 기능 필요

---

## 3. 정보구조(IA)

### 3.1 페이지 목록

| 경로 | 설명 |
|------|------|
| `/` | 메인 |
| `/` (반응형) | 모바일/태블릿/데스크탑 단일 경로 |
| `/auth/login` | 로그인 |
| `/auth/register` | 회원가입 |
| `/about/event` | 행사안내 |
| `/info` | 인포게시판 |
| `/booths` | 부스리스트 |
| `/qna` | QnA |
| `/booth-board` | 부스어 전용 게시판 |
| `/admin` | 관리자 |

### 3.2 메뉴 구조

| 메뉴 카테고리 | 실제 기능 |
|--------------|----------|
| 대학소개 | 행사안내 |
| 입학·교육 | 인포게시판 |
| 대학생활 | 부스리스트 |
| 나무광장 | QnA |
| 우애의관 | 부스어전용게시판 |
| 로그인 | - |
| 회원가입 | - |
| 관리자 | 어드민 로그인 시만 노출 |

---

## 4. 데이터 모델

### 4.1 User

```ts
type UserRole = "member" | "booth_member" | "admin";

interface User {
  id: string;
  username: string;          // 로그인 ID
  nickname: string;
  email: string;
  passwordHash: string;
  boothName?: string;        // 회원가입 시 optional
  boothPasswordHint?: string; // 휴대폰 뒷자리 메모성 저장 가능
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
```

### 4.2 BoardPost

```ts
type BoardType = "notice" | "event" | "booth_private";

interface BoardPost {
  id: string;
  boardType: BoardType;
  title: string;
  content: string;
  authorUserId: string;
  authorDisplayName: string;
  isPinned: boolean;
  isSecret: boolean; // 부스어 전용 게시판 용도 확장 가능
  createdAt: string;
  updatedAt: string;
}
```

### 4.3 BoardComment

```ts
interface BoardComment {
  id: string;
  postId: string;
  authorUserId: string;
  authorDisplayName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4.4 QnaPost

```ts
interface QnaPost {
  id: string;
  writerName: string;
  passwordHash?: string;        // 비회원 비밀글 확인용
  isSecret: boolean;
  imageKey?: string;            // 7개 선택 이미지 중 1개
  content: string;
  consentToPrivacy: boolean;
  createdIp: string;
  createdAt: string;
}
```

### 4.5 QnaAnswer

```ts
interface QnaAnswer {
  id: string;
  qnaPostId: string;
  adminUserId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4.6 Booth

```ts
type BoothAgeType = "general" | "adult";
type BoothKeyword =
  | "그림회지"
  | "글회지"
  | "팬시굿즈"
  | "수공예품"
  | "무료나눔";

interface BoothParticipant {
  name: string;
  snsUrl?: string;
}

interface Booth {
  id: string;
  name: string;
  passwordLast4?: string;       // 관리용
  thumbnailImageKey: string;    // 부스컷
  hoverImageKey?: string;       // 롤오버 이미지
  ageType: BoothAgeType;
  keywords: BoothKeyword[];
  owner: BoothParticipant;      // 대표자
  participants: BoothParticipant[]; // 최대 3명 추가
  createdAt: string;
  updatedAt: string;
}
```

### 4.7 MainBanner

```ts
type BannerGroup = "top_carousel" | "middle_carousel" | "fixed_banner";

interface MainBanner {
  id: string;
  group: BannerGroup;
  imageKey: string;
  bgColor?: string; // top carousel은 배너별 배경색 필요
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
}
```

---

## 5. 페이지별 기능 명세

### 5.1 메인 페이지 `/`

**목적**: 첫 진입 랜딩, 메뉴 탐색, 행사 공지/행사안내 진입, 배너 노출, 외부 링크 제공.

#### 구성 요소

**로고**
- 이미지 제공 예정
- 폴더: `img-main`

**상단 메뉴줄**
- 선택 메뉴 색상: `#212121`
- 비선택 메뉴 색상: `#606060`
- 선택/hover 시 아래 3px 바 노출
- 메뉴와 바 간격 15px

**로그인 영역**
- 클릭 시 드롭다운
- 항목: 회원가입 / 로그인 / 관리자(관리자 로그인 시만)
- 드롭다운 박스: 약 100×90, border radius 8, border `#909090`
- 선택영역 아래 연한 배경 박스 삽입

**상단 캐러셀 배너**
- 최대 5개
- 폴더: `img-main-topcarousel`
- 배너 크기: 1280×450
- radius 30
- 관리자 수정 가능
- 배너별 배경색 저장 필요
- 캐러셀 전환 시 배경색도 함께 변경
- 참고 UX: poom 사이트 메인

**인디케이터**
- 배경 `#000000` 15% opacity
- 높이 20
- 너비 45
- 텍스트 흰색

**중앙 캐러셀 배너**
- 최대 3개
- 폴더: `img-main`
- 크기: 260×100
- 중앙 점형 인디케이터
- 활성 점 색상 `#505050`, 비활성 `#c0c0c0`

**고정 배너**
- 폴더: `img-main`
- 크기: 100×100
- 배경 `#f0f0f0`
- radius 15

**게시판 섹션 1**
- 입학·교육(공지사항) 게시판과 연동
- 최신순 5개 출력
- 제목, 날짜, new 뱃지 표시
- 섹션 제목: **Notice**
- 설명문: 나무정원에서 전하는 주요 공지를 확인하세요.
- `more >` 링크 필요

**게시판 섹션 2**
- 학사안내(이벤트) 메뉴와 연동
- 최신 1개 출력
- 제목 + 본문 미리보기 150자
- `more >` 링크 필요
- 좌측 이미지 노출
- 이미지 폴더: `img-main-board`
- 좌측 이미지 크기 200×230
- 트위터 원형 이미지 30×30

**바로가기 아이콘**
- 폴더: `img-main-footer`
- 트위터: https://x.com/phainaxa_event
- 홈페이지: 구버전 링크

**푸터**
- 행사 비공식/비영리 안내문
- 대표자명/TWT/이메일 표시
- `release on 2025. 04. 20.`
- copyright 문구 출력

#### 메인 데이터 연동 규칙

- 게시판1 = notice 게시판 최신 5개
- 게시판2 = event 게시판 최신 1개
- 상단/중앙/고정 배너는 관리자 페이지에서 편집
- 관리자 로그인 시 관리자 메뉴 노출

### 5.2 반응형 레이아웃

별도 모바일 라우트(`/m`) 없이 **단일 경로 + CSS 반응형**으로 구현한다.

#### Breakpoints

| 구간 | 범위 | 비고 |
|------|------|------|
| Mobile | ~767px | 단일 컬럼 |
| Tablet | 768px~1279px | 유연 레이아웃 |
| Desktop | 1280px~ | max-width 1280px 콘텐츠 영역 |

#### Desktop (1280px~)

- **상단 캐러셀 배경 + 푸터 배경**: full-width (뷰포트 전체)
- **그 외 모든 콘텐츠**: `max-width: 1280px; margin: 0 auto;`
- 캐러셀 내부 카드도 1280px 컨테이너 안에서 정렬
- 게시판 섹션: 2분할 (Notice 좌 / Academic Info 우)

#### Tablet (768px~1279px)

- 콘텐츠 100% width, 좌우 패딩 24px
- 아이콘 배너 영역: flex-wrap (3+3 또는 2열 그리드)
- 게시판 2분할 유지, 좁으면 세로 스택 전환
- 캐러셀 양쪽 peek 축소

#### Mobile (~767px)

- 단일 컬럼 스택
- 헤더: 로고 + 햄버거 메뉴 (드로어 네비게이션)
- 캐러셀: 양쪽 peek 제거, 1장씩 풀폭
- 아이콘 배너: 2열 그리드 또는 가로 스크롤
- Notice / Academic Info: 세로 배치
- 부스리스트: 1열
- 구버전 사이트 링크 제거 가능
- 배경색과 캐러셀 사이 간격 15px 유지

### 5.3 로그인 `/auth/login`

**기능**
- ID / 비밀번호 로그인
- 로그인 버튼
- 간편 로그인 아이콘 영역
- ID 찾기
- 비밀번호 재설정
- 회원가입 이동

**세부 규칙**
- 로그인 박스 크기: 약 500×500, radius 15
- 로그인 버튼: 400×50, radius 10, `#34aa8f`
- **ID 찾기**: 이메일 입력 후 해당 계정 ID 앞 4글자만 노출
  - 예: `phainaxa` → `phai****`
- **비밀번호 재설정**: 아이디 + 이메일 일치 시 재설정 가능
- **간편 로그인 아이콘**: 폴더 `img-login`
- 아이디 저장 기능 필요

**API 초안**

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/find-id` | ID 찾기 |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 |

### 5.4 회원가입 `/auth/register`

**기능**
- 일반 회원가입
- 디스코드 간편 회원가입
- 아이디 중복 확인

**입력 항목**
- 아이디
- 닉네임
- 비밀번호
- 이메일
- 부스이름 (optional)
- 휴대폰번호 뒷자리 또는 대체 메모 (optional)

**세부 규칙**
- 회원가입 박스: 약 500×460, radius 15, shadow
- 중복확인 버튼 필요
- 가입하기 버튼: 420×40, radius 10, `#34aa8f`
- 디스코드 간편 회원가입 문구/아이콘 필요
- 추후 관리자가 회원 등급을 `booth_member`로 올릴 수 있어야 함

**API 초안**

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/check-username` | 아이디 중복확인 |
| POST | `/api/auth/register-discord` | 디스코드 간편가입 |

### 5.5 행사안내 `/about/event`

**용도**: 행사 소개, 일정, 장소, 유의사항 공지.

**본문 내용**
- 행사 개요
- 날짜/장소
- 유의사항 리스트
- 운영 규칙

**관리자 로그인 시에만 수정 버튼 노출**
- 수정 버튼 디자인은 임의 가능
- 수정 후 저장 가능해야 함

**구현 방식**
- 권장: 단일 CMS 페이지
- HTML 에디터 또는 구조화된 텍스트 필드로 관리

**API 초안**

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/pages/event-intro` | 행사안내 조회 |
| PUT | `/api/pages/event-intro` | 행사안내 수정 (admin only) |

### 5.6 인포게시판 `/info`

이 영역은 사실상 단일 게시판 2종으로 해석한다.

#### 게시판 A: 공지사항

- 헤더명: **입학처 공지사항**
- 형식: 리스트형
- 컬럼: 번호 / 제목 / 글쓴이 / 작성시간
- 페이지당 최대 10개
- 10개 초과 시 페이지네이션
- 상단 고정 공지 1개 가능
- 공지 아이콘: 메가폰 이모지 사용
- 글쓰기 권한: admin
- 댓글 기능 없음
- 상세 페이지에서 이전글/다음글 제공
- 목록으로 돌아가기 / 글쓰기 / 본인 작성글 수정 버튼 제공

#### 게시판 B: 학내 행사 안내

- 동일한 단일 게시판 구조로 별도 분리 운영
- 메인에서 이벤트성 최신 글 1개를 불러오는 소스로 사용

#### 게시글 작성기

- 제목/본문/이미지 업로드 지원
- 에디터 페이지 필요

**라우트 권장안**

| 경로 | 설명 |
|------|------|
| `/info/notices` | 공지사항 목록 |
| `/info/events` | 행사안내 목록 |
| `/info/notices/:id` | 공지사항 상세 |
| `/info/events/:id` | 행사안내 상세 |
| `/info/write` | 글쓰기 (admin) |

### 5.7 부스리스트 `/booths`

**목적**: 행사 참가 부스 목록 공개 및 필터링.

#### 기본 표시 정보

- 부스컷 이미지
- 롤오버 이미지(없으면 기본 부스컷 재사용)
- 부스 이름
- 부스어 리스트
- 부스어별 외부 링크(주로 트위터)

#### 소팅 시스템

단일 선택과 다중 선택이 섞여 있으므로 프론트 상태를 명확히 설계해야 한다.

**그룹 A: 연령 구분 (단일 선택)**

| 필터 | 동작 |
|------|------|
| `#전체보기` | 필터 초기화 |
| `#일반` | 일반만 |
| `#성인` | 성인만 |

- 일반과 성인은 동시 선택 불가
- 전체보기 선택 시 필터 초기화

**그룹 B: 키워드 구분 (다중 선택)**

- `#그림 회지`
- `#글 회지`
- `#팬시 굿즈`
- `#수공예품`
- `#무료나눔`

- 다중 선택 가능
- 그룹 A 조건과 조합 필터 가능

#### 부스 표시 규칙

- 부스 이름 최대 20자(공백 포함)
- 대표자 1명 + 추가 참가자 최대 3명
- 참가자 각각 SNS 링크 가능
- 모바일은 1줄에 1개씩 표시

#### 현재 초기 데이터

- 주최부스 1개 우선 등록
- 실적용 이름 예시: `파이낙사 온리전 :: 사랑의 진도 주최부스`
- 실적용 부스어 예시: `교무부장`
- 예시 링크: https://x.com/phainaxa_event

#### 관리자 운영 이슈

- 향후 직접 업로드 기능 또는 유지보수 처리 중 선택 가능
- 우선은 관리자 업로드 가능하게 설계하는 편이 안전

**API 초안**

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/booths` | 부스 목록 |
| GET | `/api/booths/:id` | 부스 상세 |
| POST | `/api/admin/booths` | 부스 등록 |
| PUT | `/api/admin/booths/:id` | 부스 수정 |
| DELETE | `/api/admin/booths/:id` | 부스 삭제 |

### 5.8 QnA `/qna`

#### 핵심 요구사항

- 비회원 글작성 가능
- 비밀글 기능 필수
- 작성 후 수정/삭제 불가
- 비회원/일반회원/부스회원 모두 삭제 불가
- 관리자는 답변 가능

#### 작성 폼

**입력 항목:**
- 이름 (최대 20자)
- 비밀번호 (최대 10자)
- 비밀글 체크박스
- 이미지 선택 (7개 중 1개)
- 본문
- 개인정보 수집/이용 동의 체크

#### UI 요구사항

- 배경 그라데이션 `#c2e5dd` → `#FFFFFF`
- 이미지 선택박스: `img-QNA-pic`
- 본문 입력칸: 1070×160, radius 10, border `#d0d0d0`
- **placeholder:**

  > 행사에 관한 문의를 남겨주세요. 확인 후 교무처장이 직접 답변을 남겨드립니다.
  > 등록한 질문은 수정하거나 삭제할 수 없습니다.
  > 안전한 서비스 이용을 위해 문의글 작성자의 IP정보를 수집합니다.

- 입력 시작 시 placeholder 제거

#### 개인정보 동의 팝업/모달

동의문 전문을 그대로 표시한다.

> **수집 및 이용 목적**
> 사용자의 문의 사항에 대한 정확하고 원활한 응대
> 서비스 이용 혼선 방지 및 안전한 웹사이트 이용 환경 조성
>
> **수집하는 개인정보 항목**
> 작성자명, 작성비밀번호, 문의 내용, 접속 IP 주소
>
> **보유 및 이용 기간**
> 문의 처리 완료 후 1개월간 보관 후 지체 없이 파기
>
> **동의를 거부할 권리 및 불이익 안내**
> 귀하는 위 개인정보 수집 및 이용에 대한 동의를 거부할 수 있습니다.
> 단, 수집 동의를 거부하실 경우 QNA 문의 접수 및 답변 안내가 제한될 수 있습니다.

#### 목록/상세 규칙

- 글번호 표시
- 이름은 작성 시 입력한 이름 표시
- 비밀글일 경우 비밀번호 입력 후 열람 가능
- 회원이 등록한 글이거나 비밀글이 아니면 비밀번호 입력칸 숨김
- 질문 본문 박스와 답변 박스를 분리 표시
  - 질문: `#eaf6f4`
  - 답변: `#f0f0f0`

**API 초안**

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/qna` | QnA 목록 |
| POST | `/api/qna` | QnA 작성 |
| POST | `/api/qna/:id/verify-password` | 비밀글 비밀번호 검증 |
| GET | `/api/qna/:id` | QnA 상세 |
| POST | `/api/admin/qna/:id/answer` | 관리자 답변 |

### 5.9 부스어 전용 게시판 `/booth-board`

#### 접근 정책

- 로그인 + 부스어 승인 후 이용 가능
- `booth_member` 이상만 사용 가능

#### 기능

- 인포게시판과 유사한 단일 게시판
- 부스어도 글쓰기 가능
- 비밀글 설정 가능
- 작성자명은 닉네임으로 표시
- 상세 본문 아래 댓글 기능 필요
- 댓글 작성 권한: 부스어 이상
- 인포/이벤트 게시판에는 댓글 불필요

**권장 라우트**

| 경로 | 설명 |
|------|------|
| `/booth-board` | 목록 |
| `/booth-board/:id` | 상세 |
| `/booth-board/write` | 글쓰기 |

### 5.10 관리자 `/admin`

#### 관리자 철학

- 디자인 완성도보다 기능 우선
- 각 수정사항은 입력/삭제 후 **적용하기** 버튼으로 반영

#### 주요 기능

**메인 롤링 배너 관리**
- 상단/중앙/고정 배너 등록/수정/삭제
- 이미지, 링크, 배경색, 순서 관리

**게시판 상단 공지 관리**
- 공지사항/이벤트/부스게시판 상단공지 지정
- 현재 공지 게시물 번호 확인 가능
- 게시물 앞 라디오박스 + 등록하기 버튼

**부스 등록/관리**
- 이름(부스명)
- 비밀번호(휴대폰번호 뒷자리)
- 부스컷
- 롤오버 부스컷
- 성인/일반 구분
- 키워드 구분
- 대표자 + SNS 링크
- 참가자 + SNS 링크(최대 3명)
- 상세보기로 전체 글 확인 가능

**QnA 답변**
- 하단 답변 입력 후 답변하기 버튼

**회원 관리**
- 비밀번호 초기화 (초기화 번호 `702430`)
- 부스회원 등록
- 일반회원 전환
- 입금 취소/미입금 대응 위해 role 변경 가능해야 함

**엑셀 다운로드**
- 컬럼 순서: 순번, 이름, 참여자, 키워드, 비밀번호
- 부스 리스트 데이터 export

**관리자 API 초안**

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/dashboard` | 대시보드 |
| POST | `/api/admin/banners` | 배너 등록 |
| PUT | `/api/admin/banners/:id` | 배너 수정 |
| DELETE | `/api/admin/banners/:id` | 배너 삭제 |
| POST | `/api/admin/boards/:boardType/pin` | 게시글 상단고정 |
| POST | `/api/admin/booths` | 부스 등록 |
| PUT | `/api/admin/booths/:id` | 부스 수정 |
| GET | `/api/admin/booths/export.xlsx` | 엑셀 다운로드 |
| POST | `/api/admin/qna/:id/answer` | QnA 답변 |
| POST | `/api/admin/users/:id/reset-password` | 비밀번호 초기화 |
| POST | `/api/admin/users/:id/change-role` | 회원 등급 변경 |

---

## 6. 권한 매트릭스

| 기능 | guest | member | booth_member | admin |
|------|-------|--------|--------------|-------|
| 메인/행사안내/공지 읽기 | ✅ | ✅ | ✅ | ✅ |
| 회원가입/로그인 | ✅ | - | - | - |
| QnA 작성 | ✅ | ✅ | ✅ | ✅ |
| QnA 삭제 | ❌ | ❌ | ❌ | ✅ |
| QnA 답변 | ❌ | ❌ | ❌ | ✅ |
| 인포/이벤트 게시글 작성 | ❌ | ❌ | ❌ | ✅ |
| 부스리스트 열람 | ✅ | ✅ | ✅ | ✅ |
| 부스어 전용게시판 열람 | ❌ | ❌ | ✅ | ✅ |
| 부스어 전용게시판 글쓰기 | ❌ | ❌ | ✅ | ✅ |
| 부스어 전용게시판 댓글 | ❌ | ❌ | ✅ | ✅ |
| 회원 등급 변경 | ❌ | ❌ | ❌ | ✅ |
| 배너 수정 | ❌ | ❌ | ❌ | ✅ |

---

## 7. DB 테이블 권장안

### users

| 컬럼 | 비고 |
|------|------|
| id | PK |
| username | unique |
| nickname | |
| email | unique |
| password_hash | |
| booth_name | nullable |
| phone_last4 | nullable |
| role | |
| created_at | |
| updated_at | |

### board_posts

| 컬럼 | 비고 |
|------|------|
| id | PK |
| board_type | |
| title | |
| content | |
| author_user_id | |
| author_display_name | |
| is_pinned | |
| is_secret | |
| created_at | |
| updated_at | |

### board_comments

| 컬럼 | 비고 |
|------|------|
| id | PK |
| post_id | FK |
| author_user_id | |
| author_display_name | |
| content | |
| created_at | |
| updated_at | |

### qna_posts

| 컬럼 | 비고 |
|------|------|
| id | PK |
| writer_name | |
| password_hash | nullable |
| is_secret | |
| image_key | nullable |
| content | |
| consent_to_privacy | |
| created_ip | |
| created_at | |

### qna_answers

| 컬럼 | 비고 |
|------|------|
| id | PK |
| qna_post_id | FK |
| admin_user_id | FK |
| content | |
| created_at | |
| updated_at | |

### booths

| 컬럼 | 비고 |
|------|------|
| id | PK |
| name | |
| password_last4 | |
| thumbnail_image_key | |
| hover_image_key | nullable |
| age_type | |
| created_at | |
| updated_at | |

### booth_keywords

| 컬럼 | 비고 |
|------|------|
| id | PK |
| booth_id | FK |
| keyword | |

### booth_participants

| 컬럼 | 비고 |
|------|------|
| id | PK |
| booth_id | FK |
| name | |
| sns_url | |
| role_order | |

### main_banners

| 컬럼 | 비고 |
|------|------|
| id | PK |
| group_type | |
| image_key | |
| bg_color | |
| link_url | |
| sort_order | |
| is_active | |

---

## 8. 업로드 폴더 규칙

원본 기획서 메모를 기준으로 저장소 키 또는 업로드 카테고리를 맞춘다.

| 폴더명 | 용도 |
|--------|------|
| `img-main` | 메인 페이지 이미지 |
| `img-main-topcarousel` | 상단 캐러셀 배너 |
| `img-main-board` | 메인 게시판 섹션 이미지 |
| `img-main-footer` | 푸터 아이콘 |
| `img-login` | 로그인 페이지 이미지 |
| `img-booth` | 부스 이미지 |
| `img-QNA` | QnA 이미지 |
| `img-QNA-pic` | QnA 선택 이미지 |

**권장:**
- 실제 구현은 S3/Cloudflare R2/local storage 중 하나로 추상화
- DB에는 file key만 저장

---

## 9. 코덱스 작업 우선순위

### 1차 구현

1. 공통 레이아웃/헤더/푸터
2. 로그인/회원가입
3. 행사안내 단일 페이지
4. 공지/이벤트 게시판
5. QnA
6. 부스리스트
7. 관리자 로그인/권한체크

### 2차 구현

1. 관리자 배너 편집
2. 부스 업로드/수정/엑셀 다운로드
3. 부스어 전용 게시판
4. role 전환 및 비밀번호 초기화 도구

---

## 10. 기술 구현 메모

- 원본은 화면기획서라 API/DB가 정의되어 있지 않음
- 게시판은 실제로 3종 분리하는 쪽이 구현이 깔끔함
  - 공지사항
  - 행사안내
  - 부스어 전용 게시판
- QnA는 일반 게시판과 분리해야 함
  - 비회원 작성
  - 비밀글 비밀번호 검증
  - IP 저장
  - 수정/삭제 제한
- 부스리스트는 게시판보다 catalog 성격이 강하므로 별도 엔티티가 적절
- 관리자 페이지는 미관보다 작업 효율 우선

---

## 11. 코덱스 프롬프트용 요약

아래 문단은 Codex에 바로 붙일 수 있는 작업 지시용 요약이다.

> 이 프로젝트는 행사 안내 사이트다. 구현해야 할 핵심 기능은 다음과 같다.
>
> **1. 회원가입/로그인**
> - username, nickname, email, password 기반 일반 회원가입
> - 관리자에 의해 role(member / booth_member / admin) 변경 가능
> - 아이디 찾기, 비밀번호 재설정 지원
> - 비밀번호 강제 초기화 기본값 `702430`
>
> **2. 게시판**
> - notice 게시판: 관리자만 작성 가능, 상단 공지 1개, 목록/상세/이전글/다음글
> - event 게시판: notice와 동일 구조, 메인 최신글 1개 연동
> - booth private 게시판: booth_member 이상만 접근, 부스어도 글쓰기 가능, 댓글 가능, 비밀글 가능
>
> **3. QnA**
> - 비회원 작성 가능
> - 이름, 비밀번호, 비밀글 여부, 이미지 선택, 본문, 개인정보 동의
> - 작성 후 사용자 수정/삭제 불가
> - 비밀글은 비밀번호 검증 후 열람
> - 관리자는 답변 작성 가능
> - 작성자 IP 저장
>
> **4. 부스리스트**
> - 부스컷, 롤오버 이미지, 부스명, 참가자 목록, SNS 링크
> - 필터: 전체보기/일반/성인 + 다중 키워드
> - 모바일에서는 1열 배치
> - 관리자가 부스 등록/수정/삭제 및 엑셀 다운로드 가능
>
> **5. 메인**
> - 상단 캐러셀 최대 5개, 중앙 배너 최대 3개, 고정배너
> - 공지게시판 최신 5개, 이벤트게시판 최신 1개 노출
> - 관리자 로그인 시 관리자 메뉴 노출
>
> **6. 관리자**
> - 배너 관리
> - 공지 고정
> - QnA 답변
> - 부스 등록/엑셀 다운로드
> - 회원 role 변경 및 비밀번호 초기화

---

## 12. 기술 스택

### 선정 기준

- 일일 방문자 ~1,000명 (트래픽 부담 낮음)
- CRUD 중심 (게시판, QnA, 부스 카탈로그, 관리자)
- 인증 + 파일 업로드 + 역할 기반 권한
- 운영 비용 최소화, 빠른 개발 우선

### 권장 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| **프레임워크** | Next.js 15 (App Router) | SSR/SSG 혼합, API Routes로 백엔드 통합, 반응형 단일 빌드 |
| **스타일링** | Tailwind CSS 4 | 유틸리티 기반, Pretendard 폰트 설정 간편, 반응형 breakpoint 내장 (`sm`/`md`/`lg`) |
| **DB** | Supabase (PostgreSQL) | 관리형 PostgreSQL, 무료 티어로 1,000명 충분 |
| **인증** | Supabase Auth | 이메일/비밀번호 + Discord OAuth 내장, role 메타데이터 지원 |
| **파일 저장소** | Supabase Storage | 배너/부스컷/QnA 이미지, 버킷별 접근 정책 설정 가능 |
| **DB 접근** | Supabase Client (`@supabase/supabase-js`) | 직접 쿼리, 테이블 7~8개 수준에서 ORM 불필요 |
| **배포** | Vercel | Next.js 네이티브, 무료 티어로 일 1,000명 문제없음, 한국 엣지 노드 |
| **캐러셀** | Swiper.js | 터치/반응형 캐러셀, 배경색 전환 커스텀 용이 |
| **에디터** | TipTap 또는 Toast UI Editor | 게시글/행사안내 작성용 WYSIWYG |
| **엑셀 export** | SheetJS (xlsx) | 관리자 부스 엑셀 다운로드 |

### 권한 처리 방식

- **RLS 사용 안 함** — Next.js API Routes 미들웨어에서 세션 확인 + role 체크
- Supabase는 순수 DB + Auth + Storage로만 사용
- 권한 흐름: `요청 → API Route → 미들웨어(role 체크) → Supabase Client → DB`

### 왜 Supabase인가

- **Auth + DB + Storage 올인원**: 별도 백엔드 서버 불필요
- **Discord OAuth**: 스펙 요구사항인 디스코드 간편 로그인 바로 지원
- **실시간 구독**: 향후 QnA 답변 알림 등 확장 가능
- **무료 티어**: 500MB DB + 1GB 스토리지 + 50,000 MAU → 이 프로젝트 규모에 충분

### 대안 (참고용)

| 조건 | 대안 |
|------|------|
| Supabase 대신 직접 제어 | Neon (서버리스 PostgreSQL) + NextAuth.js + Cloudflare R2 |
| SSR 불필요한 경우 | Vite + React SPA + Express 백엔드 |
| 서버 직접 운영 가능 | NestJS + PostgreSQL + Nginx (VPS) |

---

## 13. 미정/확인 필요 항목

아래 항목은 원본에서도 완전히 명시되지 않았으므로 구현 시 합리적 기본값을 둔다.

- [ ] 소셜 로그인 실제 제공사 범위(디스코드 외 추가 여부)
- [ ] 이미지 업로드 용량/확장자 제한
- [ ] 행사안내 페이지를 WYSIWYG로 할지 JSON 블록 구조로 할지
- [ ] 관리자 계정 생성 방식
- [ ] 게시판 검색 기능 필요 여부
- [ ] 구버전 링크 실제 URL
- [x] ~~모바일을 별도 라우트로 둘지 반응형 단일 구현으로 갈지~~ → **반응형 단일 구현 확정** (Mobile/Tablet/Desktop 3단 breakpoint)

---

## 원본 엑셀에서 확인된 중요 메모

- 회원가입 필수
- Pretendard 사용
- 관리자 기능: 등업, QnA답변, 메인롤링 수정, 공지 등록, 부스업로드
- QnA는 비회원 작성 + 비밀글 필수
- 부스어 전용게시판은 부스회원 이상만 접근
- 메인 게시판 연동: 공지 최신 5개, 이벤트 최신 1개
