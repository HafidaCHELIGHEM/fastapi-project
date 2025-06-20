// src/components/BaseChart.js
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

// Register Chart.js components and plugins
ChartJS.register(...registerables, zoomPlugin);

// Helper function to draw selection lines on canvas
const drawSelectionLinesOnCanvas = (canvas, chartInstance, selectionLines, invalidSelection) => {
  if (!canvas || !chartInstance || !chartInstance.chartArea) return;
  
  const ctx = canvas.getContext('2d');
  const chartArea = chartInstance.chartArea;
  
  try {
    chartInstance.draw();
  } catch (e) {
    return;
  }
  
  const startX = selectionLines.startX;
  const endX = selectionLines.endX || startX;
  
  ctx.save();
  
  // Draw start line
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(66, 133, 244, 0.8)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.moveTo(startX, chartArea.top);
  ctx.lineTo(startX, chartArea.bottom);
  ctx.stroke();
  
  if (endX !== startX) {
    // Draw end line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(66, 133, 244, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.moveTo(endX, chartArea.top);
    ctx.lineTo(endX, chartArea.bottom);
    ctx.stroke();
    
    // Draw selection area
    ctx.fillStyle = invalidSelection
      ? 'rgba(255, 0, 0, 0.2)'
      : 'rgba(66, 133, 244, 0.1)';
    ctx.fillRect(
      Math.min(startX, endX),
      chartArea.top,
      Math.abs(endX - startX),
      chartArea.bottom - chartArea.top
    );
  }
  
  ctx.restore();
};

