# cusmeStudio

cusmeStudio는 tldraw SDK를 사용하여 제작된 신발 디자인 도구입니다. 무드보드와 스케치 기능을 제공하여 사용자가 신발 디자인을 계획하고 스케치할 수 있습니다.

## 주요 기능

### 무드보드 탭
- 상품 정보 정의 (색상, 재질, 모양)
- 템플릿 구역 자동 생성
- 이미지 드래그 앤 드롭 기능
- 기획판 역할 수행

### 스케치 탭
- 로퍼/힐 템플릿 버튼
- 스케치 이미지 로드
- 그리기 기능 (지우개로 삭제 불가)
- 나노바나나 API를 통한 이미지 변환

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 브라우저에서 `http://localhost:5173/` 접속

## 나노바나나 API 설정

이미지 변환 기능을 사용하려면 나노바나나 API 키가 필요합니다:

1. `.env` 파일을 프로젝트 루트에 생성
2. 다음 내용 추가:
```
REACT_APP_NANONVANA_API_KEY=your_api_key_here
REACT_APP_NANONVANA_API_URL=https://api.nanonvana.com
```

## 기술 스택

- React 18
- TypeScript
- tldraw SDK
- Vite
- Axios

## 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.
