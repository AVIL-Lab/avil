# AVIL Lab Website · AVIL 연구실 홈페이지

Website of the **Advanced Visual Intelligence Lab (AVIL)**, Department of Electronic Engineering, Yeungnam University.
Live site: **<https://avil-lab.github.io/avil/>**

영남대학교 전자공학과 **지능형시각정보처리연구실(AVIL)** 홈페이지입니다.
주소: **<https://avil-lab.github.io/avil/>**

This guide is written for a new administrator who has never worked on the site. Each section is given in English first, then in Korean. Read sections 1 to 4 once; after that, jump straight to the task you need in section 5.

이 문서는 홈페이지를 처음 맡은 관리자를 위한 안내서입니다. 각 항목은 영어, 한국어 순서로 적었습니다. 1~4장은 한 번 읽어 두고, 이후에는 5장에서 필요한 작업만 찾아 따라 하면 됩니다.

---

## Contents · 목차

1. How the site works · 사이트 작동 방식
2. Two ways to edit · 수정하는 두 가지 방법
3. Writing YAML without errors · YAML 작성 규칙
4. Where everything lives · 파일 위치
5. Step-by-step tasks · 작업별 안내
   - 5.1 Add a new member · 새 구성원 추가
   - 5.2 Edit a member (email, LinkedIn, homepage, research areas, About me) · 구성원 정보 수정
   - 5.3 Move a member to alumni · 졸업생으로 이동
   - 5.4 Remove a member · 구성원 삭제
   - 5.5 Update the professor page · 교수 페이지 수정
   - 5.6 Add a publication · 논문 추가
   - 5.7 Add news and a photo · 소식과 사진 추가
   - 5.8 Add or update a project · 과제 추가 및 수정
   - 5.9 Update equipment · 보유 장비 수정
   - 5.10 Edit the lab introduction, contact and partners · 연구실 소개, 연락처, 협력 기관 수정
   - 5.11 Edit the home page research domains · 홈 화면 연구 분야 수정
   - 5.12 Edit the research themes and robotics section · 연구 주제 및 로보틱스 수정
   - 5.13 Conference deadlines and Q1 journals · 학회 마감일과 Q1 저널
   - 5.14 Change the menu or add a new page · 메뉴 변경 및 새 페이지 추가
6. Image rules · 이미지 규칙
7. Checking that your change went live · 반영 확인
8. Troubleshooting · 문제 해결
9. Access and accounts · 권한과 계정
10. Preview on your own computer · 내 컴퓨터에서 미리 보기

---

## 1. How the site works · 사이트 작동 방식

The site is built with **Jekyll** and hosted free by **GitHub Pages**. You never edit web pages directly. Almost all content (members, papers, news, projects) lives in plain text files in the `_data/` folder. When you save a change to the `main` branch, GitHub rebuilds the whole site automatically and publishes it in about one to two minutes. There is no server to log into and nothing to upload by hand.

이 사이트는 **Jekyll**로 만들어 **GitHub Pages**에서 무료로 운영합니다. 웹 페이지를 직접 고치지 않습니다. 구성원, 논문, 소식, 과제 같은 내용은 거의 모두 `_data/` 폴더의 텍스트 파일에 들어 있습니다. `main` 브랜치에 변경 사항을 저장하면 GitHub가 사이트 전체를 자동으로 다시 만들고 1~2분 안에 게시합니다. 접속할 서버도, 손으로 올릴 파일도 없습니다.

Every page reads from these data files. For example, the Members page, the home page counters, the search box and the research explorer all read `_data/members.yml`. Change a member once in that file and every page updates together.

모든 페이지는 이 데이터 파일을 읽습니다. 예를 들어 구성원 페이지, 홈 화면 숫자, 검색창, 연구 분야 탐색 화면은 모두 `_data/members.yml`을 읽습니다. 이 파일에서 한 번만 고치면 모든 페이지가 함께 바뀝니다.

Most text exists in English and Korean. In the data files these come as pairs such as `en:` and `ko:` (or `name` and `name_ko`). The `EN / 한국어` switch at the top of the site chooses which one visitors see. If a Korean version is missing, the English text is shown in both modes.

대부분의 글은 영어와 한국어 두 가지로 있습니다. 데이터 파일에서는 `en:`, `ko:` (또는 `name`, `name_ko`) 처럼 짝으로 적습니다. 사이트 상단의 `EN / 한국어` 버튼이 방문자에게 보일 언어를 고릅니다. 한국어가 비어 있으면 두 모드 모두 영어가 보입니다.

---

## 2. Two ways to edit · 수정하는 두 가지 방법

**Option A: edit on the GitHub website (recommended, nothing to install).** Open <https://github.com/AVIL-Lab/avil>, click into the file you want (for example `_data/members.yml`), click the pencil icon ✏️ ("Edit this file"), make the change, then click **Commit changes…**, write a short message such as `Add new member Hong Gildong`, keep "Commit directly to the main branch" selected, and confirm. To upload a photo, open the target folder (for example `assets/img/members/`), click **Add file → Upload files**, drop the image in, and commit.

**방법 A: GitHub 웹사이트에서 수정 (추천, 설치 불필요).** <https://github.com/AVIL-Lab/avil> 에 들어가 고칠 파일(예: `_data/members.yml`)을 엽니다. 연필 아이콘 ✏️ ("Edit this file")을 누르고 내용을 고친 뒤 **Commit changes…** 를 누릅니다. `새 구성원 홍길동 추가` 같은 짧은 설명을 쓰고 "Commit directly to the main branch"가 선택된 상태에서 확인합니다. 사진을 올릴 때는 해당 폴더(예: `assets/img/members/`)를 열고 **Add file → Upload files** 로 이미지를 끌어다 놓은 뒤 커밋합니다.

