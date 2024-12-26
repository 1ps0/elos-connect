
export const captureVideoClip = async (videoElement) => {
  if (!videoElement) {
    throw new Error('No video element found');
  }

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  const recordedChunks = [];

  // Store current playback state
  const wasPlaying = !videoElement.paused;
  if (wasPlaying) {
    videoElement.pause();
  }

  const currentTime = videoElement.currentTime;
  // Start 2.5s before current time
  videoElement.currentTime = Math.max(0, currentTime - 2.5);
  
  const stream = canvas.captureStream(30); // 30 FPS
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp8'
  });
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    // Convert blob to array buffer for sending
    blob.arrayBuffer().then(buffer => {
      browser.runtime.sendMessage({
        action: 'save.video_clip',
        data: Array.from(new Uint8Array(buffer)),
        filename: `clip-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`,
        metadata: {
          sourceUrl: window.location.href,
          timestamp: currentTime,
          duration: 5
        }
      });
    });
  };

  // Draw video frames to canvas
  const drawFrame = () => {
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  };

  mediaRecorder.start();
  videoElement.play();
  
  // Capture frames
  const interval = setInterval(drawFrame, 1000/30); // 30 FPS

  setTimeout(() => {
    clearInterval(interval);
    mediaRecorder.stop();
    videoElement.pause();
    videoElement.currentTime = currentTime;
    if (wasPlaying) {
      videoElement.play();
    }
  }, 5000);
};

const showRecordingIndicator = () => {
  const indicator = document.createElement('div');
  indicator.className = 'elos-recording-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 8px 16px;
    background: rgba(0,0,0,0.7);
    color: white;
    border-radius: 4px;
    z-index: 999999;
  `;
  indicator.textContent = 'Recording clip...';
  document.body.appendChild(indicator);
  return indicator;
};
