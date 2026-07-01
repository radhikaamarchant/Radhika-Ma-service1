import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface Props {
  imageUrl: string;
  onClose: () => void;
  onCrop: (croppedUrl: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageCropModal({ imageUrl, onClose, onCrop }: Props) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) {
      onClose();
      return;
    }
    
    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // We want a square output since it's a profile picture
    const size = Math.max(completedCrop.width * scaleX, completedCrop.height * scaleY);
    
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      onClose();
      return;
    }
    
    ctx.imageSmoothingQuality = "high";
    
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      size,
      size,
    );
    
    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
    onCrop(base64Image);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black text-white mobile-modal-safe">
        <button onClick={onClose} className="px-3 py-1 font-normal text-[15px]">Cancel</button>
        <span className="font-normal text-[16px]">Crop Image</span>
        <button onClick={handleSave} className="px-3 py-1 text-kite-blue font-medium text-[15px]">Done</button>
      </div>
      
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-black p-4">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1}
          circularCrop
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imageUrl}
            onLoad={onImageLoad}
            style={{ maxHeight: "70vh", maxWidth: "100%" }}
          />
        </ReactCrop>
      </div>
    </div>
  );
}
