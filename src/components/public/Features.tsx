"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShieldAlert, FolderKanban, Clock, FileText, Users, TrendingUp } from "lucide-react";

// ─── Constants & Data ──────────────────────────────────────────────────────────

const TILT_MAX = 8;
const TILT_SPRING = { stiffness: 300, damping: 28 };
const GLOW_SPRING = { stiffness: 180, damping: 22 };

const KREWOS_FEATURES = [
  {
    icon: FolderKanban,
    title: "Project Management",
    description: "Organize all construction sites in one place. Assign workers, track daily progress reports, and manage material requests instantly.",
    color: "#3b82f6", // Blue
  },
  {
    icon: ShieldAlert,
    title: "Safety & Incidents",
    description: "Keep your sites compliant. Workers can submit real-time safety incident reports with photo evidence directly from their phones.",
    color: "#ef4444", // Red
  },
  {
    icon: Clock,
    title: "Timesheets & Payroll",
    description: "Automate timesheets. Track exact clock-in/out times for every worker and export aggregated payroll data with a single click.",
    color: "#10b981", // Emerald
  },
  {
    icon: FileText,
    title: "Document Control",
    description: "Never lose a blueprint again. Store and version-control permits, drawings, and daily logs in one centralized, secure vault.",
    color: "#8b5cf6", // Violet
  },
  {
    icon: Users,
    title: "Field-to-Office Chat",
    description: "Bridge the gap between the site and the desk. Instantly share updates, photos, and critical announcements with the whole team.",
    color: "#f59e0b", // Amber
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Gain complete visibility into project budgets, timeline projections, and resource allocation with live, automated dashboards.",
    color: "#0ea5e9", // Sky
  },
];

// ─── 3D Card Component ───────────────────────────────────────────────────────

function FeatureCard({
  item,
  dimmed,
  onHoverStart,
  onHoverEnd,
}: {
  item: typeof KREWOS_FEATURES[0];
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const Icon = item.icon;
  const cardRef = useRef<HTMLDivElement>(null);

  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);

  const rawRotateX = useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rawRotateY = useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]);

  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    normX.set((e.clientX - rect.left) / rect.width);
    normY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
    
      animate={{
        scale: dimmed ? 0.95 : 1,
        opacity: dimmed ? 0.6 : 1,
      }}
      // 👉 FIX: Strict, solid background classes (bg-white & dark:bg-zinc-900) ensure a perfect dark mode flip.
      className="group rounded-[3.5rem] relative flex flex-col h-full w-full overflow-hidden  border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm transition-colors duration-300 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-zinc-700"
      onMouseEnter={() => { glowOpacity.set(1); onHoverStart(); }}
      onMouseLeave={() => { normX.set(0.5); normY.set(0.5); glowOpacity.set(0); onHoverEnd(); }}
      onMouseMove={handleMouseMove}
      ref={cardRef}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Static accent tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: `radial-gradient(ellipse at 15% 15%, ${item.color}15, transparent 60%)` }}
      />

      {/* Dynamic Hover Glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ opacity: glowOpacity, background: `radial-gradient(circle at 50% 50%, ${item.color}25, transparent 70%)` }}
      />

      {/* Icon Badge */}
      <div
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl shadow-sm mb-6"
        style={{ background: `${item.color}15`, boxShadow: `inset 0 0 0 1px ${item.color}30` }}
      >
        <Icon size={24} strokeWidth={2} style={{ color: item.color }} />
      </div>

      {/* Text Content */}
      <div className="relative z-10 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-xl text-zinc-900 tracking-tight dark:text-zinc-50">
          {item.title}
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed dark:text-zinc-400">
          {item.description}
        </p>
      </div>

      {/* Accent bottom border line */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(to right, ${item.color}90, transparent)` }}
      />
    </motion.div>
  );
}

// ─── Main Section Export ──────────────────────────────────────────────────────

export function Features() {
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="font-bold text-sm text-blue-600 uppercase tracking-widest mb-3 dark:text-blue-500">
            Platform Capabilities
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
            Everything you need on site.
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Replace spreadsheets, whiteboards, and fragmented apps with one unified platform built specifically for construction teams.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {KREWOS_FEATURES.map((item) => (
            <FeatureCard
              key={item.title}
              item={item}
              dimmed={hoveredTitle !== null && hoveredTitle !== item.title}
              onHoverStart={() => setHoveredTitle(item.title)}
              onHoverEnd={() => setHoveredTitle(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}