**Option B: edit on your own computer with Git.** Use this for large changes or to preview before publishing (see section 10).

**방법 B: 내 컴퓨터에서 Git으로 수정.** 큰 수정을 하거나 게시 전에 미리 보고 싶을 때 사용합니다 (10장 참고).

```bash
git clone https://github.com/AVIL-Lab/avil.git
cd avil
# edit files, then:
git add -A
git commit -m "Add new member Hong Gildong"
git push origin main
```

Whichever option you use, make one logical change per commit with a clear message. If something breaks, it is then easy to see which change caused it and undo it.

어떤 방법이든 한 번의 커밋에는 한 가지 수정만 담고 설명을 분명하게 적으세요. 문제가 생겼을 때 어떤 수정이 원인인지 찾고 되돌리기 쉽습니다.

---

## 3. Writing YAML without errors · YAML 작성 규칙

The data files use **YAML**. It is simple, but a single mistake stops the whole site from rebuilding (the live site keeps showing the previous version until you fix it). Follow these rules:

데이터 파일은 **YAML** 형식입니다. 간단하지만 작은 실수 하나로 사이트 전체가 다시 만들어지지 않습니다 (고칠 때까지 이전 버전이 계속 보입니다). 다음 규칙을 지키세요.

- **Indent with spaces, never tabs.** Each entry starts with `- ` and its fields are indented by two spaces under it.
  **들여쓰기는 탭이 아닌 공백으로 합니다.** 각 항목은 `- `로 시작하고, 그 아래 항목들은 공백 두 칸 들여씁니다.
- **Put text in double quotes when it contains a colon followed by a space (`: `), a `#`, or starts with `[`, `{`, `*`, `&`, `!`, `%`, `@` or a quote.** Example: `title: "Results: a new method"`.
  **글에 `콜론+공백(: )`이나 `#`이 들어가거나, `[`, `{`, `*`, `&`, `!`, `%`, `@`, 따옴표로 시작하면 큰따옴표로 감쌉니다.** 예: `title: "Results: a new method"`.
- **Lists go in square brackets**, separated by commas: `interests: [Deep Learning, Object Detection]`.
  **목록은 대괄호 안에 쉼표로 구분합니다**: `interests: [Deep Learning, Object Detection]`.
- **Empty values are written as `""`**, for example `linkedin: ""`.
  **빈 값은 `""`로 적습니다.** 예: `linkedin: ""`.
- **Write dates in quotes** as `"2026-07-29"` (day precision) or `2026-02` (month precision), exactly as the examples in each file show.
  **날짜는 각 파일의 예시처럼** `"2026-07-29"` (일 단위) 또는 `2026-02` (월 단위) 형식으로 적습니다.
- **Lines starting with `#` are comments.** The top of every data file explains its fields; read it before editing.
  **`#`로 시작하는 줄은 설명(주석)입니다.** 모든 데이터 파일 맨 위에 항목 설명이 있으니 수정 전에 읽어 보세요.
- **Copy an existing entry and change it** instead of typing a new one from scratch. This is the safest way to keep the format right.
  **새로 처음부터 쓰기보다 기존 항목을 복사해서 고치세요.** 형식을 지키는 가장 안전한 방법입니다.

---

## 4. Where everything lives · 파일 위치

| Path · 경로 | What it holds · 내용 |
|---|---|
| `_data/members.yml` | Current members · 현재 구성원 |
| `_data/alumni.yml` | Alumni · 졸업생 |
| `_data/professor.yml` | Professor profile and career · 교수 프로필과 경력 |
| `_data/publications.yml` | All publications · 전체 논문 |
| `_data/events.yml` | News items, one per photo (News, Gallery, home news) · 소식 (사진 1장당 1개, 소식/갤러리/홈 화면) |
| `_data/projects.yml` | Current and past projects · 진행 및 완료 과제 |
| `_data/equipment.yml` | Lab equipment · 보유 장비 |
| `_data/lab.yml` | Lab name, introduction, purpose, RLRC text, contact, partners · 연구실 이름, 소개, 목표, RLRC, 연락처, 협력 기관 |
| `_data/domains.yml` | Home page research domains (Defense AI, Medical AI, Physical Super Intelligence) · 홈 화면 연구 분야 |
| `_data/themes.yml` | Research page themes · 연구 페이지 연구 주제 |
| `_data/modalities.yml` | Sensor types used by the sensing explorer and paper filter · 센서 종류 (센싱 탐색 및 논문 필터) |
| `_data/navigation.yml` | Top menu · 상단 메뉴 |
| `_data/conferences.yml`, `_data/journals.yml` | Copied automatically every day, do not edit here (see 5.13) · 매일 자동 복사됨, 여기서 수정 금지 (5.13 참고) |
| `assets/img/members/` | Member, alumni and professor photos · 구성원, 졸업생, 교수 사진 |
| `assets/img/gallery/` and `assets/img/gallery/thumbs/` | News photos and their thumbnails · 소식 사진과 썸네일 |
| `assets/img/partners/`, `assets/img/research/`, `assets/img/brand/` | Partner logos, research figures, logo and icons · 협력 기관 로고, 연구 그림, 로고와 아이콘 |
| `index.html`, `members.html`, `publications.html`, … | Page templates (layout only, rarely edited) · 페이지 틀 (레이아웃, 거의 수정하지 않음) |
| `_includes/`, `_layouts/` | Shared page parts (header, footer, explorers) · 공통 부품 (머리말, 꼬리말, 탐색 화면) |
| `assets/css/`, `assets/js/` | Styles and interactive behaviour · 디자인과 동작 |
| `.github/workflows/` | Automatic daily sync job · 매일 자동 동기화 작업 |
| `_config.yml` | Site settings (title, address) · 사이트 설정 (제목, 주소) |

