// src/components/FrequencySpectrumChart.js
import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from "chart.js";

// Register Chart.js components and plugins
ChartJS.register(...registerables);

const FrequencySpectrumChart = ({ micData, micId, color, isRealTime }) => {
  const chartRef = useRef(null);
  
  // State for frequency data
  const [frequencyData, setFrequencyData] = useState([]);
  
  // Process the base64 encoded data to extract frequency information
  useEffect(() => {
    if (!micData || micData.length === 0) return;
    
    try {
      // Get the most recent microphone data
      const latestData = micData[micData.length - 1];
      
      // Convert base64 string to Float32Array
      const base64Data = latestData.data;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert to Float32Array
      const float32Array = new Float32Array(bytes.buffer);
      
      // Create a simulated frequency spectrum
      // In a real app, you'd use FFT here
      const fftSize = Math.min(float32Array.length, 1024);
      const fakeFrequencyData = [];
      
      // Generate simulated frequency data
      // In reality, you would use a proper FFT algorithm here
      for (let i = 0; i < fftSize / 2; i++) {
        // Create some bins with frequency and magnitude
        fakeFrequencyData.push({
          frequency: i * (22050 / (fftSize / 2)), // Assuming 44.1kHz sample rate
          magnitude: Math.abs(float32Array[i]),
        });
      }
      
      setFrequencyData(fakeFrequencyData);
    } catch (error) {
      console.error('Error processing frequency data:', error);
    }
  }, [micData]);
  
  // Generate chart data from frequency data
  const chartData = {
    labels: frequencyData.map(item => Math.round(item.frequency) + ' Hz'),
    datasets: [
      {
        label: `Mic ${micId} Frequency Spectrum`,
        data: frequencyData.map(item => item.magnitude),
        backgroundColor: color,
        borderColor: color.replace(')', ', 1)'),
        borderWidth: 1,
      }
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Microphone ${micId} Frequency Spectrum`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Magnitude'
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: 'Frequency (Hz)'
        },
        ticks: {
          // Show fewer ticks to avoid crowding
          maxTicksLimit: 10,
          callback: function(val, index) {
            // Show only some frequency labels
            const label = this.getLabelForValue(val);
            return index % 5 === 0 ? label : '';
          }
        }
      }
    },
    animation: {
      duration: isRealTime ? 0 : 1000,
    },
  };

  // Update chart when data changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [frequencyData]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-80">
      {frequencyData.length > 0 ? (
        <div className="h-full">
          <Bar ref={chartRef} data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No frequency data available</p>
        </div>
      )}
    </div>
  );
};

export default FrequencySpectrumChart;