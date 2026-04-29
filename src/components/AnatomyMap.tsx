import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BODY_FRONT, BODY_BACK, CATEGORY_MAP } from '../constants/musclePaths';

interface AnatomyMapProps {
  volume: Record<string, number>;
  highlightedGroup?: string | null;
}

const AnatomyMap: React.FC<AnatomyMapProps> = ({ volume, highlightedGroup }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<{ name: string; sets: number; slug: string } | null>(null);

  const getSetsForSlug = (slug: string) => {
    // Check which category this slug belongs to
    for (const [cat, slugs] of Object.entries(CATEGORY_MAP)) {
      if (slugs.includes(slug)) {
        return volume[cat] || 0;
      }
    }
    // Check specific muscle groups if available in volume
    return volume[slug] || 0;
  };

  const getHeatColor = (sets: number) => {
    if (sets === 0) return '#f1f5f9'; // Inactivo
    
    // Fatigue Logic (Point 5)
    if (sets > 15) return '#ef4444'; // Sobreentrenado (Rojo oscuro)
    if (sets > 10) return '#fb7185'; // Fatigado (Coral)
    
    // Heatmap scaling (Point 1)
    if (sets < 3) return '#F59E0B40';  // Sutil
    if (sets < 6) return '#F59E0B80';  // Medio
    if (sets < 10) return '#F59E0BBB'; // Fuerte
    return '#F59E0B';                  // Pleno
  };

  const getOpacity = (slug: string, sets: number) => {
    // Point 2: Highlight selected group
    if (highlightedGroup) {
      const groupSlugs = CATEGORY_MAP[highlightedGroup.toLowerCase()] || [];
      if (groupSlugs.includes(slug)) return 1;
      return 0.1;
    }

    if (sets === 0) return 0.2;
    return 1;
  };

  const isFatigued = (sets: number) => sets > 10;

  const handleMuscleClick = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sets = getSetsForSlug(slug);
    setSelectedMuscle({ name: slug.toUpperCase(), sets, slug });
  };

  const renderPaths = (data: any[]) => {
    return data.map((muscle) => {
      const sets = getSetsForSlug(muscle.slug);
      const color = getHeatColor(sets);
      const opacity = getOpacity(muscle.slug, sets);
      const fatigued = isFatigued(sets);

      return (
        <React.Fragment key={muscle.slug}>
          {[...(muscle.path.left || []), ...(muscle.path.right || []), ...(muscle.path.common || [])].map((d: string, i: number) => (
            <motion.path
              key={`${muscle.slug}-${i}`}
              d={d}
              onClick={(e) => handleMuscleClick(muscle.slug, e)}
              className={`cursor-pointer transition-colors duration-500 ${fatigued ? 'animate-fatigue-pulse' : ''}`}
              animate={{ 
                fill: color,
                opacity: opacity
              }}
              stroke={highlightedGroup ? (opacity === 1 ? '#F59E0B' : '#e2e8f0') : '#cbd5e1'}
              strokeWidth={highlightedGroup && opacity === 1 ? "1" : "0.5"}
            />
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full" onClick={() => setSelectedMuscle(null)}>
      <div className="flex gap-4 items-center justify-center scale-90 md:scale-95 bg-slate-50/30 p-8 rounded-[4rem] border border-slate-100/50 shadow-inner">
        <div className="relative w-32 h-64 md:w-40 md:h-80">
          <svg viewBox="0 0 724 1448" className="w-full h-full drop-shadow-sm">
            {renderPaths(BODY_FRONT)}
          </svg>
          <span className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Vista Frontal</span>
        </div>
        
        <div className="w-[1px] h-40 bg-slate-200/50" />

        <div className="relative w-32 h-64 md:w-40 md:h-80">
          <svg viewBox="724 0 724 1448" className="w-full h-full drop-shadow-sm">
            {renderPaths(BODY_BACK)}
          </svg>
          <span className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Vista Posterior</span>
        </div>
      </div>

      <AnimatePresence>
        {selectedMuscle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white shadow-2xl rounded-3xl p-4 border border-slate-100 min-w-[160px]"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedMuscle.name}</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-slate-900">{Math.round(selectedMuscle.sets * 10) / 10} <span className="text-[10px] text-slate-400 uppercase">Sets</span></span>
                <div className={`w-2 h-2 rounded-full ${
                  selectedMuscle.sets > 15 ? 'bg-red-600' :
                  selectedMuscle.sets > 10 ? 'bg-rose-400' :
                  selectedMuscle.sets > 0 ? 'bg-amber-400' : 'bg-slate-200'
                }`} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {selectedMuscle.sets > 15 ? '⛔️ Sobreentrenado' :
                 selectedMuscle.sets > 10 ? '⚠️ Fatiga Alta' :
                 selectedMuscle.sets > 0 ? '⚡️ En Proceso' : '💤 Recuperado'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnatomyMap;
