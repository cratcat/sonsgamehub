# 대환장 멀티버스 어드벤처 (Web Game)

이 프로젝트는 HTML5 Canvas와 JavaScript로 작성된 2D 4방향 액션 게임입니다.
GitHub Pages를 통해 쉽게 웹으로 배포할 수 있습니다.

## 🚀 GitHub 배포 방법 (GitHub Pages)

1. 이 ZIP 파일의 압축을 풉니다.
2. 자신의 GitHub 계정에 새 Repository(저장소)를 생성합니다.
3. 압축을 푼 모든 파일(`index.html`, `css/`, `js/`, `assets/`)을 해당 Repository에 업로드합니다.
4. Repository의 **Settings** -> **Pages** 메뉴로 이동합니다.
5. **Source**를 `Deploy from a branch`로 선택하고, 브랜치를 `main`(또는 `master`)으로 설정한 뒤 `Save`를 누릅니다.
6. 1~2분 뒤에 제공되는 링크를 통해 웹상에서 게임을 즐길 수 있습니다.

## 🎨 에셋(이미지) 설정
* 주인공 캐릭터: 사용자가 제공한 `Gemini_Generated_Image_czt7r2czt7r2czt7.png` 파일을 `assets` 폴더 안에 넣으면 게임 내에 주인공 캐릭터로 적용됩니다.
* 추가 이미지: Pixabay 등에서 다운받은 적/배경 이미지가 있다면 `js/game.js`의 `Image()` 객체를 통해 연동할 수 있습니다.

## 🎮 조작 방법
* **이동**: 방향키 (상, 하, 좌, 우)
* **근거리 공격**: Z 키 (검을 휘두르는 모션)
* **원거리 공격**: X 키 (투사체 발사)
* **탈 것 (요시) 상호작용**: C 키 (탑승 시 이동 속도 및 공격력 증가, 투사체 강화)
