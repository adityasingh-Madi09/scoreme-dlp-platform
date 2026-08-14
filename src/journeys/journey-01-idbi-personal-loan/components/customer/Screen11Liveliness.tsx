import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import './Screen11Liveliness.css';

/** How long the simulated liveliness check "runs" for once the camera
 *  preview (real or fallback) is showing — no real liveness/ML detection,
 *  per the original spec; just enough of a delay to feel like a check is
 *  happening. */
const LIVELINESS_CHECK_DELAY_MS = 2200;

type Stage = 'consent' | 'checking' | 'complete';
type CameraMode = 'live' | 'fallback' | null;

/**
 * Customer Flow — Screen 11 (Liveliness Check). No Figma reference exists
 * for this screen; designed here from judgment, following real
 * digital-lending privacy norms (purpose-specific, one-time consent shown
 * *before* any camera access is requested) and this platform's own design
 * language.
 *
 * Camera access (`navigator.mediaDevices.getUserMedia`) is only requested
 * after the applicant explicitly clicks "Start Liveliness Check". If
 * permission is denied or the API is unavailable, this falls back to a
 * static "simulated check" placeholder instead of crashing. Either way, a
 * short simulated delay follows before the check is marked complete.
 *
 * Any camera stream obtained is stopped as soon as the check completes,
 * and — as a failsafe covering the header's "Exit" button or any other
 * unmount path mid-check — again on unmount, so the browser's camera
 * indicator is never left on after leaving this screen.
 */
function Screen11Liveliness() {
  const { data, updateData, goNext } = useCustomerFlow();

  const [stage, setStage] = useState<Stage>(data.isLivelinessComplete ? 'complete' : 'consent');
  const [cameraMode, setCameraMode] = useState<CameraMode>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Failsafe: release the camera on unmount no matter how the user leaves
  // this screen (Continue, the header's Exit button, etc.), and clear any
  // pending simulated-check timer.
  useEffect(
    () => () => {
      stopStream();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [stopStream],
  );

  // Attach the live stream to the <video> preview once it's available.
  useEffect(() => {
    if (cameraMode === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraMode]);

  const beginSimulatedCheck = useCallback(() => {
    timeoutRef.current = window.setTimeout(() => {
      stopStream();
      setStage('complete');
      updateData({ isLivelinessComplete: true });
    }, LIVELINESS_CHECK_DELAY_MS);
  }, [stopStream, updateData]);

  const handleStart = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMode('fallback');
      setStage('checking');
      beginSimulatedCheck();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraMode('live');
      setStage('checking');
      beginSimulatedCheck();
    } catch {
      // Permission denied, no camera hardware, insecure context, etc. —
      // fall back gracefully rather than crashing or getting stuck.
      setCameraMode('fallback');
      setStage('checking');
      beginSimulatedCheck();
    }
  }, [beginSimulatedCheck]);

  const handleContinue = () => {
    goNext();
  };

  return (
    <section className="screen-liveliness">
      <div className="screen-liveliness-card">
        <p className="screen-liveliness-subtext">
          One quick step to confirm you&rsquo;re present for this application.
        </p>

        {stage === 'consent' && (
          <div className="screen-liveliness-consent">
            <p className="screen-liveliness-consent-text">
              We need one-time access to your camera to verify you&rsquo;re
              present for this application. Your video is not stored.
            </p>
            <Button type="button" onClick={handleStart}>
              Start Liveliness Check
            </Button>
          </div>
        )}

        {stage !== 'consent' && (
          <div className="screen-liveliness-preview-wrap">
            <div className="screen-liveliness-preview">
              {cameraMode === 'live' ? (
                <video
                  ref={videoRef}
                  className="screen-liveliness-video"
                  autoPlay
                  muted
                  playsInline
                  aria-label="Live camera preview"
                />
              ) : (
                <div className="screen-liveliness-fallback" role="img" aria-label="Camera preview unavailable">
                  <span className="screen-liveliness-fallback-icon" aria-hidden="true">
                    &#128247;
                  </span>
                  <span>Camera preview unavailable — simulated check</span>
                </div>
              )}

              {stage === 'complete' && (
                <div className="screen-liveliness-complete-overlay">
                  <span className="screen-liveliness-complete-check" aria-hidden="true">
                    &#10003;
                  </span>
                </div>
              )}
            </div>

            <div className="screen-liveliness-status" role="status" aria-live="polite">
              {stage === 'checking' && (
                <>
                  <span className="screen-liveliness-spinner" aria-hidden="true" />
                  <span>Checking&hellip;</span>
                </>
              )}
              {stage === 'complete' && <span>Liveliness check complete</span>}
            </div>
          </div>
        )}

        <div className="screen-liveliness-actions">
          <Button type="button" onClick={handleContinue} disabled={stage !== 'complete'}>
            Continue
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Screen11Liveliness;
