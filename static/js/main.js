document.addEventListener("DOMContentLoaded", function () {
  const uploadArea = document.getElementById("upload-area");
  const fileInput = document.getElementById("file-input");
  const imageDisplaySection = document.getElementById("image-display-section");
  const annotatedImage = document.getElementById("annotated-image");
  const uploadSection = document.querySelector(".upload-section");
  const newUploadButton = document.getElementById("new-upload-button");
  const imagePreviewContainer = document.getElementById(
    "image-preview-container"
  );
  const imagePreview = document.getElementById("image-preview");
  const uploadAreaText = uploadArea.querySelector("p");

  uploadArea.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.style.backgroundColor = "#f8f9fa";
    uploadArea.style.borderColor = "#0056b3";
  });

  uploadArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    uploadArea.style.backgroundColor = "transparent";
    uploadArea.style.borderColor = "#007bff";
  });

  uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadArea.style.backgroundColor = "transparent";
    uploadArea.style.borderColor = "#007bff";

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  newUploadButton.addEventListener("click", () => {
    imageDisplaySection.style.display = "none";
    uploadSection.style.display = "block";
    uploadAreaText.style.display = "block";
    imagePreviewContainer.style.display = "none";
    fileInput.value = ""; // Reset file input
  });

  function handleFile(file) {
    // Show preview
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreviewContainer.style.display = "block";
      uploadAreaText.style.display = "none";
    };
    reader.readAsDataURL(file);

    uploadArea.querySelector("p").textContent = "Processing...";
    const formData = new FormData();
    formData.append("file", file);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.annotated_image) {
          annotatedImage.src = data.annotated_image;
          imageDisplaySection.style.display = "block";
          uploadSection.style.display = "none"; // Hide upload section
        } else {
          alert(data.error || "An error occurred.");
          uploadAreaText.style.display = "block";
          imagePreviewContainer.style.display = "none";
          uploadArea.querySelector("p").textContent = "Click here to upload";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during upload.");
        uploadAreaText.style.display = "block";
        imagePreviewContainer.style.display = "none";
        uploadArea.querySelector("p").textContent = "Click here to upload";
      });
  }
});
