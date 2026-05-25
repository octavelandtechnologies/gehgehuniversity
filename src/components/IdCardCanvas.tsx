/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { StudentInfo } from '../types';
import crestImage from '../assets/images/university_crest_1779730400525.png';
import { ShieldCheck, Award, Calendar, FileCheck, CheckCircle2, Smartphone, Monitor, X, Download } from 'lucide-react';

interface IdCardCanvasProps {
  student: StudentInfo;
  onDownloadReady: (downloadFn: () => void) => void;
}

export default function IdCardCanvas({ student, onDownloadReady }: IdCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [crestLoaded, setCrestLoaded] = useState(false);
  const [passportLoaded, setPassportLoaded] = useState(false);
  const [passportImgElement, setPassportImgElement] = useState<HTMLImageElement | null>(null);
  const [crestImgElement, setCrestImgElement] = useState<HTMLImageElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalImgUrl, setModalImgUrl] = useState<string>('');

  // Resize handler to scale the on-screen card component without horizontal scrolls
  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      const parentWidth = containerRef.current?.getBoundingClientRect().width || 0;
      // Stable full desktop size is 576px wide (max-w-xl)
      const targetWidth = 576;
      if (parentWidth < targetWidth && parentWidth > 0) {
        setScaleFactor(parentWidth / targetWidth);
      } else {
        setScaleFactor(1);
      }
    };

    updateScale();
    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Default fallback avatar svg parsed to Base64 to draw on canvas if no passport uploaded
  const defaultPassportBase64 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%230B3B24"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="40" r="22" fill="%2394a3b8"/><path d="M15 85 C 15 65, 30 60, 50 60 C 70 60, 85 65, 85 85 Z" fill="%2394a3b8"/><circle cx="50" cy="50" r="48" fill="none" stroke="%23008751" stroke-width="4"/></svg>`;

  // Load Crest Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = crestImage;
    img.onload = () => {
      setCrestImgElement(img);
      setCrestLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load official crest image");
    };
  }, []);

  // Load Passport Image
  useEffect(() => {
    const img = new Image();
    if (student.passportUrl && !student.passportUrl.startsWith('data:')) {
      img.crossOrigin = "anonymous";
    }
    img.src = student.passportUrl || defaultPassportBase64;
    img.onload = () => {
      setPassportImgElement(img);
      setPassportLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load student passport photo");
    };
  }, [student.passportUrl]);

  // Canvas drawing logic
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Background (White / Light cream for official lookup)
    ctx.fillStyle = "#FCFDF9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Green Top Header Bar (Nigerian Official Green)
    // Nigerian Forest Green: #0A5C36
    ctx.fillStyle = "#0A5C36";
    ctx.fillRect(0, 0, canvas.width, 140);

    // 3. Draw Green-White-Green Accent Ribbons on left and right side
    // Left ribbon
    ctx.fillStyle = "#008751"; // Nigerian flag green
    ctx.fillRect(0, 0, 15, canvas.height);
    // Right ribbon
    ctx.fillRect(canvas.width - 15, 0, 15, canvas.height);

    // 4. Draw Gold-Colored Bottom Trim for premium vibe
    ctx.fillStyle = "#D4AF37"; // Metallic Gold
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // 5. Draw University Logo (Crest) in Header
    if (crestImgElement && crestLoaded) {
      ctx.drawImage(crestImgElement, 35, 15, 110, 110);
    }

    // 6. Draw Header Texts
    // University Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px 'Space Grotesk', sans-serif";
    ctx.fillText("THE UNIVERSITY OF WISDOM & UNDERSTANDING", 165, 55);

    // Motto (Had I know, the last comment of a fool)
    ctx.fillStyle = "#FFD700"; // Gold Text
    ctx.font = "italic 20px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`Motto: "Had I know, the last comment of a fool"`, 165, 90);

    // Vice Chancellor tag
    ctx.fillStyle = "#A3E635"; // Lime light green
    ctx.font = "600 14px 'JetBrains Mono', monospace";
    ctx.fillText("VC: EMMANUEL OBRUSTE (GEHGEH)", 165, 118);

    // 7. Draw Ribbon: STUDENT IDENTITY CARD
    ctx.fillStyle = "#D4AF37"; // Gold Background ribbon
    ctx.fillRect(15, 140, canvas.width - 30, 42);

    ctx.fillStyle = "#0B3B24"; // Forest green text
    ctx.font = "800 18px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OFFICIAL STUDENT RECTANGULAR IDENTITY CARD", canvas.width / 2, 167);
    ctx.textAlign = "left"; // reset

    // 8. Draw Faint Watermark in middle of ID Card
    if (crestImgElement && crestLoaded) {
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.drawImage(crestImgElement, canvas.width / 2 - 150, canvas.height / 2 - 100, 300, 300);
      ctx.restore();
    }

    // Draw secondary text watermark "WISDOM & UNDERSTANDING"
    ctx.save();
    ctx.globalAlpha = 0.015;
    ctx.fillStyle = "#0A5C36";
    ctx.font = "bold 60px sans-serif";
    ctx.rotate(-Math.PI / 10);
    ctx.fillText("SECURE PORTAL • WISE MAN", 50, canvas.height - 50);
    ctx.restore();

    // 9. Draw Student Passport Photo Frame on Left (X: 50, Y: 210)
    const px = 55;
    const py = 210;
    const pw = 240;
    const ph = 270;

    // Outer frame (Gold line)
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 4;
    ctx.strokeRect(px - 4, py - 4, pw + 8, ph + 8);

    // Draw actual image inside frame
    if (passportImgElement && passportLoaded) {
      ctx.drawImage(passportImgElement, px, py, pw, ph);
    }

    // 10. Draw Official Circular Seal overlapping the bottom right corner of passport
    ctx.beginPath();
    ctx.arc(px + pw - 10, py + ph - 10, 45, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0, 135, 81, 0.85)"; // Transparent Forest Green
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 15px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("U.O.W.U", px + pw - 10, py + ph - 10 - 12);
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillText("OFFICIAL", px + pw - 10, py + ph - 10 + 1);
    ctx.font = "bold 15px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("APPROVED", px + pw - 10, py + ph - 10 + 15);
    ctx.textAlign = "left"; // Reset

    // 11. Draw Details Column (X: 330)
    const dx = 340;
    const dyStart = 235;
    const lineGap = 42;

    const drawDetailRow = (label: string, value: string, rowIdx: number, customValColor?: string) => {
      const currentY = dyStart + rowIdx * lineGap;

      // Label (Nigerian style light gray text)
      ctx.fillStyle = "#6B7280";
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      ctx.fillText(label, dx, currentY);

      // Value
      ctx.fillStyle = customValColor || "#111827";
      ctx.font = "bold 19px 'Space Grotesk', sans-serif";
      ctx.fillText(value, dx + 130, currentY);

      // Bottom underline dash dot
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dx, currentY + 10);
      ctx.lineTo(canvas.width - 50, currentY + 10);
      ctx.stroke();
    };

    drawDetailRow("FULL NAME:", student.name ? student.name.toUpperCase() : "UNNAMED WISE MAN", 0);
    drawDetailRow("MATRIC NO:", student.matricNo, 1, "#0A5C36");
    drawDetailRow("CURR. LEVEL:", student.level, 2, "#D4AF37");
    drawDetailRow("STREET DEPT:", "Street Wisdom & Relationship Defence", 3);

    // Row 4: STATE INFO & STATUS split row to match preview
    const ry4 = dyStart + 4 * lineGap;

    // Left part: STATE INFO
    ctx.fillStyle = "#6B7280";
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillText("STATE INFO:", dx, ry4);

    ctx.fillStyle = "#111827";
    ctx.font = "bold 19px 'Space Grotesk', sans-serif";
    ctx.fillText(`${student.stateOfOrigin.toUpperCase()} STATE`, dx + 130, ry4);

    // Right part: STATUS
    ctx.fillStyle = "#6B7280";
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillText("STATUS:", dx + 380, ry4);

    // Emerald Pill badge for APPROVED
    const bx = dx + 455;
    const by = ry4 - 20;
    const bw = 100;
    const bh = 26;

    // Fill badge background
    ctx.fillStyle = "#ECFDF5"; // emerald-50
    ctx.fillRect(bx, by, bw, bh);

    // Stroke badge border
    ctx.strokeStyle = "#A7F3D0"; // emerald-200
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);

    // Text inside badge
    ctx.fillStyle = "#059669"; // emerald-600
    ctx.font = "bold 13px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("APPROVED", bx + bw / 2, by + 18);
    ctx.textAlign = "left"; // reset

    // Bottom dotted/dashed underline for the split row
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dx, ry4 + 10);
    ctx.lineTo(canvas.width - 50, ry4 + 10);
    ctx.stroke();

    // 12. Draw Signatures Bottom Block matching top alignment and styling
    const sx = canvas.width - 320;
    const sy = canvas.height - 110;

    // Draw the text "Emmanuel_VC_Obr" with rotation
    ctx.save();
    ctx.translate(sx + 100, sy + 25);
    ctx.rotate(-6 * Math.PI / 180); // rotate -6 degrees
    ctx.fillStyle = "#1D4ED8"; // blue-700
    ctx.font = "italic bold 32px 'Space Grotesk', 'Plus Jakarta Sans', sans-serif"; // display font matching preview
    ctx.textAlign = "center";
    ctx.fillText("Emmanuel_VC_Obr", 0, 0);

    // Draw underline
    ctx.strokeStyle = "#60A5FA"; // blue-400
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]); // dashed line!
    ctx.beginPath();
    ctx.moveTo(-115, 8);
    ctx.lineTo(115, 8);
    ctx.stroke();
    ctx.restore();

    // Draw description below
    ctx.fillStyle = "#6B7280"; // slate-500
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("VC. GEHGEH SIGNATURE / APPROVED STAMP", canvas.width - 50, sy + 75);
    ctx.textAlign = "left"; // reset
  };

  // Re-draw whenever component loads or data changes
  useEffect(() => {
    drawCanvas();
  }, [student, crestLoaded, passportLoaded, passportImgElement, crestImgElement]);

  // Expose the download function to the parent component
  useEffect(() => {
    const triggerDownload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Force draw again to ensure state is active
      drawCanvas();

      try {
        // Convert to high-quality JPEG image
        const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
        setModalImgUrl(dataUrl);
        setShowModal(true);

        // Create a literal anchor link to download as backup
        const link = document.createElement('a');
        link.download = `GehGeh_UOWU_ID_Card_${student.name.replace(/\s+/g, '_')}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Standard download process had fallback trigger active:", err);
      }
    };

    onDownloadReady(triggerDownload);
  }, [student, crestLoaded, passportLoaded, passportImgElement, crestImgElement]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center overflow-hidden">
      {/* 1. ON-SCREEN CRISP VISUAL CSS DESIGN FOR THE ID CARD */}
      <div 
        style={{ 
          width: '576px', 
          height: `${363 * scaleFactor}px`, 
          position: 'relative'
        }}
        className="flex items-start justify-start shrink-0 origin-top"
      >
        <div 
          id="student-id-card-preview"
          className="absolute top-0 left-0 w-[576px] h-[363px] rounded-3xl overflow-hidden bg-[#FCFDF9] border-4 border-[#0A5C36] shadow-2xl transition-all duration-300"
          style={{ 
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Borders */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#008751]" />
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-[#008751]" />
          <div className="absolute left-0 right-0 bottom-0 h-3 bg-[#D4AF37]" />

          {/* Top Header */}
          <div className="w-full bg-[#0A5C36] px-4 py-3 text-white flex items-center gap-3">
            <img 
              src={crestImage} 
              alt="UOWU Academic Seal" 
              className="w-12 h-12 object-contain rounded-full border-2 border-dashed border-[#D4AF37] bg-white p-0.5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-[14px] font-display font-extrabold tracking-tight shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
                THE UNIVERSITY OF WISDOM & UNDERSTANDING
              </h1>
              <p className="text-[10px] text-yellow-300 italic font-medium truncate">
                Motto: "Had I know, the last comment of a fool"
              </p>
              <p className="text-[9px] font-mono text-lime-300 font-semibold tracking-wider">
                VC: EMMANUEL OBRUSTE (GEHGEH)
              </p>
            </div>
          </div>

          {/* Golden Identification Bar */}
          <div className="w-full bg-[#D4AF37] text-[#0B3B24] py-1 text-center font-display text-[11px] font-black tracking-wider border-y border-[#0B3B24]">
            OFFICIAL STUDENT RECTANGULAR IDENTITY CARD
          </div>

          {/* Watermark Logo */}
          <div 
            className="absolute inset-x-0 top-24 bottom-6 opacity-[0.03] pointer-events-none bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(${crestImage})`, backgroundSize: '70%' }}
          />

          {/* Main Content Body */}
          <div className="p-4 flex gap-4 items-center">
            {/* Passport Container */}
            <div className="relative shrink-0 flex flex-col items-center">
              {/* Outline */}
              <div className="w-24 h-28 rounded-lg overflow-hidden border-2 border-[#D4AF37] bg-slate-100 shadow-md">
                {student.passportUrl ? (
                  <img 
                    src={student.passportUrl} 
                    alt="Passport photograph" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-200">
                    <span className="text-2xl font-bold">UOWU</span>
                    <span className="text-[9px] text-center px-1">PASSPORT PHOTO</span>
                  </div>
                )}
              </div>

              {/* Official Green Stamp overlaying bottom corner */}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-[#008751]/95 text-white border-2 border-white flex flex-col items-center justify-center shadow-lg text-center font-display transform rotate-12">
                <span className="text-[7px] font-bold">APPROVED</span>
                <span className="text-[6px] font-mono leading-none">U.O.W.U</span>
                <span className="text-[6px] text-yellow-300 font-bold tracking-tight">WISE</span>
              </div>
            </div>

            {/* Details column */}
            <div className="flex-1 space-y-1 text-[11px] font-medium leading-tight">
              <div className="border-b border-dashed border-slate-200 pb-0.5">
                <span className="font-mono text-[9px] text-slate-400 block">FULL NAME</span>
                <span className="font-display font-black text-slate-800 uppercase tracking-wide truncate block">{student.name || "UNNAMED WISE MAN"}</span>
              </div>

              <div className="border-b border-dashed border-slate-200 pb-0.5">
                <span className="font-mono text-[9px] text-slate-400 block">MATRIC NO</span>
                <span className="font-mono font-bold text-[#0A5C36]">{student.matricNo}</span>
              </div>

              <div className="border-b border-dashed border-slate-200 pb-0.5">
                <span className="font-mono text-[9px] text-slate-400 block">ACADEMIC LEVEL</span>
                <span className="font-bold text-[#b4922e] text-[11px]">{student.level}</span>
              </div>

              <div className="border-b border-dashed border-slate-200 pb-0.5">
                <span className="font-mono text-[9px] text-slate-400 block">STREET DIVISION</span>
                <span className="text-slate-700 font-semibold truncate block">Street Wisdom & Relationship Defence</span>
              </div>

              <div className="flex gap-2 text-[9px]">
                <div>
                  <span className="font-mono text-[8.5px] text-slate-400 block">STATE INFO</span>
                  <span className="font-bold text-slate-800 uppercase">{student.stateOfOrigin} State</span>
                </div>
                <div className="ml-auto text-right min-w-[70px]">
                  <span className="font-mono text-[8.5px] text-slate-400 block">STATUS</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 inline-block">APPROVED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vice Chancellor Signature area */}
          <div className="absolute right-5 bottom-4 text-right">
            {/* Drawn signature representation */}
            <div className="relative font-display text-blue-700 text-lg italic tracking-wider select-none pr-1 transform -rotate-6">
              Emmanuel_VC_Obr
              <div className="absolute right-0 left-0 bottom-1 h-0.5 border-b border-dashed border-blue-400" />
            </div>
            <p className="text-[7.5px] font-mono text-slate-500 mt-1 uppercase font-semibold">
              VC. GehGeh Signature / Approved Stamp
            </p>
          </div>
        </div>
      </div>

      {/* 2. HIDDEN HIGH-RES CANVAS USED TO GENERATE DOWNLOAD IMAGE */}
      <canvas 
        ref={canvasRef} 
        width="1000" 
        height="630" 
        className="hidden" 
      />

      {/* 3. COHESIVE POPUP STEP FALLBACK LIGHTBOX MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border-4 border-black p-5 md:p-6 shadow-[8px_8px_0_0_#D4AF37] space-y-4 my-8">
            
            {/* Close trigger button in high right corner */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute -top-3 -right-3 bg-[#0A5C36] text-white border-2 border-black p-1 hover:bg-[#008751] transition shadow-[2px_2px_0_0_#000] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Banner block */}
            <div className="bg-[#0A5C36] text-white py-1.5 px-3 border-2 border-black inline-block text-[10px] font-black tracking-widest uppercase">
              ID Card Ready
            </div>

            <div className="space-y-1">
              <h3 className="text-lg md:text-xl font-black text-[#1a1a1a] uppercase leading-none">
                🎉 Your Student ID Card is Generated!
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Preview your high-quality official card below and save it to your device.
              </p>
            </div>

            {/* Rendered output image */}
            <div className="flex justify-center p-1 bg-gray-50 border-2 border-dashed border-gray-200">
              <img 
                src={modalImgUrl} 
                alt="Your Generated UOWU Student Card" 
                className="w-full h-auto aspect-[1.587] object-contain border-2 border-black shadow-[4px_4px_0_0_#1a1a1a] select-none"
              />
            </div>

            {/* Bottom Actions to close */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:flex-1 py-2.5 bg-black hover:bg-gray-800 text-white font-black uppercase text-xs border-2 border-black cursor-pointer shadow-[2px_2px_0_0_#D4AF37] text-center font-sans font-extrabold"
              >
                Close View
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `GehGeh_UOWU_ID_Card_${student.name.replace(/\s+/g, '_')}.jpg`;
                  link.href = modalImgUrl;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#008751] hover:bg-[#007042] text-white font-black uppercase text-xs border-2 border-black cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ID Card</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
