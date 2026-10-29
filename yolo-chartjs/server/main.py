from fastapi import FastAPI, Form, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from ultralytics import YOLO
import io
from PIL import Image
from pydantic import BaseModel
from collections import Counter
import cv2
import base64
import torch

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("./best.pt").to("cpu")


class ImageAnalysisRequest(BaseModel):
    upload_file: UploadFile


class AnalysisItem(BaseModel):
    label: str
    value: int
    average_confidence: float
    class_id: int


class ImageAnalysisResponse(BaseModel):
    analysis_results: list[AnalysisItem]
    image_base64: str


@app.post(
    "/api/v1/image-analysis",
    # 추론 전용이므로 그래디언트 계산 비활성화 (메모리 절약)
    response_model=ImageAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
@torch.no_grad()  # 추론 시 불필요한 메모리 사용 방지
def image_analysis(
    image_analysis_request: Annotated[ImageAnalysisRequest, Form()],
) -> ImageAnalysisResponse:
    contents = image_analysis_request.upload_file.file.read()
    image = Image.open(io.BytesIO(contents))

    # device="cpu" 명시 및 불필요한 로그 출력(verbose) 비활성화
    results = model.predict(source=image, device="cpu", verbose=False)

    result = results[0]
    boxes = result.boxes

    res_plotted = result.plot()
    _, buffer = cv2.imencode(".jpg", res_plotted, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    # 1. 클래스별 빈도수 계산
    detected_indices = boxes.cls.cpu().numpy().astype(int).tolist()
    counts = Counter(detected_indices)

    # 2. 클래스별 평균 신뢰도(Confidence) 계산
    confidences = boxes.conf.cpu().numpy().tolist()
    class_conf_map = {}
    for idx, conf in zip(detected_indices, confidences):
        class_conf_map.setdefault(idx, []).append(conf)

    # 3. 리턴 파싱
    summary_data = []
    for idx, count in counts.items():
        name = result.names[idx]
        avg_conf = sum(class_conf_map[idx]) / count
        summary_data.append(
            {
                "label": name,
                "value": count,
                "average_confidence": round(avg_conf, 4),
                "class_id": idx,
            }
        )

    return {"analysis_results": summary_data, "image_base64": img_base64}