---

## 5. Step-by-step tasks · 작업별 안내

### 5.1 Add a new member · 새 구성원 추가

**Step 1. Prepare the photo.** Use a portrait (vertical) photo with the face in the upper third. Crop it to a 3:4 ratio, for example 360 × 480 pixels, and save it as `.webp` or `.jpg` under 200 KB. Name the file with lowercase English letters and hyphens, such as `gildong-hong.webp`. Upload it to `assets/img/members/`.

**1단계. 사진 준비.** 얼굴이 위쪽 3분의 1에 오는 세로 사진을 사용합니다. 3:4 비율(예: 360 × 480 픽셀)로 자르고 200KB 이하의 `.webp` 또는 `.jpg`로 저장합니다. 파일 이름은 영어 소문자와 하이픈으로 `gildong-hong.webp`처럼 짓고 `assets/img/members/` 폴더에 올립니다.

**Step 2. Add an entry to `_data/members.yml`.** Copy an existing member block and change the values. Members appear on the page in the order of this file, grouped by `role`.

**2단계. `_data/members.yml`에 항목 추가.** 기존 구성원 블록을 복사해서 값을 바꿉니다. 구성원은 이 파일의 순서대로, `role`별로 묶여서 표시됩니다.

```yaml
- name: Gildong Hong              # English name shown on the card · 카드에 표시할 영어 이름
  name_ko: 홍길동                  # Korean name (optional) · 한국어 이름 (선택)
  role: ms                         # postdoc | phd | ms | undergrad
  photo: gildong-hong.webp         # file name in assets/img/members/ · 사진 파일 이름
  interests: [Vision-Language-Action (VLA), World Model]   # research areas · 연구 분야
  email: gildong@yu.ac.kr          # optional · 선택
  linkedin: ""                     # full URL, or "" if none · 전체 주소, 없으면 ""
  homepage: ""                     # full URL, or "" if none · 전체 주소, 없으면 ""
  aliases: ["Hong G", "Hong, Gildong"]   # other spellings used in papers (optional) · 논문에 쓰인 다른 표기 (선택)
  about:                           # text in the "About me" pop-up (optional) · "소개" 팝업 글 (선택)
    en: |
      I am a Master's student working on **vision-language-action models**.

      A blank line starts a new paragraph. Links look like [this](https://example.com).
    ko: |
      **비전-언어-행동 모델**을 연구하는 석사과정생입니다.
```

The `role` values mean: `postdoc` = Post-Doc, `phd` = Ph.D. student, `ms` = Master's student, `undergrad` = undergraduate researcher. The `aliases` list makes the member's name appear in **bold** in author lists on the Publications page; add every spelling used in their papers (their English name, Korean name and `name_ko` are already included automatically).

`role` 값의 뜻: `postdoc` = 박사후연구원, `phd` = 박사과정, `ms` = 석사과정, `undergrad` = 학부연구생. `aliases`에 적은 이름은 논문 페이지 저자 목록에서 **굵게** 표시됩니다. 논문에 쓰인 모든 표기를 적어 주세요 (영어 이름과 `name_ko`는 자동으로 포함됩니다).

**Step 3 (optional). Place the member in a home page research domain.** Open `_data/domains.yml` and add the exact `name` to the `members:` list of Defense AI or Medical AI, or to `core_team:` of Physical Super Intelligence (see 5.11).

**3단계 (선택). 홈 화면 연구 분야에 넣기.** `_data/domains.yml`을 열어 국방 AI 또는 의료 AI의 `members:` 목록, 또는 피지컬 슈퍼 인텔리전스의 `core_team:` 목록에 정확한 `name`을 추가합니다 (5.11 참고).

### 5.2 Edit a member (email, LinkedIn, homepage, research areas, About me) · 구성원 정보 수정

Find the member's block in `_data/members.yml` and change the field. For LinkedIn, paste the profile address and delete everything from `?` onward (for example `?utm_source=share_via…`), so it looks like `https://www.linkedin.com/in/name-123`. If a field is unknown, leave it as `""`; the card keeps an empty space where the button would be. To change research areas, edit the `interests:` list.

`_data/members.yml`에서 해당 구성원 블록을 찾아 값을 고칩니다. LinkedIn은 프로필 주소를 붙여 넣고 `?`부터 뒤를 모두 지워서 (예: `?utm_source=share_via…`) `https://www.linkedin.com/in/name-123` 형태로 만듭니다. 모르는 값은 `""`로 두면 카드에 버튼 자리만 비어 보입니다. 연구 분야는 `interests:` 목록을 고칩니다.

Every card has an **About me** button that opens a pop-up with the member's photo, research areas, links and introduction. The introduction comes from the `about:` field (`en` and `ko`, see the example in 5.1). Write it in Markdown: `**bold**`, `[link text](https://...)`, and an empty line between paragraphs. Keep the text indented under `en: |` / `ko: |`. If `about` is missing, the pop-up says that no introduction has been added yet.

모든 카드에는 **소개(About me)** 버튼이 있어 사진, 연구 분야, 링크, 소개 글이 담긴 팝업을 엽니다. 소개 글은 `about:` 항목(`en`, `ko`, 5.1의 예시 참고)에서 가져옵니다. 마크다운으로 쓰며 `**굵게**`, `[링크 글자](https://...)`, 문단 사이 빈 줄을 사용할 수 있습니다. 글은 `en: |` / `ko: |` 아래로 들여써야 합니다. `about`이 없으면 팝업에 아직 소개 글이 없다고 표시됩니다.

