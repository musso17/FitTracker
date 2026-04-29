import { useState } from 'react';
import { ACTIVITY_TYPES } from '../constants';

export const useActiveSessionState = (_PLAN_BLOCKS: any[], logs: any[]) => {
    const [activeBlock, setActiveBlock] = useState<any>(null);
    const [gymProgress, setGymProgress] = useState<any>({});
    const [skippedExercises, setSkippedExercises] = useState<any>({});
    const [surfForm, setSurfForm] = useState({ duration: 60, feeling: 'good' });
    const [muayThaiForm, setMuayThaiForm] = useState({ duration: 80, intensity: 'media' });
    const [activityForm, setActivityForm] = useState<{ duration: number, intensity: string }>({ duration: 60, intensity: '' });
    const [sessionExercises, setSessionExercises] = useState<any[]>([]);
    
    // UI Local State for Active Session
    const [editingLogId, setEditingLogId] = useState<number | null>(null);
    const [isChangingBlock, setIsChangingBlock] = useState(false);
    const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
    const [replacingExerciseId, setReplacingExerciseId] = useState<string | null>(null);

    const resetSessionState = () => {
        setActiveBlock(null);
        setGymProgress({});
        setSkippedExercises({});
        setSessionExercises([]);
        setEditingLogId(null);
        setIsChangingBlock(false);
    };

    const startBlock = (block: any) => {
        setActiveBlock(block);
        setSessionExercises([...block.exercises]);
        if (block.exercises.length > 0) {
            const initialProgress: any = {};
            block.exercises.forEach((ex: any) => {
                const sortedHistory = [...logs].filter(l => l.gymData?.progress?.[ex.id]).sort((a,b) => a.date.localeCompare(b.date));
                const lastLog = sortedHistory.pop();
                const lastProgress = lastLog?.gymData?.progress?.[ex.id];

                initialProgress[ex.id] = Array.from({ length: ex.sets }, (_, i) => {
                    if (lastProgress && lastProgress[i] && lastProgress[i].weight) {
                        return { weight: lastProgress[i].weight.toString(), reps: '', completed: false };
                    }
                    return { weight: '', reps: '', completed: false };
                });
            });
            setGymProgress(initialProgress);
        }
        setSkippedExercises({});
        setSurfForm({ duration: 60, feeling: 'good' });
        setMuayThaiForm({ duration: 80, intensity: 'media' });
        if (block.activityType) {
            const actDef = ACTIVITY_TYPES.find(a => a.id === block.activityType);
            setActivityForm({ duration: actDef?.defaultDuration || 60, intensity: actDef?.intensityOptions[1]?.id || actDef?.intensityOptions[0]?.id || '' });
        }
    };

    return {
        activeBlock, setActiveBlock,
        gymProgress, setGymProgress,
        skippedExercises, setSkippedExercises,
        surfForm, setSurfForm,
        muayThaiForm, setMuayThaiForm,
        activityForm, setActivityForm,
        sessionExercises, setSessionExercises,
        editingLogId, setEditingLogId,
        isChangingBlock, setIsChangingBlock,
        isExerciseSelectorOpen, setIsExerciseSelectorOpen,
        replacingExerciseId, setReplacingExerciseId,
        resetSessionState, startBlock
    };
};
