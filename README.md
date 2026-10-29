# YOLO26 파인튜닝

> YOLO26 기초(Detection)부터 파인튜닝을 단계적으로 배우는 실전 교재

---

## 학습 목표

이 교재를 완료하면 다음을 할 수 있습니다:

- YOLO26의 구조와 5가지 태스크를 이해할 수 있다
- Object Detection으로 이미지에서 객체를 탐지하고 결과를 분석할 수 있다
- 나만의 데이터셋으로 YOLO26을 파인튜닝해 커스텀 탐지 모델을 만들 수 있다
- 커스텀 시각화를 직접 구현할 수 있다

---

## 목차

| 번호 | 파일 | 내용 |
|------|------|------|
| 1 | [01_YOLO26_소개.ipynb](books/01_YOLO26_소개.ipynb) | YOLO란 무엇인가, YOLO26 특징, 5가지 태스크 소개 |
| 2 | [02_Detection_실습.ipynb](books/02_Detection_실습.ipynb) | yolo26n.pt 모델로 첫 Object Detection 실습 |
| 3 | [03_Detection_결과_분석.ipynb](books/03_Detection_결과_분석.ipynb) | boxes/conf/cls 속성, COCO 80 클래스, 클래스 필터링 |
| 4 | [04_파인튜닝.ipynb](books/04_파인튜닝.ipynb) | 파인튜닝 개념, YOLO 데이터 형식, model.train(), mAP 분석 |

---

## 사전 준비

### 환경
- Python 3.11
- ultralytics

가상환경을 생성한 후, 다음 명령어를 실행하세요.  

```bash
pip install -r ./requirements.txt
```

### 샘플 자료

**이미지**: ultralytics 내장 샘플 사용 (별도 다운로드 불필요)