To change a photo, upload the new image to `assets/img/members/`. Either give it the same file name as the old photo (it replaces it) or use a new name and update `photo:`.

사진을 바꿀 때는 새 이미지를 `assets/img/members/`에 올립니다. 기존 사진과 같은 이름으로 올려 덮어쓰거나, 새 이름으로 올리고 `photo:` 값을 바꿉니다.

### 5.3 Move a member to alumni · 졸업생으로 이동

When a member graduates: (1) delete their block from `_data/members.yml`; (2) add an entry at the **top** of `_data/alumni.yml` (newest first); (3) keep the same photo file. Also remove their name from `_data/domains.yml` if it is listed there.

구성원이 졸업하면 (1) `_data/members.yml`에서 해당 블록을 지우고, (2) `_data/alumni.yml` **맨 위**에 항목을 추가하고 (최신순), (3) 사진 파일은 그대로 둡니다. `_data/domains.yml`에 이름이 있으면 거기서도 지웁니다.

```yaml
- { name_ko: 홍길동, name: Gildong Hong, degree: M.S., graduated: 2027-02, next: Samsung Electronics, next_ko: 삼성전자, photo: gildong-hong.webp }
```

`graduated` is the graduation month as `YYYY-MM`. `next` / `next_ko` is where they went (company, institute or school); leave both out if unknown. Alumni are grouped by graduation year, and the "Where our alumni went" chart counts the `next` values automatically.

`graduated`는 졸업 연월(`YYYY-MM`)입니다. `next` / `next_ko`는 졸업 후 진로(회사, 연구소, 학교)이며 모르면 둘 다 빼면 됩니다. 졸업생은 졸업 연도별로 묶이고, "졸업생 진로" 그래프는 `next` 값을 자동으로 셉니다.

### 5.4 Remove a member · 구성원 삭제

Delete the member's whole block in `_data/members.yml` (from `- name:` down to the line before the next `- name:`). Remove their name from `_data/domains.yml` and from any `exclude_members:` list in `_data/themes.yml`. You may delete their photo from `assets/img/members/` too. Their papers stay in the publication list.

`_data/members.yml`에서 해당 구성원 블록 전체(`- name:`부터 다음 `- name:` 바로 윗줄까지)를 지웁니다. `_data/domains.yml`과 `_data/themes.yml`의 `exclude_members:` 목록에서도 이름을 지웁니다. `assets/img/members/`의 사진도 지워도 됩니다. 그 사람의 논문은 논문 목록에 그대로 남습니다.

### 5.5 Update the professor page · 교수 페이지 수정

Edit `_data/professor.yml`. Contact details are at the top (`phone`, `office_en`, `office_ko`, `email`, `linkedin`, `homepage`). External links such as ResearchGate are in `links:`. The career timeline is the `career:` list, newest first:

`_data/professor.yml`을 수정합니다. 연락처는 위쪽에 있고 (`phone`, `office_en`, `office_ko`, `email`, `linkedin`, `homepage`), ResearchGate 같은 외부 링크는 `links:`에 있습니다. 경력은 `career:` 목록이며 최신순입니다.

```yaml
  - { start: 2027.03, kind: service, en: "Dean, College of Engineering", ko: 공과대학장 }
```

`kind` is one of `position` (faculty rank), `research`, `service` (university roles) or `education`. Leave out `end` for a role that continues to the present; add `end: 2028.02` when it ends. Roles without an `end` also appear under "Current roles".

`kind`는 `position`(교원 직위), `research`(연구), `service`(보직), `education`(학력) 중 하나입니다. 현재 진행 중인 직책은 `end`를 빼고, 끝나면 `end: 2028.02`처럼 추가합니다. `end`가 없는 항목은 "현재 직책"에도 표시됩니다.

### 5.6 Add a publication · 논문 추가

Open `_data/publications.yml` and add the paper at the **top of its year** (the list is newest first). Use the split form when you can, so the title is shown in bold and the search works best:

`_data/publications.yml`을 열어 **해당 연도의 맨 위**에 논문을 추가합니다 (최신순). 가능하면 아래처럼 나누어 적어야 제목이 굵게 보이고 검색도 잘 됩니다.

```yaml
- region: international          # international | domestic · 국제 | 국내
  type: conference               # journal | conference · 저널 | 학술대회
  year: 2027
  authors: Gildong Hong, Sungho Kim*
  title: "A Title With: Colons Must Be Quoted"
  venue: IEEE International Conference on Robotics and Automation (ICRA), 2027
```

If you only have a full citation string, use `text:` instead of `authors`, `title` and `venue`:

인용문 전체만 있으면 `authors`, `title`, `venue` 대신 `text:` 하나만 씁니다.

```yaml
- region: domestic
  type: journal
  year: 2027
  text: "홍길동, 김성호, \"논문 제목\", 제어로봇시스템학회 논문지, 33(1), 1-8, 2027."
```

The counters, year chart, filters, search and the research explorers all update automatically. Spell lab members' names consistently (or add the spelling to their `aliases`) so they appear in bold. List only papers that are published or accepted unless the lab decides otherwise, and say "under review" or "preprint" in `venue` when that is the status.

숫자, 연도별 그래프, 필터, 검색, 연구 분야 탐색 화면이 모두 자동으로 바뀝니다. 구성원 이름은 일관되게 쓰거나 (또는 해당 표기를 `aliases`에 추가하면) 굵게 표시됩니다. 연구실에서 따로 정하지 않았다면 게재되었거나 채택된 논문만 올리고, 심사 중이거나 프리프린트라면 `venue`에 "under review" 또는 "preprint"라고 적습니다.

