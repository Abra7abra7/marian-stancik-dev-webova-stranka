import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioRecorderProps {
    onRecordingComplete?: (blob: Blob) => void;
    maxDuration?: number; // in seconds
}

export function useAudioRecorder({
    onRecordingComplete,
    maxDuration = 30
}: UseAudioRecorderProps = {}) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [hasPermission, setHasPermission] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Check/request permission on mount (optional, or do it on first click)
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => setHasPermission(true))
            .catch((err) => {
                console.error("Audio permission denied:", err);
                setHasPermission(false);
            });

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                if (onRecordingComplete) {
                    onRecordingComplete(blob);
                }

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    const next = prev + 1;
                    if (next >= maxDuration) {
                        stopRecording();
                    }
                    return next;
                });
            }, 1000);

        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    }, [maxDuration, onRecordingComplete]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    return {
        isRecording,
        duration,
        audioBlob,
        hasPermission,
        startRecording,
        stopRecording
    };
}
