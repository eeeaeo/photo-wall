// HTML 元素引用
const openCameraButton = document.getElementById("openCamera");
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const uploadButton = document.getElementById("uploadPhoto");
const photoWall = document.getElementById("photoWall");

let stream; // 用於存儲相機的數據流

// 開啟相機功能
openCameraButton.addEventListener("click", async () => {
  try {
    // 要求用戶授權相機
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream; // 將相機的數據流綁定到 video 元素
    video.style.display = "block"; // 顯示相機畫面
    uploadButton.style.display = "inline-block"; // 顯示拍照按鈕
  } catch (error) {
    console.error("無法啟用相機：", error);
    alert("無法啟用相機，請確認是否授權！");
  }
});

// 拍照功能並上傳
uploadButton.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 將相機畫面捕捉到 canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 將照片轉換為 Base64 編碼
  const photo = canvas.toDataURL("image/png");

  // 停止相機
  stream.getTracks().forEach((track) => track.stop());
  video.style.display = "none"; // 隱藏相機
  uploadButton.style.display = "none"; // 隱藏拍照按鈕

  // 將照片顯示在前端照片牆
  const img = document.createElement("img");
  img.src = photo;
  img.style.width = "100px";
  img.style.height = "100px";
  img.style.margin = "5px";
  photoWall.appendChild(img);

  // 調用上傳功能
  uploadPhoto(photo);
});

// 上傳照片到 ImgBB API
async function uploadPhoto(photo) {
  try {
    // 去掉 Base64 編碼的開頭部分 "data:image/png;base64,"
    const base64Image = photo.split(",")[1];

    // 構建表單數據
    const formData = new FormData();
    formData.append("image", base64Image);

    // 發送上傳請求到 ImgBB API
    const response = await fetch("https://api.imgbb.com/1/upload?key=6e210c3be4384ddc050ce10dd67d78a3", {
      method: "POST",
      body: formData,
    });

    // 處理 API 回應
    const result = await response.json();
    if (result.success) {
      console.log("照片上傳成功：", result.data.url);

      // 顯示來自 ImgBB 的照片
      const img = document.createElement("img");
      img.src = result.data.url; // ImgBB 圖片的公開 URL
      img.style.width = "100px";
      img.style.height = "100px";
      img.style.margin = "5px";
      photoWall.appendChild(img);
    } else {
      console.error("上傳失敗：", result.error);
    }
  } catch (error) {
    console.error("照片上傳時發生錯誤：", error);
  }
}

  