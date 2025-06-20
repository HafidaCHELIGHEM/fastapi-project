// src/components/MicrophoneDataChart.js
import React, { useState, useEffect } from "react";
import BaseChart from "@/components/BaseChart";

// Helper function to process microphone data
const processMicrophoneData = (micData) => {
  if (!micData || micData.length === 0) return [];
  
  const processedData = [];
  
  micData.forEach(item => {
    try {
      // Convert base64 string to Float32Array
      const base64Data = item.data;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert to Float32Array
      const float32Array = new Float32Array(bytes.buffer);
      
      // Get timestamp
      const timestamp = new Date(item.timestamp);
      
      // Add each data point as a separate entry with timestamp
      for (let i = 0; i < float32Array.length; i++) {
        // Add a small time offset for each sample to maintain time sequence
        const offsetMs = (i / float32Array.length) * 10; // 10ms spread
        const sampleTime = new Date(timestamp.getTime() + offsetMs);
        
        processedData.push({
          Time: sampleTime.toISOString(),
          Amplitude: float32Array[i],
          MicId: item.micId || "unknown" // Keep microphone ID if available
        });
      }
    } catch (error) {
      console.error('Error processing microphone data sample:', error);
    }
  });
  
  return processedData;
};

const MicrophoneDataChart = ({ micData, micId, color, isRealTime, onPauseStateChange = null }) => {
  const [processedData, setProcessedData] = useState([]);
  
  // Process the microphone data when it changes
  useEffect(() => {
    setProcessedData(processMicrophoneData(micData));
  }, [micData]);
  
  return (
    <BaseChart
      data={processedData}
      isRealTime={isRealTime}
      title={`Microphone ${micId} Waveform`}
      yAxisLabel="Amplitude"
      xAxisLabel="Time"
      dataKey="Amplitude"
      lineColor={color}
      backgroundColor={color.replace('rgb', 'rgba').replace(')', ', 0.2)')}
      emptyMessage="No microphone data available"
      onPauseStateChange={onPauseStateChange}
    />
  );
};

export default MicrophoneDataChart;