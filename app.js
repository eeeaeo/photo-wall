document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("camera");
    const photoWall = document.getElementById("photoWall");
    const openCameraButton = document.getElementById("openCamera");
    const API_KEY = "6e210c3be4384ddc050ce10dd67d78a3"; // 替換為你的 Imgbb API Key
    const PHOTO_STORAGE_KEY = "photoWallData"; // 照片儲存鍵值（用於本地儲存）
  
    let stream;
  
    // 載入現有照片到照片牆
    loadPhotoWall();
  
    // 開啟相機
    openCameraButton.addEventListener("click", async () => {
      try {
        openCameraButton.style.display = "none"; // 隱藏按鈕
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        videoElement.srcObject = stream;
        videoElement.play();
  
        const captureButton = document.createElement("button");
        captureButton.innerText = "Capture Photo";
        document.body.appendChild(captureButton);
  
        captureButton.addEventListener("click", () => {
          const canvas = document.createElement("canvas");
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
          const photo = canvas.toDataURL("image/png");
          uploadToImgbb(photo);
  
          // 停止相機
          stream.getTracks().forEach((track) => track.stop());
          videoElement.srcObject = null;
          captureButton.remove();
        });
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    });
  
    // 上傳到 Imgbb
    async function uploadToImgbb(photo) {
      try {
        const formData = new FormData();
        formData.append("image", photo.split(",")[1]); // 去掉 Data URL 的前綴
  
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
        const imageUrl = result.data.url;
  
        // 添加照片到照片牆並同步儲存
        addPhotoToWall(imageUrl);
        savePhotoToLocalStorage(imageUrl);
      } catch (error) {
        console.error("Error uploading to Imgbb:", error);
      }
    }
  
    // 添加照片到照片牆
    function addPhotoToWall(imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      photoWall.appendChild(img);
    }
  
    // 儲存照片 URL 到本地儲存
    function savePhotoToLocalStorage(imageUrl) {
      const photoData = JSON.parse(localStorage.getItem(PHOTO_STORAGE_KEY)) || [];
      photoData.push(imageUrl);
      localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(photoData));
    }
  
    // 從本地儲存載入照片牆
    function loadPhotoWall() {
      const photoData = JSON.parse(localStorage.getItem(PHOTO_STORAGE_KEY)) || [];
      photoData.forEach((imageUrl) => {
        addPhotoToWall(imageUrl);
      });
    }
  });

    
  
  


  