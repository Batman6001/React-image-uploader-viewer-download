import React, { useState } from "react";
import "./ImageUploader.css";
import JSZip from "jszip";

const ImageUploader = () => {
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [compressedImage, setCompressedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  //**** Select Image */
  const handleFileUpload = (event) => {
    const uploadedFiles = event.target.files;
    const newImages = Array.from(uploadedFiles).map((file) => ({
      file,
      name: file.name,
    }));

    const unsupportedFiles = newImages.filter(
      (image) => !image.file.type.match("image/(png|jpg|jpeg)")
    );
    if (unsupportedFiles.length > 0) {
      const unsupportedFormats = unsupportedFiles
        .map((image) => image.file.type.split("/")[1])
        .join(", ");
      const errorMessage = `Unsupported file format(s): ${unsupportedFormats}`;
      setErrorMessage(errorMessage);
    } else {
      setImages([...images, ...newImages]);
      setErrorMessage("");
    }
  };


  
  //**** Select Image Using Drag and Drop */
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;

    const newImages = Array.from(droppedFiles).map((file) => ({
      file,
      name: file.name,
    }));

    const unsupportedFiles = newImages.filter(
      (image) => !image.file.type.match("image/(png|jpg|jpeg)")
    );

    if (unsupportedFiles.length > 0) {
      const unsupportedFormats = unsupportedFiles
        .map((image) => image.file.type.split("/")[1])
        .join(", ");

      const errorMessage = `Unsupported file format(s): ${unsupportedFormats}`;
      // Set the error message state here
      setErrorMessage(errorMessage);
    } else {
      setImages([...images, ...newImages]);
      // Clear the error message state here
      setErrorMessage("");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const compressImage = (file) => {
    setImagePreview(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target.result;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = 350; // Set your desired maximum width here
        const ratio = maxWidth / image.width;
        const width = maxWidth;
        const height = image.height * ratio;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedURL = URL.createObjectURL(blob);
            setCompressedImage(compressedURL);
          },
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/gif",
          0.8
        ); // Set your desired image quality (0-1) here
      };
    };
    reader.readAsDataURL(file);
  };

  // //**** Image Convert into ZIP using Library */
  const handleDownload = () => {
    if (compressedImage) {
      const zip = new JSZip();
      const imageFileName = "compressed_image";

      fetch(compressedImage)
        .then((response) => response.blob())
        .then((blob) => {
          // zip.file(imageFileName, blob);
          zip.file(`${imageFileName}.${imagePreview.type.split("/")[1]}`, blob);
          return zip.generateAsync({ type: "blob" });
        })
        .then((content) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = "compressed_images.zip";
          link.click();
        });
    }
  };

  //**** Remove Image */
  const handleRemove = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    setImagePreview("");
  };

  //**** Preview Image */
  const renderImageNames = () => {
    return images.map((image, index) => (
      <div key={index} className="image-name-container">
        <p>{image.name}</p>
        <div className="button-container">
          <button
            className="preview-button"
            onClick={() => compressImage(image.file)}
          >
            Preview
          </button>
          <button className="remove-button" onClick={() => handleRemove(index)}>
            Remove
          </button>
        </div>
      </div>
    ));
  };

  // hide image preview
  const hideImage = () => {
    setImagePreview("");
  };

  return (
    <div className="wrapper" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="box">
        <div className="input-bx">
          <h2 className="upload-area-title">Task-3 Upload Image</h2>
          <form>
            <input
              type="file"
              id="upload"
              accept="image/png, image/jpg, image/jpeg, image/gif"
              hidden
              multiple
              onChange={handleFileUpload}
            />
            <label htmlFor="upload" className="uploadlabel">
              <span>
                <i className="fa fa-cloud-upload"></i>
              </span>
              <p>Click To Upload</p>
            </label>
          </form>
        </div>

        <div id="filewrapper">
          <h3 className="uploaded">Uploaded Images</h3>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="showFilebox">
            <div className="left">
              <span className="filetype">
                <h3>{renderImageNames()}</h3>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bgapear">
        {imagePreview && compressedImage && (
          <div>
            <img
              className="upld-img"
              src={URL.createObjectURL(imagePreview)}
              alt=""
              width={400}
              height={200}
            />
            <div className="btn-container">
              <div className="right">
                <button onClick={hideImage} className="remove-button">
                  Cancel
                </button>
              </div>
              <div className="right">
                <button className="preview-button" onClick={handleDownload}>
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;

