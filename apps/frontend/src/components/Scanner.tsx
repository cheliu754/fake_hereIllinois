import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, X, Video } from "lucide-react";
import { Card } from "../plugin-ui/card";
import { Button } from "../plugin-ui/button";

interface ScannerProps {
  onScanSuccess: (uin: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface CameraDevice {
  id: string;
  label: string;
}

export function Scanner({ onScanSuccess, isOpen, onClose }: ScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [isLoadingCameras, setIsLoadingCameras] = useState(true);
  const hasScannedRef = useRef(false); // Track if we've already processed a scan

  // Get available cameras when component opens
  useEffect(() => {
    if (isOpen) {
      hasScannedRef.current = false; // Reset on open
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            const cameraList = devices.map((device) => ({
              id: device.id,
              label: device.label || `Camera ${device.id}`,
            }));
            setCameras(cameraList);
            // Select the first camera by default (usually back camera on mobile)
            setSelectedCamera(cameraList[0].id);
          }
          setIsLoadingCameras(false);
        })
        .catch((err) => {
          console.error("Error getting cameras:", err);
          setIsLoadingCameras(false);
        });
    } else {
      // Reset states when closed
      setIsScanning(false);
      setSelectedCamera("");
      setCameras([]);
      setIsLoadingCameras(true);
    }
  }, [isOpen]);

  // Start scanning when camera is selected
  useEffect(() => {
    if (isOpen && selectedCamera && !isScanning && !hasScannedRef.current) {
      startScanning();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, selectedCamera]);

  const startScanning = async () => {
    if (!selectedCamera || isScanning || hasScannedRef.current) return;

    setIsScanning(true);

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // Support both QR codes and common barcode formats
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
          ],
        },
        (decodedText) => {
          // Success callback
          // Prevent multiple scans
          if (hasScannedRef.current) return;
          
          hasScannedRef.current = true;
          
          // Stop scanner immediately
          if (scannerRef.current) {
            scannerRef.current.stop().catch((err) => {
              console.error("Failed to stop scanner:", err);
            });
          }
          
          // Call success callback and close
          onScanSuccess(decodedText);
          handleClose();
        },
        (error) => {
          // Error callback - can be safely ignored for most cases
          console.debug("Scan error:", error);
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      setIsScanning(false);
    }
  };

  const cleanup = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const handleCameraChange = async (cameraId: string) => {
    await cleanup();
    setSelectedCamera(cameraId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="size-6 text-[#E84A27]" />
            <h2 className="text-xl font-semibold text-gray-900">
              Scan UIN Barcode/QR Code
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="mb-4 space-y-3">
          <p className="text-sm text-gray-600">
            Position the barcode or QR code within the camera frame. The scan will happen automatically.
          </p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">Supported formats:</p>
            <p>QR Code, Code 128, Code 39, Code 93, EAN-13, EAN-8, UPC-A, UPC-E, Codabar, ITF</p>
          </div>

          {/* Camera Selection */}
          {cameras.length > 1 && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Video className="size-4 text-[#E84A27]" />
                <label htmlFor="camera-select" className="font-medium">
                  Camera:
                </label>
              </div>
              <select
                id="camera-select"
                value={selectedCamera}
                onChange={(e) => handleCameraChange(e.target.value)}
                disabled={isLoadingCameras}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E84A27] focus:border-transparent outline-none text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isLoadingCameras && (
            <p className="text-sm text-gray-500">Loading cameras...</p>
          )}
        </div>

        <div id="qr-reader" className="w-full"></div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}