### 5.7 Add news and a photo · 소식과 사진 추가

Each news item is one photo with a caption. It appears on the News page, in the Gallery and, if recent, on the home page.

소식 하나는 사진 한 장과 설명 한 줄입니다. 소식 페이지, 갤러리, (최근 소식이면) 홈 화면에 표시됩니다.

**Step 1.** Prepare two versions of the photo with the same file name, for example `2027-03-cvpr.webp`: a large one (longest side about 1600 px, under 500 KB) uploaded to `assets/img/gallery/`, and a thumbnail cropped to 640 × 427 px uploaded to `assets/img/gallery/thumbs/`.

**1단계.** 같은 파일 이름(예: `2027-03-cvpr.webp`)으로 사진 두 개를 준비합니다. 큰 사진(긴 변 약 1600픽셀, 500KB 이하)은 `assets/img/gallery/`에, 640 × 427픽셀로 자른 썸네일은 `assets/img/gallery/thumbs/`에 올립니다.

**Step 2.** Add an entry at the **top** of `_data/events.yml`:

**2단계.** `_data/events.yml` **맨 위**에 항목을 추가합니다.

```yaml
- date: '2027-03-15'              # first day of the event · 행사 시작일
  when: 2027/03/15~03/18          # date as you want it shown · 화면에 보일 날짜 표기
  tag: conference                 # conference | award | rlrc | graduation | lab | field
  ko: CVPR 2027 학회 참여 및 논문 발표
  en: Attended CVPR 2027 and presented a paper
  photo: 2027-03-cvpr.webp
```

`tag` controls the colored label and the filters: `conference` (conferences, seminars), `award`, `rlrc` (RLRC events), `graduation`, `lab` (lab life) and `field` (field work, data collection).

`tag`는 색 라벨과 필터를 정합니다: `conference`(학회, 세미나), `award`(수상), `rlrc`(RLRC 행사), `graduation`(졸업), `lab`(연구실 생활), `field`(실험, 촬영).

### 5.8 Add or update a project · 과제 추가 및 수정

Edit `_data/projects.yml`. New projects go with the others of the same status:

`_data/projects.yml`을 수정합니다. 새 과제는 같은 상태의 과제들과 함께 둡니다.

```yaml
- status: current                 # current | past · 진행 | 완료
  title: Multimodal perception for autonomous mobile robots
  title_ko: 자율 이동 로봇을 위한 멀티모달 인지 연구
  funder: National Research Foundation of Korea (NRF)
  funder_ko: 한국연구재단
  start: 2027-03                  # YYYY-MM, used for the timeline and progress bar · 연혁과 진행률에 사용
  end: 2030-02
  period: 2027.03.01-2030.02.28   # shown as written · 화면에 그대로 표시
```

When a project ends, change `status: current` to `status: past`. The progress bars and the "now" line on the timeline update by themselves every day from `start` and `end`.

과제가 끝나면 `status: current`를 `status: past`로 바꿉니다. 진행률 막대와 연혁의 "now" 표시는 `start`, `end`를 보고 매일 자동으로 바뀝니다.

### 5.9 Update equipment · 보유 장비 수정

Edit `_data/equipment.yml`. Each item has `name` (and optional `name_ko`), `spec` / `spec_ko`, `use` / `use_ko`, and a `category`: `thermal`, `spectral`, `visible`, `aerial`, `platform` or `compute`. The category decides the colour, the filter button and which research explorer panels list the item.

`_data/equipment.yml`을 수정합니다. 각 장비에는 `name`(선택적으로 `name_ko`), `spec` / `spec_ko`, `use` / `use_ko`, 그리고 `category`가 있습니다. category는 `thermal`, `spectral`, `visible`, `aerial`, `platform`, `compute` 중 하나이며 색상, 필터 버튼, 연구 탐색 화면에서의 표시 위치를 정합니다.

### 5.10 Edit the lab introduction, contact and partners · 연구실 소개, 연락처, 협력 기관 수정

Edit `_data/lab.yml`. It holds the lab name, tagline, the About text (`about.en` / `about.ko`), the purpose sentences, the research `areas` and `applications`, the RLRC texts, the joining message (`join`), the `contact` block (email, phone, address, map search text) and the `partners` logos shown in the footer. To add a partner, upload its logo to `assets/img/partners/` and add `{ name: ..., logo: file.webp, w: width, h: height }` with the image's pixel size.

`_data/lab.yml`을 수정합니다. 연구실 이름, 한 줄 소개, 소개 글(`about.en` / `about.ko`), 연구 목표 문장, 연구 분야(`areas`)와 응용 분야(`applications`), RLRC 설명, 지원 안내(`join`), 연락처(`contact`: 이메일, 전화, 주소, 지도 검색어), 꼬리말의 협력 기관 로고(`partners`)가 들어 있습니다. 협력 기관을 추가하려면 로고를 `assets/img/partners/`에 올리고 이미지 픽셀 크기와 함께 `{ name: ..., logo: file.webp, w: 가로, h: 세로 }`를 추가합니다.

### 5.11 Edit the home page research domains · 홈 화면 연구 분야 수정

The three tabs on the home page (Defense AI, Medical AI, Physical Super Intelligence) come from `_data/domains.yml`. For each domain you can change:

홈 화면의 세 탭(국방 AI, 의료 AI, 피지컬 슈퍼 인텔리전스)은 `_data/domains.yml`에서 나옵니다. 분야마다 다음을 바꿀 수 있습니다.

