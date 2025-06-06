import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "../hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageUploaded: (imageDataUrl: string) => void;
  selectedImage?: string | null;
  onExtractIdData?: () => void;
  isProcessing?: boolean; // New prop for loading state
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  selectedImage,
  onExtractIdData,
  isProcessing = false, // default to false
}) => {
  // Constants
  const MAX_FILE_SIZE = 512 * 1024; // 512KB
  const QUALITY = 0.9; // Image quality for resizing

  // States
  const [imageSrc, setImageSrc] = useState<string | null>(
    selectedImage || null
  );
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [capturedImageData, setCapturedImageData] = useState<string | null>(
    null
  );
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const uploadContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const isMobile = useIsMobile();

  // Update imageSrc when selectedImage changes
  useEffect(() => {
    if (selectedImage === null && imageSrc !== null) {
      setImageSrc(null);
    } else if (selectedImage && selectedImage !== imageSrc) {
      setImageSrc(selectedImage);
    }
  }, [selectedImage, imageSrc]);

  const stopCameraStream = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsVideoReady(false);
  }, [mediaStream]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Handle file input logic
  const handleFileInput = useCallback(
    (file: File) => {
      if (!file) return;

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          let dataUrl: string;

          if (file.size > MAX_FILE_SIZE) {
            dataUrl = await resizeToFitFileSize(file, MAX_FILE_SIZE, QUALITY);
          } else {
            dataUrl = e.target?.result as string;
          }

          setImageSrc(dataUrl);
          onImageUploaded(dataUrl);
        } catch (err) {
          console.error("Error handling file:", err);
          toast.error("Failed to process the image");
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read the file");
      };

      reader.readAsDataURL(file);
    },
    [MAX_FILE_SIZE, QUALITY, onImageUploaded]
  );

  const resizeToFitFileSize = (
    file: File,
    maxSize: number,
    quality: number
  ): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Recursive function to resize until the file is under the max size
          (function resize() {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              throw new Error("Unable to get canvas context");
            }

            ctx.drawImage(img, 0, 0, width, height);
            const resizedImageData = canvas.toDataURL("image/jpeg", quality);
            const estimatedSize = Math.ceil((resizedImageData.length * 3) / 4);

            if (estimatedSize <= maxSize || width <= 1 || height <= 1) {
              resolve(resizedImageData);
            } else {
              width *= 0.9;
              height *= 0.9;
              resize();
            }
          })();
        };

        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };

      reader.readAsDataURL(file);
    });
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file change from file input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileInput(file);
    }
  };

  // Handle drag over event
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (uploadContainerRef.current) {
      uploadContainerRef.current.style.borderColor = "#536FAE";
    }
  };

  // Handle drag leave event
  const handleDragLeave = () => {
    if (uploadContainerRef.current) {
      uploadContainerRef.current.style.borderColor = "#CCCCCC";
    }
  };

  // Handle drop event
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();

    if (uploadContainerRef.current) {
      uploadContainerRef.current.style.borderColor = "#CCCCCC";
    }

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileInput(file);
    }
  };

  // Handle take photo button click
  const handleTakePhotoClick = () => {
    setShowPhotoOptions(true);
    setCameraError(null);
  };

  // Start camera
  const startCamera = async () => {
    try {
      // Close photo options modal
      setShowPhotoOptions(false);
      setCameraError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser does not support camera access");
        return;
      }

      // First show the camera UI so video element gets added to the DOM
      setShowCamera(true);

      // Small delay to ensure video element is in the DOM
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (!videoRef.current) {
        console.error("Video element not available");
        setCameraError("Failed to initialize video element");
        return;
      }

      // Reset video element properties
      videoRef.current.srcObject = null;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      console.log("Attempting to access camera...");

      try {
        // First try to access environment facing camera (back camera on mobile)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        setMediaStream(stream);

        if (videoRef.current) {
          console.log("Setting video source...");
          videoRef.current.srcObject = stream;
          videoRef.current.style.transform = "scaleX(1)"; // Fix mirroring if needed

          // Set up canplay event
          const handleCanPlay = () => {
            console.log(
              "Video can now play, ready state:",
              videoRef.current?.readyState
            );
            setIsVideoReady(true);
            videoRef.current?.removeEventListener("canplay", handleCanPlay);
          };

          videoRef.current.addEventListener("canplay", handleCanPlay);

          // Try to play the video
          try {
            console.log("Attempting to play video...");
            await videoRef.current.play();
            console.log("Video playing successfully");

            // Check if video is already ready
            if (videoRef.current.readyState >= 3) {
              console.log(
                "Video already in ready state:",
                videoRef.current.readyState
              );
              setIsVideoReady(true);
            }
          } catch (error) {
            console.error("Error playing video:", error);
            setCameraError("Failed to start camera preview");
            toast.error("Failed to start camera preview");
          }
        } else {
          console.error("Video ref is null");
          setCameraError("Failed to initialize camera preview");
        }
      } catch (err) {
        // If environment camera fails, try any camera
        console.log(
          "Could not access rear camera, trying default camera...",
          err
        );
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          setMediaStream(stream);

          if (videoRef.current) {
            console.log("Setting video source (fallback)...");
            videoRef.current.srcObject = stream;
            videoRef.current.style.transform = "scaleX(-1)"; // Mirror front camera

            // Set up canplay event
            const handleCanPlay = () => {
              console.log(
                "Video can now play (fallback), ready state:",
                videoRef.current?.readyState
              );
              setIsVideoReady(true);
              videoRef.current?.removeEventListener("canplay", handleCanPlay);
            };

            videoRef.current.addEventListener("canplay", handleCanPlay);

            try {
              console.log("Attempting to play video (fallback)...");
              await videoRef.current.play();
              console.log("Video playing successfully (fallback)");

              // Check if video is already ready
              if (videoRef.current.readyState >= 3) {
                console.log(
                  "Video already in ready state (fallback):",
                  videoRef.current.readyState
                );
                setIsVideoReady(true);
              }
            } catch (error) {
              console.error("Error playing video:", error);
              setCameraError("Failed to start camera preview");
              toast.error("Failed to start camera preview");
            }
          } else {
            console.error("Video ref is null (fallback)");
            setCameraError("Failed to initialize camera preview");
          }
        } catch (err) {
          console.error("Error accessing any camera:", err);
          setCameraError("Failed to access camera");
          toast.error("Failed to access camera");
        }
      }
    } catch (error) {
      console.error("Error in startCamera:", error);
      setCameraError("Failed to access camera");
      toast.error("Failed to access camera");
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !mediaStream) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to get canvas context");
      }

      // If front camera (mirrored), flip the canvas horizontally to correct the image
      const isFlipped = videoRef.current.style.transform === "scaleX(-1)";
      if (isFlipped) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const capturedDataUrl = canvas.toDataURL("image/jpeg", QUALITY);

      setCapturedImageData(capturedDataUrl);
      stopCameraStream();
      setShowCamera(false);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Failed to capture photo");
    }
  };

  // Confirm captured photo
  const confirmPhoto = async () => {
    if (!capturedImageData) return;

    try {
      const response = await fetch(capturedImageData);
      const blob = await response.blob();
      const resizedDataUrl = await resizeToFitFileSize(
        new File([blob], "captured-photo.jpg", { type: "image/jpeg" }),
        MAX_FILE_SIZE,
        QUALITY
      );

      setImageSrc(resizedDataUrl);
      setShowConfirmation(false);
      onImageUploaded(resizedDataUrl);
    } catch (error) {
      console.error("Error confirming photo:", error);
      toast.error("Failed to process photo");
    }
  };

  // Reset photo
  const resetPhoto = () => {
    setImageSrc(null);
  };

  // Close all modals
  const closeAllModals = () => {
    setShowPhotoOptions(false);
    setShowCamera(false);
    setShowConfirmation(false);
    setShowQrCode(false);
    stopCameraStream();
  };

  return (
    <>
      <div
        ref={uploadContainerRef}
        className={`upload-container`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Only show upload/camera/image controls if not processing */}
        {!isProcessing &&
          (!imageSrc ? (
            // Initial upload state
            <div className="flex flex-col items-center justify-center h-full">
              <p className="font-bold mb-2">Drag and drop document image</p>
              <p className="mb-4">or</p>
              <div
                className={`flex flex-col ${
                  isMobile ? "gap-3 w-full" : "sm:flex-row gap-4"
                }`}
              >
                <Button
                  onClick={handleUploadClick}
                  className={`bg-[#333] text-white hover:bg-[#444] border-2 border-[#333] flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 shadow-md transition active:scale-95 whitespace-nowrap text-sm ${
                    isMobile ? "w-full" : ""
                  }`}
                  style={
                    isMobile
                      ? {
                          minHeight: 48,
                          justifyContent: "center",
                          alignItems: "center",
                          textAlign: "center",
                        }
                      : {}
                  }
                >
                  <span className="flex items-center justify-center w-full">
                    <Upload size={20} />
                    <span className="flex-1 text-center">Upload image</span>
                  </span>
                </Button>
                <Button
                  onClick={handleTakePhotoClick}
                  className={`bg-white border-2 border-[#333] text-[#333] hover:bg-[#f3f3f3] flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 shadow-md transition active:scale-95 whitespace-nowrap text-sm ${
                    isMobile ? "w-full" : ""
                  }`}
                  style={
                    isMobile
                      ? {
                          minHeight: 48,
                          justifyContent: "center",
                          alignItems: "center",
                          textAlign: "center",
                        }
                      : {}
                  }
                >
                  <span className="flex items-center justify-center w-full">
                    <Camera size={20} />
                    <span className="flex-1 text-center">Take Photo</span>
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            // Image captured state
            <div className="flex flex-col h-full w-full">
              <div className="image-preview-container flex flex-col flex-1 w-full justify-center items-center">
                <img
                  src={imageSrc}
                  alt="Your captured photo"
                  className="max-w-[600px] max-h-[340px] object-contain rounded-xl shadow-lg border border-gray-200 bg-white"
                  style={
                    isMobile
                      ? { flex: 1, width: "100%", height: "auto", minHeight: 0 }
                      : { background: "#fff" }
                  }
                />
              </div>
              <div
                className={`main-image-controls mt-4 flex ${
                  isMobile
                    ? "flex-col gap-3 w-full items-stretch min-h-[180px] justify-end"
                    : "gap-2 items-center"
                }`}
                style={isMobile ? { flex: 0, minHeight: 180 } : {}}
              >
                <Button
                  onClick={handleUploadClick}
                  className={`bg-[#333] text-white hover:bg-[#444] border-2 border-[#333] flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 shadow-md transition active:scale-95 whitespace-nowrap text-sm ${
                    isMobile ? "w-full" : ""
                  }`}
                  style={isMobile ? { minHeight: 48 } : {}}
                >
                  Upload New Image
                </Button>
                <Button
                  onClick={handleTakePhotoClick}
                  className={`bg-white border-2 border-[#333] text-[#333] hover:bg-[#f3f3f3] flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 shadow-md transition active:scale-95 whitespace-nowrap text-sm ${
                    isMobile ? "w-full" : ""
                  }`}
                  style={isMobile ? { minHeight: 48 } : {}}
                >
                  Retake Photo
                </Button>
                <Button
                  onClick={onExtractIdData}
                  className={`bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 font-medium rounded-lg px-6 py-3 shadow-md transition-all duration-200 flex items-center justify-center text-sm ${
                    isMobile ? "w-full" : ""
                  }`}
                  style={isMobile ? { minHeight: 48 } : {}}
                  disabled={!onExtractIdData || isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Extract ID Data"
                  )}
                </Button>
              </div>
            </div>
          ))}
      </div>

      {/* Photo Options Modal */}
      {showPhotoOptions && (
        <div className="popup-overlay" onClick={closeAllModals}>
          <div
            className="popup-container max-w-md w-4/5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-6">Take a Photo</h3>
            <div className="flex flex-col gap-4">
              <p>How would you like to take your photo?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={startCamera} className="btn-primary">
                  Use this device
                </Button>
                <Button
                  onClick={() => {
                    setShowPhotoOptions(false);
                    setShowQrCode(true);
                  }}
                  className="btn-outline"
                >
                  Try on Mobile
                </Button>
              </div>
            </div>
            <Button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black !bg-transparent hover:!bg-transparent active:!bg-transparent shadow-none border-none focus:outline-none focus:ring-0"
              onClick={closeAllModals}
            >
              &times;
            </Button>
          </div>
        </div>
      )}

      {/* Camera Preview Modal */}
      {showCamera && (
        <div className="popup-overlay">
          <div
            className={`popup-container p-0 overflow-hidden ${
              isMobile
                ? "w-screen h-screen max-w-none max-h-none rounded-none"
                : "max-w-2xl w-full md:p-0 h-auto"
            }`}
            style={isMobile ? { top: 0, left: 0, borderRadius: 0 } : {}}
          >
            <h3
              className={`text-xl font-semibold absolute top-0 left-0 right-0 p-2 bg-[#333] bg-opacity-50 text-white z-10 ${
                isMobile ? "text-center" : ""
              }`}
            >
              Camera Preview
            </h3>
            <div className="w-full h-full relative">
              {cameraError ? (
                <div
                  className={`w-full ${
                    isMobile ? "h-[calc(100vh-80px)]" : "h-[60vh]"
                  } flex items-center justify-center bg-[#333] text-white p-4 text-center`}
                >
                  <div>
                    <p className="mb-2 text-xl">Camera Error</p>
                    <p>{cameraError}</p>
                    <Button
                      onClick={() => {
                        setCameraError(null);
                        startCamera();
                      }}
                      className="mt-4 px-4 py-2 bg-white text-black rounded"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full object-contain ${
                    isMobile ? "h-[calc(100vh-120px)]" : "h-[60vh]"
                  } bg-[#333]`}
                  style={
                    isMobile
                      ? {
                          maxWidth: "100vw",
                          maxHeight: "100vh",
                          objectFit: "contain",
                          display: "block",
                        }
                      : {
                          maxWidth: "100%",
                          maxHeight: "80vh",
                          objectFit: "contain",
                          display: "block",
                        }
                  }
                ></video>
              )}
              <div
                className={`p-8 bg-white flex justify-center gap-4 ${
                  isMobile ? "fixed bottom-0 left-0 w-full z-20" : ""
                }`}
              >
                <Button
                  onClick={capturePhoto}
                  className={`font-medium rounded-lg shadow-md transition-all duration-200 flex items-center justify-center border-2 text-sm ${
                    isMobile
                      ? "w-full px-6 py-3 min-h-[48px] bg-green-600 hover:bg-green-700 text-white border-green-700"
                      : "px-6 py-3 bg-green-600 hover:bg-green-700 text-white border-green-700"
                  }`}
                  title="Take Photo"
                  disabled={!!cameraError || !isVideoReady}
                >
                  Take Photo
                </Button>
                <Button
                  onClick={() => {
                    stopCameraStream();
                    setShowCamera(false);
                    setShowPhotoOptions(true);
                  }}
                  className={`font-medium rounded-lg shadow-md transition-all duration-200 flex items-center justify-center border-2 text-sm ${
                    isMobile
                      ? "w-full px-6 py-3 min-h-[48px] bg-white text-[#333] border-[#333] hover:bg-[#f3f3f3]"
                      : "btn-outline self-center px-6 py-3"
                  }`}
                  style={!isMobile ? {} : {}}
                >
                  Back
                </Button>
              </div>
            </div>
            <Button
              className={`absolute top-2 right-2 z-20 text-2xl w-8 h-8  !bg-transparent active:!bg-transparent rounded-full text-gray-700 flex items-center justify-center shadow-none border-none hover:text-black hover:!bg-transparent focus:outline-none focus:ring-0 ${
                isMobile ? "" : ""
              }`}
              onClick={() => {
                stopCameraStream();
                setShowCamera(false);
              }}
            >
              &times;
            </Button>
          </div>
        </div>
      )}

      {/* Photo Confirmation Modal */}
      {showConfirmation && capturedImageData && (
        <div className="popup-overlay">
          <div className="popup-container max-w-2xl p-0">
            <h3 className="text-xl font-semibold p-3 border-b">Review Photo</h3>
            <div className="flex flex-col md:flex-row">
              <div className="p-4 flex-1 bg-idnorm-neutral flex items-center justify-center">
                <img
                  src={capturedImageData}
                  alt="Captured photo"
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              <div className="p-6 md:w-64">
                <p className="font-medium mb-4">Is this photo OK?</p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={confirmPhoto}
                    className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 font-medium rounded-lg px-6 py-3 shadow-md transition-all duration-200 flex items-center justify-center text-sm"
                  >
                    Use this photo
                  </Button>
                  <Button
                    onClick={() => {
                      setCapturedImageData(null);
                      setShowConfirmation(false);
                      startCamera();
                    }}
                    className="bg-white border-2 border-[#333] text-[#333] hover:bg-[#f3f3f3] font-medium rounded-lg px-6 py-3 shadow-md transition active:scale-95 whitespace-nowrap text-sm"
                  >
                    Retake photo
                  </Button>
                </div>
              </div>
            </div>
            <Button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black !bg-transparent hover:!bg-transparent active:!bg-transparent shadow-none border-none focus:outline-none focus:ring-0"
              onClick={() => {
                setCapturedImageData(null);
                setShowConfirmation(false);
              }}
            >
              &times;
            </Button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrCode && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h3 className="text-xl font-semibold mb-4">Try on Mobile</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center border">
                <img
                  src="/images/IDNORMQRCODE.png"
                  alt="QR Code"
                  className="max-w-full max-h-full"
                />
              </div>
              <div className="text-left w-full flex flex-col items-center md:items-start">
                <p className="mb-4">Scan to access the site on mobile</p>
                <div className="w-full flex justify-center">
                  <Button
                    onClick={() => {
                      setShowQrCode(false);
                      setShowPhotoOptions(true);
                    }}
                    className="btn-outline mx-auto"
                    style={{ minWidth: 120 }}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
            <Button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black !bg-transparent hover:!bg-transparent active:!bg-transparent !shadow-none border-none focus:outline-none focus:ring-0"
              onClick={() => setShowQrCode(false)}
            >
              &times;
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploader;
