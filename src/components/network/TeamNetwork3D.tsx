import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { calculateStudentMatch } from '../../utils/matching/studentMatching';
import { Orbit, RotateCw, Sparkles } from 'lucide-react';

interface NetworkNode {
  student: Student;
  matchScore: number;
  matchLabel: string;
  confidence: string;
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
  radius: number;
  color: string;
}

export const TeamNetwork3D: React.FC<{
  onSelectStudent?: (student: Student) => void;
  height?: number;
}> = ({ onSelectStudent, height = 480 }) => {
  const { currentUser, students, setSelectedStudentForModal } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mode, setMode] = useState<'3D' | '2D'>('3D');
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const rotationRef = useRef({ rotX: 0.22, rotY: 0.32 });
  const autoRotateSpeed = useRef(0.0025);

  const otherStudents = useMemo(() => {
    return students
      .filter((s) => s.id !== currentUser.id)
      .map((s) => {
        const match = calculateStudentMatch(currentUser, s);
        return {
          student: s,
          matchScore: match.overallScore,
          matchLabel: match.matchLabel,
          confidence: match.confidenceLabel
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [students, currentUser]);

  const nodes = useMemo(() => {
    const list: NetworkNode[] = [];
    const count = otherStudents.length;

    otherStudents.forEach((item, index) => {
      const score = Math.max(20, Math.min(100, item.matchScore));
      const dist = 320 - (score * 2.2);

      const phi = Math.acos(-1 + (2 * index) / Math.max(1, count));
      const theta = Math.sqrt(count * Math.PI) * phi;

      const x = dist * Math.cos(theta) * Math.sin(phi);
      const y = (dist * Math.sin(theta) * Math.sin(phi)) * 0.72;
      const z = dist * Math.cos(phi);

      // Classic Dark & Antique Gold Color Palette
      let color = '#C5A880'; // Warm Muted Gold
      if (score >= 90) color = '#E5C07B'; // Radiant Champagne Gold
      else if (score >= 75) color = '#D4AF37'; // Imperial Gold
      else if (score >= 60) color = '#967246'; // Antique Bronze
      else color = '#6B7280'; // Titanium Slate

      list.push({
        student: item.student,
        matchScore: item.matchScore,
        matchLabel: item.matchLabel,
        confidence: item.confidence,
        x,
        y,
        z,
        screenX: 0,
        screenY: 0,
        radius: Math.max(15, Math.min(24, 12 + (score * 0.12))),
        color
      });
    });

    return list;
  }, [otherStudents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseAngle = 0;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 420;

      pulseAngle += 0.025;

      if (mode === '3D' && !isDragging) {
        rotationRef.current.rotY += autoRotateSpeed.current;
      }

      const cosY = Math.cos(rotationRef.current.rotY);
      const sinY = Math.sin(rotationRef.current.rotY);
      const cosX = Math.cos(rotationRef.current.rotX);
      const sinX = Math.sin(rotationRef.current.rotX);

      const projectedNodes = nodes.map((node) => {
        let px = node.x;
        let py = node.y;
        let pz = node.z;

        if (mode === '3D') {
          const x1 = px * cosY - pz * sinY;
          const z1 = pz * cosY + px * sinY;

          const y2 = py * cosX - z1 * sinX;
          const z2 = z1 * cosX + py * sinX;

          px = x1;
          py = y2;
          pz = z2;
        } else {
          pz = 0;
        }

        const scale = mode === '3D' ? fov / (fov + pz + 210) : 1;
        const screenX = centerX + px * scale;
        const screenY = centerY + py * scale;
        const currentRadius = Math.max(12, node.radius * scale);

        return {
          ...node,
          transformedZ: pz,
          scale,
          screenX,
          screenY,
          currentRadius
        };
      });

      projectedNodes.sort((a, b) => b.transformedZ - a.transformedZ);

      // 1. Classical celestial rings
      ctx.save();
      const ringDistances = [95, 175, 255];
      ringDistances.forEach((d, idx) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, d, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.05 + idx * 0.02})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 7]);
        ctx.stroke();
      });
      ctx.restore();

      // 2. Connecting fine golden threads
      projectedNodes.forEach((node) => {
        const isHovered = hoveredNode?.student.id === node.student.id;
        const alpha = isHovered ? 0.8 : Math.max(0.12, (node.matchScore / 100) * 0.35);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(node.screenX, node.screenY);

        const gradient = ctx.createLinearGradient(centerX, centerY, node.screenX, node.screenY);
        gradient.addColorStop(0, 'rgba(229, 192, 123, 0.55)');
        gradient.addColorStop(0.6, `rgba(180, 135, 65, ${alpha})`);
        gradient.addColorStop(1, `${node.color}`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = isHovered ? 2.2 : 1;
        ctx.stroke();

        // Elegant warm energy pulse
        const particleT = (Math.sin(pulseAngle + node.matchScore) + 1) / 2;
        const partX = centerX + (node.screenX - centerX) * particleT;
        const partY = centerY + (node.screenY - centerY) * particleT;

        ctx.beginPath();
        ctx.arc(partX, partY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#FFFFFF' : '#E8D390';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 5;
        ctx.fill();

        ctx.restore();
      });

      // 3. Center Node (Current User) - Dark Imperial Seal
      ctx.save();
      const centerRadius = 28 + Math.sin(pulseAngle * 1.4) * 1.5;

      const auraGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        centerRadius * 0.6,
        centerX,
        centerY,
        centerRadius * 1.8
      );
      auraGrad.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
      auraGrad.addColorStop(0.7, 'rgba(150, 114, 70, 0.08)');
      auraGrad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Core center disc
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#18181F';
      ctx.shadowColor = '#D4AF37';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#E5C07B';
      ctx.stroke();

      ctx.fillStyle = '#FAF7F2';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YOU', centerX, centerY - 4);
      ctx.font = '9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#C5A880';
      ctx.fillText(currentUser.name.split(' ')[0], centerX, centerY + 8);
      ctx.restore();

      // 4. Draw Student Nodes
      projectedNodes.forEach((node) => {
        const isHovered = hoveredNode?.student.id === node.student.id;
        ctx.save();

        if (isHovered || node.matchScore >= 90) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur = isHovered ? 16 : 8;
        }

        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, node.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#141419';
        ctx.fill();

        ctx.lineWidth = isHovered ? 2 : 1.2;
        ctx.strokeStyle = isHovered ? '#FFFFFF' : node.color;
        ctx.stroke();

        ctx.fillStyle = isHovered ? '#FAF7F2' : '#E8E4DD';
        ctx.font = `bold ${Math.max(9, Math.round(10 * (node.scale || 1)))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${node.matchScore}%`, node.screenX, node.screenY);

        ctx.font = `${Math.max(9, Math.round(11 * (node.scale || 1)))}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isHovered ? '#FAF7F2' : '#A1A1AA';
        ctx.fillText(node.student.name.split(' ')[0], node.screenX, node.screenY + node.currentRadius + 13);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, currentUser, hoveredNode, isDragging, mode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging && mode === '3D') {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      rotationRef.current.rotY += dx * 0.007;
      rotationRef.current.rotX = Math.max(
        -0.75,
        Math.min(0.75, rotationRef.current.rotX + dy * 0.007)
      );
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    const fov = 420;
    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    const cosY = Math.cos(rotationRef.current.rotY);
    const sinY = Math.sin(rotationRef.current.rotY);
    const cosX = Math.cos(rotationRef.current.rotX);
    const sinX = Math.sin(rotationRef.current.rotX);

    let found: NetworkNode | null = null;

    for (const node of nodes) {
      let px = node.x;
      let py = node.y;
      let pz = node.z;

      if (mode === '3D') {
        const x1 = px * cosY - pz * sinY;
        const z1 = pz * cosY + px * sinY;
        const y2 = py * cosX - z1 * sinX;
        const z2 = z1 * cosX + py * sinX;
        px = x1;
        py = y2;
        pz = z2;
      }

      const scale = mode === '3D' ? fov / (fov + pz + 210) : 1;
      const screenX = centerX + px * scale;
      const screenY = centerY + py * scale;
      const currentRadius = Math.max(15, node.radius * scale);

      const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
      if (dist <= currentRadius + 5) {
        found = {
          ...node,
          screenX,
          screenY
        };
        break;
      }
    }

    setHoveredNode(found);
    canvas.style.cursor = found ? 'pointer' : isDragging ? 'grabbing' : 'grab';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (hoveredNode) {
      if (onSelectStudent) {
        onSelectStudent(hoveredNode.student);
      } else {
        setSelectedStudentForModal(hoveredNode.student);
      }
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#111115] border border-white/[0.08] overflow-hidden shadow-xl">
      {/* Network Header Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16161C]/90 backdrop-blur-sm border border-white/[0.09]">
          <Orbit className="w-3.5 h-3.5 text-[#E5C07B]" />
          <span className="text-xs font-serif-title font-bold tracking-wide text-[#FAF7F2]">
            Celestial Teammate Orbit
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <span>Proximity indicates calculated compatibility</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center p-1 rounded-lg bg-[#0C0C10] border border-white/[0.06]">
          <button
            onClick={() => setMode('3D')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === '3D'
                ? 'bg-[#1E1E26] text-[#FAF7F2] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAF7F2]'
            }`}
          >
            3D Sphere
          </button>
          <button
            onClick={() => setMode('2D')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === '2D'
                ? 'bg-[#1E1E26] text-[#FAF7F2] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAF7F2]'
            }`}
            title="2D Planar Fallback View"
          >
            2D Constellation
          </button>
        </div>

        <button
          onClick={() => {
            rotationRef.current = { rotX: 0.22, rotY: 0.32 };
          }}
          className="p-1.5 rounded-lg bg-[#16161C] border border-white/[0.08] text-[#A1A1AA] hover:text-[#FAF7F2] transition-colors"
          title="Reset Camera View"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{ height: `${height}px` }}
        className="w-full block touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />

      {/* Hover Info Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-20 pointer-events-none p-3.5 rounded-xl bg-[#17171E]/95 backdrop-blur-md border border-[#D4AF37]/30 shadow-2xl transition-all"
          style={{
            left: `${Math.min(
              hoveredNode.screenX + 15,
              (canvasRef.current?.clientWidth || 500) - 230
            )}px`,
            top: `${Math.max(20, hoveredNode.screenY - 70)}px`,
            width: '215px'
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-serif-title font-bold text-base text-[#FAF7F2] truncate">
              {hoveredNode.student.name}
            </span>
            <span className="font-mono-nums font-bold text-xs px-2 py-0.5 rounded-md bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/25">
              {hoveredNode.matchScore}%
            </span>
          </div>

          <div className="text-xs text-[#E5C07B] mb-1 font-medium">
            {hoveredNode.student.roles?.[0] || 'Contributor'}
          </div>

          <div className="text-[11px] text-[#A1A1AA] mb-2 truncate">
            {hoveredNode.student.department}
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
            <span className="text-[#C5A880] font-medium">{hoveredNode.matchLabel}</span>
            <span className="text-[#71717A]">Click to inspect</span>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-[11px] text-[#71717A] pointer-events-none">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Click any teammate node to examine complementary synergies</span>
        </div>
        <div className="hidden sm:block">
          <span>Drag with mouse to orbit in three dimensions</span>
        </div>
      </div>
    </div>
  );
};