- `summary` (en/ko): the paragraph at the top of the panel. · 패널 위쪽 설명 문단.
- `members`: list of member names (must match `name` in `members.yml` exactly). · 구성원 이름 목록 (`members.yml`의 `name`과 정확히 같아야 함).
- `core_team`: used instead of `members` for Physical Super Intelligence. Names found in `members.yml` show a photo and link; any other name (someone without a profile yet) shows as a name-only chip. When a core-team person gets a full profile in `members.yml`, keep the name identical and the photo appears automatically. · 피지컬 슈퍼 인텔리전스에서 `members` 대신 사용합니다. `members.yml`에 있는 이름은 사진과 링크로, 없는 이름은 이름만 표시됩니다. 나중에 그 사람을 `members.yml`에 같은 이름으로 추가하면 사진이 자동으로 나타납니다.
- `team_heading: core`: shows the heading "Core Team" instead of "Members" for a `members` list (used by Medical AI), without changing the sensor tabs. · `members` 목록의 제목을 "구성원" 대신 "핵심 팀"으로 표시합니다 (의료 AI에서 사용). 센서 탭은 바뀌지 않습니다.
- `sensors`: the sub-tabs. Each has `en`/`ko` labels, an `icon`, optional `desc` (description text), keyword lists, and optional `equipment` (categories) or `equipment_names` (exact equipment names). · 하위 탭. 각각 `en`/`ko` 이름, `icon`, 선택적인 `desc`(설명), 키워드 목록, 선택적인 `equipment`(장비 분류) 또는 `equipment_names`(장비 이름)를 가집니다.

A sub-tab's **members** are filled in automatically from the co-authors of its papers and the research areas of the domain's members. To fix the list by hand, add `members: [Name One, Name Two]` to that sub-tab (Medical AI · Raman spectroscopy uses this).

하위 탭의 **구성원**은 그 탭 논문의 공동저자와 분야 구성원의 연구 분야로 자동으로 채워집니다. 직접 정하려면 그 하위 탭에 `members: [이름1, 이름2]`를 추가합니다 (의료 AI · 라만 분광에서 사용).

Papers and projects are placed in a tab automatically by **keywords** in their titles: `words` are matched without regard to upper/lower case, `acronyms` must match exactly (so `IR` does not match "their"). A paper appears in a sub-tab only if it matches both the domain's keywords and the sub-tab's keywords. To move a paper in or out, add or remove a keyword. Available icon names: `eye`, `thermo`, `layers`, `radar`, `sliders`, `cpu`, `globe`, `briefcase`, `users`, `humanoid`, `shield`, `activity`, `bot`, `flask`, `book`, `award`.

논문과 과제는 제목의 **키워드**로 자동 배치됩니다. `words`는 대소문자 구분 없이, `acronyms`는 정확히 일치해야 합니다 (그래서 `IR`이 "their"에 걸리지 않습니다). 논문은 분야 키워드와 하위 탭 키워드를 모두 만족해야 그 탭에 나타납니다. 논문을 넣거나 빼려면 키워드를 추가하거나 지웁니다. 사용할 수 있는 아이콘 이름: `eye`, `thermo`, `layers`, `radar`, `sliders`, `cpu`, `globe`, `briefcase`, `users`, `humanoid`, `shield`, `activity`, `bot`, `flask`, `book`, `award`.

### 5.12 Edit the research themes and robotics section · 연구 주제 및 로보틱스 수정

On the Research page, the **Robotics** cards (VLA Models, World Models, Agentic Robotics, Embodied Intelligence, Humanoid Robot Intelligence) are the sub-tabs of Physical Super Intelligence in `_data/domains.yml`; edit their `desc`, labels and keywords there. The same five also appear as buttons in the home page hero.

연구 페이지의 **로보틱스** 카드(VLA 모델, 월드 모델, 에이전틱 로보틱스, 체화 지능, 휴머노이드 로봇 지능)는 `_data/domains.yml` 피지컬 슈퍼 인텔리전스의 하위 탭입니다. 설명(`desc`), 이름, 키워드는 거기서 고칩니다. 같은 다섯 항목이 홈 화면 상단 버튼으로도 나타납니다.

Below the robotics cards is a **Live demo** of a Franka Panda arm in MuJoCo. It is embedded from `https://s-elim.github.io/learn/mujoco/embed.html?lab=frankavla` and only loads when a visitor clicks *Launch live demo*. To show a different lab, change `lab=` in `demo_url` in `research.html` (any lab name registered in that course works) and replace the preview image `assets/img/research/franka-libero-demo.webp`.

로보틱스 카드 아래에는 MuJoCo로 구동되는 Franka Panda 로봇팔 **라이브 데모**가 있습니다. `https://s-elim.github.io/learn/mujoco/embed.html?lab=frankavla`에서 가져오며, 방문자가 *라이브 데모 실행*을 누를 때만 불러옵니다. 다른 실습을 보여 주려면 `research.html`의 `demo_url`에서 `lab=` 값을 바꾸고 (그 강좌에 등록된 실습 이름이면 됩니다) 미리보기 이미지 `assets/img/research/franka-libero-demo.webp`를 교체합니다.

The **themes** further down the Research page come from `_data/themes.yml`. Members are listed under a theme when their `interests` match its keywords. To keep someone out of a theme, add their exact name to that theme's `exclude_members: [...]` list.

연구 페이지 아래쪽 **연구 주제**는 `_data/themes.yml`에서 나옵니다. 구성원의 `interests`가 주제의 키워드와 맞으면 그 주제에 표시됩니다. 특정 구성원을 주제에서 빼려면 그 주제의 `exclude_members: [...]` 목록에 정확한 이름을 추가합니다.