const BaseChart = ({ 
  data,
  isRealTime = false,
  title,
  yAxisLabel,
  xAxisLabel = "Time",
  dataKey,
  lineColor,
  backgroundColor,
  emptyMessage,
  onPauseStateChange = null
}) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef(null);
  
  // Chart and zoom states
  const [isPaused, setIsPaused] = useState(false);
  const [pausedData, setPausedData] = useState(null);
  const [chartValues, setChartValues] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [zoomedValues, setZoomedValues] = useState([]);
  const [zoomedLabels, setZoomedLabels] = useState([]);
  const [zoomRanges, setZoomRanges] = useState([]);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(0);
  
  // Selection states
  const [selectedStartIndex, setSelectedStartIndex] = useState(null);
  const [selectedEndIndex, setSelectedEndIndex] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [selectionLines, setSelectionLines] = useState({ startX: 0, endX: 0 });
  const [invalidSelection, setInvalidSelection] = useState(false);

  // Helper function to properly extract data array
  const extractDataArray = useCallback((dataSource) => {
    if (!dataSource) return [];
    return Array.isArray(dataSource) 
      ? dataSource 
      : (dataSource.cold_spray || []);
  }, []);

  // Process data when it changes or when pause state changes
  useEffect(() => {
    // Use paused data when paused, otherwise use the latest data
    const rawDataToProcess = isPaused ? pausedData : data;
    if (!rawDataToProcess) return;
    
    try {
      // Handle both array and object with cold_spray property
      const dataToProcess = extractDataArray(rawDataToProcess);
      
      if (dataToProcess.length === 0) return;
      
      const values = dataToProcess.map(item => item[dataKey]);
      const labels = dataToProcess.map(item => {
        const date = new Date(item.Time);
        return date.toLocaleTimeString();
      });
      
      setChartValues(values);
      setTimeLabels(labels);
      
      // If no zoom is active or first load, set zoomed data to all data
      if (zoomedValues.length === 0 || 
          (zoomedValues.length === chartValues.length && chartValues.length > 0 && currentZoomLevel === 0)) {
        setZoomedValues(values);
        setZoomedLabels(labels);
      }
    } catch (error) {
      console.error('Error processing data:', error);
    }
  }, [data, isPaused, pausedData, dataKey, zoomedValues.length, chartValues.length, currentZoomLevel, extractDataArray]);

  // When entering selection mode, automatically pause
  useEffect(() => {
    if (isSelecting && isRealTime && !isPaused) {
      setIsPaused(true);
      if (onPauseStateChange) {
        onPauseStateChange(true);
      }
      setPausedData(data);
    }
  }, [isSelecting, isRealTime, isPaused, onPauseStateChange, data]);

  // Update paused data when setting paused state
  const togglePause = useCallback(() => {
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    if (newPauseState) {
      // Preserve the exact same structure when pausing
      setPausedData(data);
    } else {
      // When unpausing, reset zoomed state if selection was complete
      if (selectionComplete) {
        startNewSelection();
      }
    }
    if (onPauseStateChange) {
      onPauseStateChange(newPauseState);
    }
  }, [isPaused, data, selectionComplete, onPauseStateChange]);
  
  // Chart data object
  const chartData = {
    labels: zoomedLabels,
    datasets: [
      {
        label: title,
        data: zoomedValues,
        borderColor: lineColor,
        backgroundColor: backgroundColor,
        pointBackgroundColor: lineColor,
        tension: 0.4,
        fill: true,
      }
    ],
  };

  // Set canvas reference for drawing selection lines
  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.canvas) {
        canvasRef.current = chartRef.current.canvas;
      } else if (chartRef.current?.canvasRef?.current) {
        canvasRef.current = chartRef.current.canvasRef.current;
      }
    }
  }, [chartRef.current, zoomedValues, zoomedLabels]); // Add dependencies to trigger updates

  // Keep track of state values for animation frames
  useEffect(() => {
    stateRef.current = {
      isSelecting,
      selectionLines,
      selectionComplete,
      invalidSelection
    };
  }, [isSelecting, selectionLines, selectionComplete, invalidSelection]);
  
  // Set up the animation frame for drawing selection lines
  useEffect(() => {
    const drawSelectionLines = () => {
      const { isSelecting, selectionLines, selectionComplete, invalidSelection } = stateRef.current || {};
      
      if (!canvasRef.current || !chartRef.current || 
          !((isSelecting || selectionComplete) && selectionLines?.startX !== 0)) {
        animationRef.current = requestAnimationFrame(drawSelectionLines);
        return;
      }

      if (!chartRef.current.chartArea) {
        animationRef.current = requestAnimationFrame(drawSelectionLines);
        return;
      }
      
      drawSelectionLinesOnCanvas(
        canvasRef.current,
        chartRef.current,
        selectionLines,
        invalidSelection
      );
      
      animationRef.current = requestAnimationFrame(drawSelectionLines);
    };

    animationRef.current = requestAnimationFrame(drawSelectionLines);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Effect to trigger chart redraw when data changes
  useEffect(() => {
    if (chartRef.current) {
      try {
        chartRef.current.update();
      } catch (e) {
        console.error("Chart update failed:", e);
      }
    }
  }, [zoomedValues, zoomedLabels]);
  
  // Chart options with improved mobile support
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { 
        display: true, 
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        } 
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: { 
        beginAtZero: false, 
        title: { display: true, text: yAxisLabel },
        ticks: {
          // Fewer ticks on small screens
          maxTicksLimit: window.innerWidth < 768 ? 10 : 16
        }
      },
      x: { 
        title: { display: true, text: xAxisLabel },
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 10 : 25
        }
      },
    },
    elements: { 
      line: { tension: 0.4 },
      point: {
        // Optimize for large datasets
        radius: zoomedValues.length > 100 ? 0 : 3,
        hoverRadius: 6
      }
    },
    animation: { duration: isRealTime ? 0 : 1000 },
    // Better touch device support
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove', 'touchend'],

    // Handle mouse events for region selection
    onHover: (event, elements) => {
      if (!chartRef.current || selectionComplete) return;

      const chart = chartRef.current;
      
      // Handle mouse or touch
      const isMouseDown = event.native && event.native.buttons === 1;
      const isTouch = event.native && event.native.type && event.native.type.indexOf('touch') !== -1;
      
      if (isMouseDown || isTouch) {
        // Get the position
        const canvasPosition = {
          x: isTouch ? 
            event.native.touches[0].clientX - event.native.target.getBoundingClientRect().left : 
            event.native.offsetX,
          y: isTouch ? 
            event.native.touches[0].clientY - event.native.target.getBoundingClientRect().top : 
            event.native.offsetY
        };
        
        // Get data index from pixel position
        const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
        
        // Pause real-time updates when selection starts
        if (isRealTime && !isPaused && !isSelecting) {
          setIsPaused(true);
          if (onPauseStateChange) {
            onPauseStateChange(true);
          }
          setPausedData(data);
        }
        
        // Update selection state
        if (!isSelecting) {
          setIsSelecting(true);
          setSelectedStartIndex(Math.floor(dataX));
          setSelectionLines({ startX: canvasPosition.x, endX: 0 });
        } else if (canvasPosition.x !== selectionLines.endX) {
          // Only update end position if it has changed
          setSelectedEndIndex(Math.floor(dataX));
          setSelectionLines(prev => ({ ...prev, endX: canvasPosition.x }));
        }
      }
    },
  };

  // Handle mouse up event to finalize selection
  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting && selectedStartIndex !== null) {
        setIsSelecting(false);
        if (selectedEndIndex === null) {
          setSelectionLines(prev => ({ ...prev, endX: prev.startX }));
          setSelectedEndIndex(selectedStartIndex);
        }
        setSelectionComplete(true);

        const start = Math.min(selectedStartIndex, selectedEndIndex || selectedStartIndex);
        const end = Math.max(selectedStartIndex, selectedEndIndex || selectedStartIndex);
        setInvalidSelection(end - start < 1);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectedStartIndex, selectedEndIndex]);

  // Start a new selection by resetting selection state
  const startNewSelection = useCallback(() => {
    setSelectedStartIndex(null);
    setSelectedEndIndex(null);
    setIsSelecting(false);
    setSelectionComplete(false);
    setInvalidSelection(false);
    setSelectionLines({ startX: 0, endX: 0 });
  }, []);

  // Apply zoom to the selected region
  const applyZoom = useCallback(() => {
    if (
      selectedStartIndex !== null &&
      selectedEndIndex !== null &&
      chartValues.length > 0
    ) {
      const localStart = Math.min(selectedStartIndex, selectedEndIndex);
      const localEnd = Math.max(selectedStartIndex, selectedEndIndex);

      // Get valid indices within the current zoomed view
      const validLocalStart = Math.max(0, Math.floor(localStart));
      const validLocalEnd = Math.min(zoomedValues.length - 1, Math.ceil(localEnd));

      if (validLocalEnd - validLocalStart < 1) {
        setInvalidSelection(true);
        return;
      }

      // Calculate absolute indices in the original data based on zoom history
      let absoluteStart, absoluteEnd;
      
      if (currentZoomLevel === 0) {
        // First zoom level - indices are already absolute
        absoluteStart = validLocalStart;
        absoluteEnd = validLocalEnd;
      } else {
        // Get the current zoom range
        const currentRange = zoomRanges[currentZoomLevel - 1];
        // Convert local indices to absolute indices
        absoluteStart = currentRange.start + validLocalStart;
        absoluteEnd = currentRange.start + validLocalEnd;
        // Make sure we don't exceed the original data bounds
        absoluteStart = Math.min(absoluteStart, chartValues.length - 1);
        absoluteEnd = Math.min(absoluteEnd, chartValues.length - 1);
      }
      
      // First, calculate the new zoom range data
      const newZoomedValues = chartValues.slice(absoluteStart, absoluteEnd + 1);
      const newZoomedLabels = timeLabels.slice(absoluteStart, absoluteEnd + 1);

      // Check if the new zoom is the same as current zoom
      const isSameZoom = newZoomedValues.length === zoomedValues.length && 
        absoluteStart === (currentZoomLevel === 0 ? 0 : zoomRanges[currentZoomLevel - 1].start) &&
        absoluteEnd === (currentZoomLevel === 0 ? chartValues.length - 1 : zoomRanges[currentZoomLevel - 1].end);

      // Only apply zoom if it's different from current view
      if (!isSameZoom) {
        // Update zoom history for the new zoom level
        const newZoomRange = { start: absoluteStart, end: absoluteEnd };
        
        // If we're adding a new zoom level
        if (currentZoomLevel === zoomRanges.length) {
          setZoomRanges([...zoomRanges, newZoomRange]);
        } else {
          // If we're replacing an existing zoom level (e.g. after a "New Selection")
          const updatedRanges = [...zoomRanges.slice(0, currentZoomLevel), newZoomRange];
          setZoomRanges(updatedRanges);
        }
        
        setZoomedValues(newZoomedValues);
        setZoomedLabels(newZoomedLabels);
        setCurrentZoomLevel(currentZoomLevel + 1);
        startNewSelection();
      } else {
        // If same zoom, just clear the selection
        startNewSelection();
      }
    }
  }, [
    selectedStartIndex, selectedEndIndex, chartValues, 
    zoomedValues.length, currentZoomLevel, zoomRanges, timeLabels
  ]);

  // Reset zoomed data to show all data and resume real-time updates
  const resetZoom = useCallback(() => {
    setIsPaused(false);
    if (onPauseStateChange) {
      onPauseStateChange(false);
    }
    setZoomedValues(chartValues);
    setZoomedLabels(timeLabels);
    setZoomRanges([]);
    setCurrentZoomLevel(0);
    startNewSelection();
  }, [chartValues, timeLabels, onPauseStateChange]);

  // Undo the last zoom level
  const undoZoom = useCallback(() => {
    if (currentZoomLevel > 0 && zoomRanges.length > 0) {
      const previousLevel = currentZoomLevel - 1;
      const previousRange = previousLevel === 0 
        ? { start: 0, end: chartValues.length - 1 }
        : zoomRanges[previousLevel - 1];
  
      setZoomedValues(chartValues.slice(previousRange.start, previousRange.end + 1));
      setZoomedLabels(timeLabels.slice(previousRange.start, previousRange.end + 1));
      setCurrentZoomLevel(previousLevel);
  
      const updatedRanges = zoomRanges.slice(0, previousLevel);
      setZoomRanges(updatedRanges);
  
      startNewSelection();
    }
  }, [currentZoomLevel, zoomRanges, chartValues, timeLabels]);

  // Helper to check if we have data to display
  const hasData = Array.isArray(data) 
    ? data.length > 0 
    : (data?.cold_spray?.length > 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-96" role="region" aria-label={`${title} chart`}>
      {hasData ? (
        <div className="relative h-full">
          <div className="absolute top-0 right-0 z-10 flex space-x-2 p-2">
            {isRealTime && isPaused && zoomedValues.length === chartValues.length && (
              <button
                onClick={togglePause}
                className="bg-green-500 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
                aria-label="Resume"
              >
                Resume
              </button>
            )}
            {selectionComplete && selectedStartIndex !== null && selectedEndIndex !== null && (
              <button
                onClick={applyZoom}
                className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                aria-label="Zoom to Selection"
              >
                Zoom to Selection
              </button>
            )}
            {selectionComplete && (
              <button
                onClick={startNewSelection}
                className="bg-yellow-500 hover:bg-yellow-700 text-white text-xs py-1 px-2 rounded"
                aria-label="New Selection"
              >
                New Selection
              </button>
            )}
            {currentZoomLevel > 0 && (
              <button
                onClick={undoZoom}
                className="bg-purple-500 hover:bg-purple-700 text-white text-xs p-1 rounded flex items-center justify-center"
                aria-label="Undo last zoom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l-7 7 7 7M22 12H4" />
                </svg>
              </button>
            )}
            {zoomedValues.length !== chartValues.length && (
              <button
                onClick={resetZoom}
                className="bg-gray-500 hover:bg-gray-700 text-white text-xs py-1 px-2 rounded"
                aria-label="Reset Zoom"
              >
                Reset Zoom
              </button>
            )}
          </div>

          <div className="h-full">
            <Line 
              ref={chartRef} 
              options={options} 
              data={chartData} 
              aria-label={title}
            />
            {isSelecting && (
              <div className="absolute bottom-0 left-0 bg-gray-100 p-1 text-xs text-gray-700 rounded-tr">
                Drag to select region
              </div>
            )}
            {selectionComplete && (
              <div className="absolute bottom-0 left-0 bg-gray-100 p-1 text-xs text-gray-700 rounded-tr">
                {invalidSelection
                  ? "Selection is invalid. Please select at least 2 data points."
                  : "Click 'Zoom to Selection' or 'New Selection'"}
              </div>
            )}
            {isRealTime && isPaused && (
              <div className="absolute top-12 right-0 bg-yellow-100 p-1 text-xs text-yellow-700 rounded-tl">
                Data feed paused
              </div>
            )}
            {currentZoomLevel > 0 && (
              <div className="absolute top-7 left-0 bg-blue-100 p-1 text-xs text-blue-700 rounded-tr">
                Zoom level: {currentZoomLevel}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500">{emptyMessage || `No ${yAxisLabel.toLowerCase()} data available`}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseChart;