const SERVER_URL = "http://localhost:8000/api/v1/image-analysis";
const sendBtn = document.querySelector(".send-btn");
const fileInput = document.querySelector(".file-input");
const previewImg = document.querySelector(".preview-img");
const resultImg = document.querySelector(".result-img");
const chartContainer = document.querySelector(".chart-container");

let file;
let charts = [];

// 차트 초기화 및 생성 공통 함수
function createChart(ctx, type, data, options = {}) {
  return new Chart(ctx, {
    type: type,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      ...options,
    },
  });
}

// 파일 검증
function validateFile(file) {
  if (!file) return (alert("파일을 선택해주세요."), false);
  if (!["image/jpeg", "image/png"].includes(file.type))
    return (alert("JPG/PNG만 가능합니다."), false);
  if (file.size > 2 * 1024 * 1024)
    return (alert("2MB 이하만 가능합니다."), false);
  return true;
}

fileInput.addEventListener("change", () => {
  file = fileInput.files[0];
  if (validateFile(file)) {
    previewImg.src = URL.createObjectURL(file);
    resultImg.src = "";
    chartContainer.style.display = "none";
  }
});

function updateCharts(results) {
  chartContainer.style.display = "flex";
  charts.forEach((chart) => chart.destroy());
  charts = [];

  const labels = results.map((item) => item.label);
  const values = results.map((item) => item.value);
  const confs = results.map((item) =>
    item.average_confidence <= 1
      ? (item.average_confidence * 100).toFixed(1)
      : item.average_confidence,
  );
  const colors = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"];

  // 차트 1: 수량 (Bar)
  charts.push(
    createChart(document.querySelector("#chart1"), "bar", {
      labels,
      datasets: [
        {
          label: "수량",
          data: values,
          backgroundColor: colors[0],
          borderRadius: 4,
        },
      ],
    }),
  );

  // 차트 2: 신뢰도 (Horizontal Bar)
  charts.push(
    createChart(
      document.querySelector("#chart2"),
      "bar",
      {
        labels,
        datasets: [
          {
            label: "신뢰도(%)",
            data: confs,
            backgroundColor: colors[1],
            borderRadius: 4,
          },
        ],
      },
      { indexAxis: "y", scales: { x: { beginAtZero: true, max: 100 } } },
    ),
  );

  // 차트 3: 비율 (Pie)
  charts.push(
    createChart(document.querySelector("#chart3"), "pie", {
      labels,
      datasets: [{ data: values, backgroundColor: colors }],
    }),
  );

  // 차트 4: 지표 (Radar)
  charts.push(
    createChart(
      document.querySelector("#chart4"),
      "radar",
      {
        labels,
        datasets: [
          {
            label: "신뢰도 분포",
            data: confs,
            backgroundColor: "rgba(78, 115, 223, 0.1)",
            borderColor: "#4e73df",
          },
        ],
      },
      { scales: { r: { beginAtZero: true, max: 100 } } },
    ),
  );
}

sendBtn.addEventListener("click", async () => {
  if (!file) return alert("파일을 선택해주세요.");

  sendBtn.disabled = true;
  sendBtn.textContent = "분석 중...";

  try {
    const formData = new FormData();
    formData.append("upload_file", file);
    const { data } = await axios.post(SERVER_URL, formData);

    resultImg.src = `data:image/jpeg;base64,${data.image_base64}`;
    updateCharts(data.analysis_results);
  } catch (error) {
    console.error("분석 실패:", error);
    alert("분석 중 오류가 발생했습니다.");
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "분석 시작";
  }
});