### 5.13 Conference deadlines and Q1 journals · 학회 마감일과 Q1 저널

The **AI Conference Deadlines** and **Top Q1 Journals** pages use `_data/conferences.yml` and `_data/journals.yml`, which are copied every day at 04:30 KST from <https://github.com/s-elim/s-elim.github.io> by the workflow in `.github/workflows/sync-homepage-data.yml`. **Do not edit these two files here**, because the next sync overwrites them. Update them in the source repository instead. To copy immediately, open the **Actions** tab on GitHub, choose "Sync deadlines and journals from s-elim.github.io" and click **Run workflow**.

**AI 학회 마감일**과 **Q1 저널** 페이지는 `_data/conferences.yml`과 `_data/journals.yml`을 사용합니다. 이 두 파일은 `.github/workflows/sync-homepage-data.yml` 작업이 매일 오전 4시 30분(KST)에 <https://github.com/s-elim/s-elim.github.io>에서 복사해 옵니다. **여기서 두 파일을 고치지 마세요.** 다음 동기화 때 덮어써집니다. 원본 저장소에서 고쳐야 합니다. 바로 복사하려면 GitHub의 **Actions** 탭에서 "Sync deadlines and journals from s-elim.github.io"를 고르고 **Run workflow**를 누릅니다.

### 5.14 Change the menu or add a new page · 메뉴 변경 및 새 페이지 추가

The top menu is `_data/navigation.yml`. Each line has `en`, `ko` and `url`; items with `children` become a drop-down. A `url` that starts with `https://` (for example the MuJoCo Course under Resources) opens the other site in a new tab.

상단 메뉴는 `_data/navigation.yml`입니다. 각 줄에 `en`, `ko`, `url`이 있고, `children`이 있는 항목은 드롭다운 메뉴가 됩니다. `url`이 `https://`로 시작하면 (예: 자료 메뉴의 MuJoCo 강좌) 다른 사이트를 새 탭으로 엽니다.

To add a new page, create a file such as `seminars.html` in the repository root that starts with this header, write the page content below it in HTML, then add `{ en: Seminars, ko: 세미나, url: /seminars/ }` to `_data/navigation.yml`:

새 페이지를 만들려면 저장소 맨 위 폴더에 `seminars.html` 같은 파일을 만들고 아래 머리말로 시작한 뒤 그 아래에 HTML로 내용을 씁니다. 그리고 `_data/navigation.yml`에 `{ en: Seminars, ko: 세미나, url: /seminars/ }`를 추가합니다.

```html
---
title: Seminars
permalink: /seminars/
description: "Lab seminars and invited talks."
---
{% include page-hero.html eyebrow_en="Events" eyebrow_ko="행사" title_en="Seminars" title_ko="세미나" %}
<section class="section"><div class="wrap">
  <p>Content goes here.</p>
</div></section>
```

Always put the `description` in quotes. A description containing a colon without quotes breaks that page's settings.

`description`은 항상 따옴표로 감쌉니다. 따옴표 없이 콜론이 들어가면 그 페이지 설정이 깨집니다.

---

## 6. Image rules · 이미지 규칙

| Image · 이미지 | Folder · 폴더 | Size · 크기 |
|---|---|---|
| Member / alumni photo · 구성원/졸업생 사진 | `assets/img/members/` | 3:4 portrait, e.g. 360 × 480, under 200 KB · 3:4 세로, 예: 360 × 480, 200KB 이하 |
| Professor photo · 교수 사진 | `assets/img/members/` | 4:5 portrait, e.g. 400 × 500 · 4:5 세로, 예: 400 × 500 |
| News photo (large) · 소식 사진 (큰 사진) | `assets/img/gallery/` | longest side about 1600 px, under 500 KB · 긴 변 약 1600픽셀, 500KB 이하 |
| News thumbnail · 소식 썸네일 | `assets/img/gallery/thumbs/` | 640 × 427, same file name as the large photo · 640 × 427, 큰 사진과 같은 이름 |
| Partner logo · 협력 기관 로고 | `assets/img/partners/` | about 360 px wide · 가로 약 360픽셀 |

Use `.webp` (smallest) or `.jpg`. File names: lowercase English letters, numbers and hyphens only, with no spaces or Korean characters (`gildong-hong.webp`, not `홍길동 사진.JPG`). File names are case-sensitive on the live site: `Photo.webp` and `photo.webp` are different files. Free tools such as <https://squoosh.app> resize, crop and convert images to WebP in the browser.

`.webp`(가장 작음) 또는 `.jpg`를 사용합니다. 파일 이름은 영어 소문자, 숫자, 하이픈만 쓰고 공백과 한글은 쓰지 않습니다 (`홍길동 사진.JPG`가 아니라 `gildong-hong.webp`). 사이트에서는 대소문자를 구분하므로 `Photo.webp`와 `photo.webp`는 다른 파일입니다. <https://squoosh.app> 같은 무료 도구로 브라우저에서 크기 조절, 자르기, WebP 변환을 할 수 있습니다.

---

## 7. Checking that your change went live · 반영 확인

After you commit, open the **Actions** tab of the repository. A run called **pages build and deployment** starts. A green check ✅ means the site is updated, usually within one to two minutes. A red cross ❌ means the build failed; the live site keeps the previous version. Click the failed run, open the "build" step and read the error. It nearly always names the file and line of a YAML mistake. Fix that line and commit again.

커밋한 뒤 저장소의 **Actions** 탭을 엽니다. **pages build and deployment** 작업이 시작됩니다. 초록색 체크 ✅는 사이트가 업데이트되었다는 뜻이며 보통 1~2분 걸립니다. 빨간 X ❌는 빌드 실패이며, 사이트는 이전 버전을 계속 보여 줍니다. 실패한 작업을 눌러 "build" 단계의 오류를 읽으세요. 거의 항상 YAML 실수가 있는 파일과 줄 번호를 알려 줍니다. 그 줄을 고쳐 다시 커밋하면 됩니다.

