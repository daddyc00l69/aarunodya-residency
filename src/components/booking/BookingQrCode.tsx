'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface BookingQrCodeProps {
  reference: string;
  size?: number;
}

export function BookingQrCode({ reference, size = 120 }: BookingQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!reference) return;
    
    // In production, QR encodes the direct lookup URL
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${origin}/booking/lookup?reference=${encodeURIComponent(reference)}`;

    QRCode.toDataURL(verifyUrl, {
      width: size * 2,
      margin: 1,
      color: {
        dark: '#1d1d1f',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [reference, size]);

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-stone-100 rounded-xl animate-pulse flex items-center justify-center text-[10px] text-stone-400"
      >
        QR
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="p-2 bg-white rounded-2xl border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <img
          src={dataUrl}
          alt={`Scan to verify booking ${reference}`}
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      <span className="text-[10px] text-[#86868b] mt-1.5 font-medium tracking-tight">
        Scan at Counter
      </span>
    </div>
  );
}

