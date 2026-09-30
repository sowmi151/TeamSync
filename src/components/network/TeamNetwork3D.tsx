import React, { useRef, useEffect, useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../types";
import { calculateStudentMatch } from "../../utils/matching/studentMatching";
import { Orbit, RotateCw } from "lucide-react";

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
  const [mode, setMode] = useState<"3D" | "2D">("3D");
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const rotationRef = useRef({ rotX: 0.15, rotY: 0.25 });
  const autoRotateSpeed = useRef(0.002);

  const backgroundStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        z: (Math.random() - 0.5) * 3000,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }
    return stars;
  }, []);

  const otherStudents = useMemo(() => {
    return students
      .filter((s) => s.id !== currentUser.id)
      .map((s) => {
        const match = calculateStudentMatch(currentUser, s);
        return {
          student: s,
          matchScore: match.overallScore,
          matchLabel: match.matchLabel,
          confidence: match.confidenceLabel,
        };
      });
    // Removed the .sort() here so the students are naturally distributed
    // around the 360-degree sphere regardless of their score.
  }, [students, currentUser]);

  const nodes = useMemo(() => {
    const list: NetworkNode[] = [];
    const count = otherStudents.length;

    otherStudents.forEach((item, index) => {
      const score = Math.max(10, Math.min(100, item.matchScore));

      const dist = 850 - score * 7;

      // PERFECT 360-DEGREE SPHERICAL DISTRIBUTION (Golden Ratio Spiral)
      const phi = Math.acos(1 - (2 * index) / Math.max(1, count - 1));
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;

      // STRETCH TO FILL THE WIDE BOX
      const x = dist * Math.cos(theta) * Math.sin(phi) * 1.8;
      const y = dist * Math.sin(theta) * Math.sin(phi) * 0.8;
      const z = dist * Math.cos(phi) * 1.2;

      let color = "#00FFFF";
      if (score >= 90) color = "#FF00FF";
      else if (score >= 75) color = "#38BDF8";
      else if (score >= 60) color = "#818CF8";
      else color = "#334155";

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
        radius: Math.max(16, Math.min(28, 12 + score * 0.15)),
        color,
      });
    });

    return list;
  }, [otherStudents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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

      const fov = 650;

      pulseAngle += 0.025;

      if (mode === "3D" && !isDragging) {
        rotationRef.current.rotY += autoRotateSpeed.current;
      }

      const cosY = Math.cos(rotationRef.current.rotY);
      const sinY = Math.sin(rotationRef.current.rotY);
      const cosX = Math.cos(rotationRef.current.rotX);
      const sinX = Math.sin(rotationRef.current.rotX);

      // --- 1. DRAW 3D PARALLAX BACKGROUND STARS ---
      ctx.save();
      backgroundStars.forEach((star) => {
        let px = star.x;
        let py = star.y;
        let pz = star.z;

        if (mode === "3D") {
          const x1 = px * cosY - pz * sinY;
          const z1 = pz * cosY + px * sinY;
          const y2 = py * cosX - z1 * sinX;
          const z2 = z1 * cosX + py * sinX;
          px = x1;
          py = y2;
          pz = z2;
        }

        const scale =
          mode === "3D" ? fov / (fov + pz + 1000) : fov / (fov + 1000);
        if (scale < 0) return; // Behind camera

        const screenX = centerX + px * scale;
        const screenY = centerY + py * scale;

        ctx.beginPath();
        ctx.arc(screenX, screenY, star.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${150 + Math.random() * 105}, ${200 + Math.random() * 55}, 255, ${star.alpha})`;
        ctx.fill();
      });
      ctx.restore();

      const projectedNodes = nodes.map((node) => {
        let px = node.x;
        let py = node.y;
        let pz = node.z;

        if (mode === "3D") {
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

        const scale = mode === "3D" ? fov / (fov + pz + 400) : 0.6;
        const screenX = centerX + px * scale;
        const screenY = centerY + py * scale;
        const currentRadius = Math.max(12, node.radius * scale);

        return {
          ...node,
          transformedZ: pz,
          scale,
          screenX,
          screenY,
          currentRadius,
        };
      });

      projectedNodes.sort((a, b) => b.transformedZ - a.transformedZ);

      // --- 2. WIDER NEON CELESTIAL RINGS ---
      ctx.save();
      const ringDistances = [150, 300, 450];
      ringDistances.forEach((d, idx) => {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, d * 1.5, d * 0.8, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 255, ${0.1 + idx * 0.05})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
      });
      ctx.restore();

      // --- 3. CONNECTING NEON THREADS ---
      projectedNodes.forEach((node) => {
        const isHovered = hoveredNode?.student.id === node.student.id;
        const alpha = isHovered
          ? 1
          : Math.max(0.15, (node.matchScore / 100) * 0.4);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(node.screenX, node.screenY);

        const gradient = ctx.createLinearGradient(
          centerX,
          centerY,
          node.screenX,
          node.screenY,
        );
        gradient.addColorStop(0, "rgba(255, 0, 255, 0.7)");
        gradient.addColorStop(0.6, `rgba(0, 255, 255, ${alpha})`);
        gradient.addColorStop(1, `${node.color}`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = isHovered ? 2.5 : 1;
        ctx.stroke();

        const particleT = (Math.sin(pulseAngle + node.matchScore) + 1) / 2;
        const partX = centerX + (node.screenX - centerX) * particleT;
        const partY = centerY + (node.screenY - centerY) * particleT;

        ctx.beginPath();
        ctx.arc(partX, partY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? "#FFFFFF" : "#00FFFF";
        ctx.shadowColor = "#00FFFF";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();
      });

      // --- 4. CENTER BLACK HOLE (YOU) ---
      ctx.save();
      const centerRadius = 32 + Math.sin(pulseAngle * 1.4) * 2;
      const auraGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        centerRadius * 0.5,
        centerX,
        centerY,
        centerRadius * 2.5,
      );
      auraGrad.addColorStop(0, "rgba(255, 0, 255, 0.5)");
      auraGrad.addColorStop(0.7, "rgba(0, 255, 255, 0.15)");
      auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#050819";
      ctx.shadowColor = "#FF00FF";
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#00FFFF";
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOU", centerX, centerY - 4);

      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(currentUser.name.split(" ")[0], centerX, centerY + 10);
      ctx.restore();

      // --- 5. DRAW FOREGROUND NODES ---
      projectedNodes.forEach((node) => {
        const isHovered = hoveredNode?.student.id === node.student.id;
        ctx.save();

        if (isHovered || node.matchScore >= 90) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur = isHovered ? 25 : 15;
        }

        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, node.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#050819";
        ctx.fill();

        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.strokeStyle = isHovered ? "#FFFFFF" : node.color;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${Math.max(9, Math.round(11 * (node.scale || 1)))}px "JetBrains Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${node.matchScore}%`, node.screenX, node.screenY);

        ctx.font = `${Math.max(10, Math.round(12 * (node.scale || 1)))}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isHovered ? "#FFFFFF" : "#94A3B8";
        ctx.fillText(
          node.student.name.split(" ")[0],
          node.screenX,
          node.screenY + node.currentRadius + 14,
        );

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, backgroundStars, currentUser, hoveredNode, isDragging, mode]);

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

    if (isDragging && mode === "3D") {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;

      rotationRef.current.rotY += dx * 0.007;
      rotationRef.current.rotX = Math.max(
        -0.75,
        Math.min(0.75, rotationRef.current.rotX + dy * 0.007),
      );
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    const fov = 650;
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

      if (mode === "3D") {
        const x1 = px * cosY - pz * sinY;
        const z1 = pz * cosY + px * sinY;
        const y2 = py * cosX - z1 * sinX;
        const z2 = z1 * cosX + py * sinX;
        px = x1;
        py = y2;
        pz = z2;
      }

      const scale = mode === "3D" ? fov / (fov + pz + 400) : 0.6;
      const screenX = centerX + px * scale;
      const screenY = centerY + py * scale;
      const currentRadius = Math.max(15, node.radius * scale);

      if (Math.hypot(mouseX - screenX, mouseY - screenY) <= currentRadius + 5) {
        found = { ...node, screenX, screenY };
        break;
      }
    }

    setHoveredNode(found);
    canvas.style.cursor = found ? "pointer" : isDragging ? "grabbing" : "grab";
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClick = () => {
    if (hoveredNode) {
      if (onSelectStudent) onSelectStudent(hoveredNode.student);
      else setSelectedStudentForModal(hoveredNode.student);
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-transparent border border-[#00FFFF]/30 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-sm">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#050819]/80 backdrop-blur-md border border-[#00FFFF]/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <Orbit className="w-3.5 h-3.5 text-[#00FFFF]" />
          <span className="text-xs font-serif-title font-bold tracking-wide text-white">
            Celestial Teammate Orbit
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
          <span>Proximity indicates calculated compatibility</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center p-1 rounded-lg bg-[#050819]/80 backdrop-blur-md border border-[#00FFFF]/50">
          <button
            onClick={() => setMode("3D")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${mode === "3D" ? "bg-[#00FFFF]/20 text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.4)] border border-[#00FFFF]" : "text-slate-300 hover:text-white"}`}
          >
            3D Sphere
          </button>
          <button
            onClick={() => setMode("2D")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${mode === "2D" ? "bg-[#00FFFF]/20 text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.4)] border border-[#00FFFF]" : "text-slate-300 hover:text-white"}`}
          >
            2D Constellation
          </button>
        </div>
        <button
          onClick={() => {
            rotationRef.current = { rotX: 0.15, rotY: 0.25 };
          }}
          className="p-1.5 rounded-lg bg-[#050819]/80 backdrop-blur-md border border-[#00FFFF]/50 text-slate-300 hover:text-[#00FFFF]"
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
    </div>
  );
};