Then open the live page. If it still looks old, wait a minute and refresh once with **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac).

그다음 사이트를 엽니다. 아직 예전 화면이면 1분 정도 기다렸다가 **Ctrl + Shift + R**(Windows) 또는 **Cmd + Shift + R**(Mac)로 한 번 새로 고칩니다.

---

## 8. Troubleshooting · 문제 해결

| Problem · 문제 | Usual cause and fix · 흔한 원인과 해결 |
|---|---|
| Build failed (red ❌) · 빌드 실패 | YAML mistake: a tab instead of spaces, wrong indentation, or an unquoted `: `. Read the error line in Actions (section 7). · YAML 실수: 탭 사용, 들여쓰기 오류, 따옴표 없는 `: `. Actions의 오류 줄을 확인 (7장). |
| Change not visible · 변경이 안 보임 | Build still running or browser cache. Check Actions, then hard refresh (Ctrl/Cmd + Shift + R). · 빌드 진행 중이거나 브라우저 캐시. Actions 확인 후 강력 새로 고침. |
| Photo not showing · 사진이 안 보임 | File name in YAML differs from the uploaded file (spelling, upper/lower case, extension), or the file is in the wrong folder. · YAML의 파일 이름과 실제 파일 이름이 다름 (철자, 대소문자, 확장자) 또는 폴더가 다름. |
| Member's name not bold in papers · 논문에서 이름이 굵게 안 보임 | Add the exact spelling used in the paper to the member's `aliases`. · 논문에 쓰인 표기를 그 구성원의 `aliases`에 추가. |
| Paper in the wrong research tab · 논문이 다른 연구 탭에 있음 | Adjust the keywords in `_data/domains.yml` or `_data/themes.yml` (5.11, 5.12). · `_data/domains.yml` 또는 `_data/themes.yml`의 키워드 조정 (5.11, 5.12). |
| A whole page lost its styling · 페이지 디자인이 깨짐 | Its `description:` (or another header value) has an unquoted colon. Put the value in quotes. · 페이지 머리말의 `description:` 등에 따옴표 없는 콜론이 있음. 따옴표로 감쌈. |
| Need to undo a change · 변경을 되돌리고 싶음 | On GitHub open the file, click **History**, find the previous version and copy it back, or ask someone with Git to run `git revert <commit>`. · GitHub에서 파일의 **History**를 열어 이전 내용을 복사해 되돌리거나, Git 사용자에게 `git revert <commit>` 실행을 요청. |

---

## 9. Access and accounts · 권한과 계정

The repository belongs to the GitHub organization **AVIL-Lab**. To edit, you need a GitHub account with **Write** access to `AVIL-Lab/avil`. An organization owner grants it under **Settings → Collaborators and teams** (repository) or **People** (organization). If a push is refused with error 403 even though you have access, the organization may be blocking the app you sign in with (for example VS Code). An owner can allow it under the organization's **Settings → Third-party access → OAuth application policy**, or you can sign in with a personal access token instead.

저장소는 GitHub 조직 **AVIL-Lab** 소유입니다. 수정하려면 `AVIL-Lab/avil`에 **Write** 권한이 있는 GitHub 계정이 필요합니다. 조직 소유자가 저장소의 **Settings → Collaborators and teams** 또는 조직의 **People**에서 권한을 줄 수 있습니다. 권한이 있는데도 403 오류로 push가 거부되면, 로그인에 쓰는 앱(예: VS Code)을 조직이 막고 있을 수 있습니다. 소유자가 조직의 **Settings → Third-party access → OAuth application policy**에서 허용하거나, 개인 액세스 토큰(personal access token)으로 로그인하면 됩니다.

The site address is set in `_config.yml` (`url` and `baseurl: /avil`). If the repository is ever renamed to `avil-lab.github.io` or given a custom domain, change `baseurl` to `""`.

사이트 주소는 `_config.yml`(`url`, `baseurl: /avil`)에 설정되어 있습니다. 저장소 이름을 `avil-lab.github.io`로 바꾸거나 별도 도메인을 연결하면 `baseurl`을 `""`로 바꿉니다.

---

## 10. Preview on your own computer · 내 컴퓨터에서 미리 보기

To see changes before publishing, install **Ruby** (3.x) and **Bundler**, then run in the repository folder:

게시 전에 미리 보려면 **Ruby**(3.x)와 **Bundler**를 설치한 뒤 저장소 폴더에서 다음을 실행합니다.

```bash
bundle install                 # first time only · 처음 한 번만
bundle exec jekyll serve       # then open http://localhost:4000/avil/
```

The preview uses the same Jekyll version as GitHub Pages (`github-pages` gem in the `Gemfile`), so if it builds on your computer it will build on GitHub. Stop the preview with **Ctrl + C**.

미리 보기는 GitHub Pages와 같은 Jekyll 버전(`Gemfile`의 `github-pages`)을 사용하므로, 내 컴퓨터에서 빌드되면 GitHub에서도 빌드됩니다. 미리 보기는 **Ctrl + C**로 끝냅니다.

---

Content was migrated from the lab's previous Wix site on 2026-10-17. Please check names, titles and publication details against the original records when you edit them.

내용은 2026년 10월 17일 이전 Wix 홈페이지에서 옮겨 왔습니다. 이름, 직위, 논문 정보를 수정할 때는 원래 기록과 대조해 주세요.
