import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

const VideoPlayer: React.FC = () => {
  const [drowsinessAlert, setDrowsinessAlert] = useState(false);
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drowsyFrames, setDrowsyFrames] = useState(0);
  const [yawnCount, setYawnCount] = useState(0);

  useEffect(() => {
    const video = document.createElement('video');

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();
      }
    });

    const detectDrowsiness = async () => {
      if (webcamRef.current && canvasRef.current) {
        const video = webcamRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const formData = new FormData();
              formData.append('image', blob, 'frame.jpg');

              const response = await fetch('http://127.0.0.1:5000/detect', {
                method: 'POST',
                body: formData,
    
              });

              const result = await response.json();
              console.log(result);

              if (result.drowsy) {
                setDrowsyFrames(prev => prev + 1);
                console.log(drowsyFrames);
                if (result.yawn) {
                  setYawnCount(prev => prev + 1);
                  console.log(yawnCount);
                }
              } else {
                //setDrowsyFrames(0);
              }

              if (drowsyFrames >= 3 || yawnCount > 3) {
                console.log('Displaying drowsiness alert...');
                setDrowsyFrames(0);
                setYawnCount(0);
                setDrowsinessAlert(true);
              } else {
                setDrowsinessAlert(false);
              }
            }
          }, 'image/jpeg');
        }
      }
    };

    const interval = setInterval(detectDrowsiness, 1000);

    return () => clearInterval(interval);
  }, [drowsyFrames, yawnCount]);

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <video
        ref={webcamRef}
        style={{ position: 'absolute', bottom: 20, right: 20, width: '300px', height: '200px', objectFit: 'cover', zIndex: 2 }}
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
      />
      <video
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
        controls
        autoPlay
        muted
        loop
      >
        <source src="/videos/Drive on Highway 3 _ ISRAEL 2020 _ נסיעה בכביש 3 - Trim.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {drowsinessAlert && (
        <Typography
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '24px',
          }}
        >
          DROWSINESS ALERT!
        </Typography>
      )}
    </Box>
  );
};

export default VideoPlayer;
