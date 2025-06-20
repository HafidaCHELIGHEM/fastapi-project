// src/components/Dashboard.js
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useWebSocketConnection } from "../utils/websocketConnection";
import TemperatureChart from "@/components/TemperatureChart";
import PressureChart from "@/components/PressureChart";
import FlowRateChart from "@/components/FlowRateChart";
import ParticuleSpeedChart from "@/components/ParticuleSpeedChart";
import TemperatureGaugeChart from "@/components/TemperatureGaugeChart";
import PressureGaugeChart from "@/components/PressureGaugeChart";
import FlowRateGaugeChart from "@/components/FlowRateGaugeChart";
import MicrophoneDataChart from "@/components/MicrophoneDataChart";
import FrequencySpectrumChart from "@/components/FrequencySpectrumChart";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ShineBorder } from "@/components/magicui/shine-border";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import zoomPlugin from 'chartjs-plugin-zoom';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  zoomPlugin
);

const ColdsprayDash = () => {
  const {
    isConnected,
    isLoading,
    error,
    lastUpdated,
    data,
    filterDate,
    micData0,
    micData1,
    isRealTime,
    handleDateChange,
    handleReconnect,
    maintenanceRequired,
  } = useWebSocketConnection();

  return (
    <div>
      {/* Header with controls */}
      <div className="flex flex-wrap items-center mb-6 bg-transparent rounded-lg shadow-md p-4">
        <div className="mr-4 mb-2">
          <DatePicker
            selected={filterDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select date for historical data"
            isClearable
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mr-4 mb-2 font-bold">
          {isRealTime ? (
            <span className="text-green-600">Real-Time Mode</span>
          ) : (
            <span className="text-blue-600">Historical Mode</span>
          )}
        </div>
        <div className="mb-2 flex items-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          {!isConnected && (
            <button
              onClick={handleReconnect}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
            >
              Reconnect
            </button>
          )}
        </div>
        {lastUpdated && (
          <div className="ml-auto text-xs text-gray-500">
            Last updated: {lastUpdated}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading data...</p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      ) : (
        <>
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Cold Spray Data */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-4 mb-6">
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-6 text-[#41463b]">
              {isRealTime
                ? "Real-Time Cold Spray Data"
                : `Cold Spray Data for ${filterDate?.toLocaleDateString()}`}
            </h1>
          </div>

          {/* Maintenance Alert */}
          {maintenanceRequired && (
            <div className="relative bg-red-50 rounded-lg shadow-lg p-4 mb-6 overflow-hidden animate-bounce">
              <ShineBorder
                shineColor={["red", "#ff2d53", "#FFBE7B","red"]}
              />
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-red-800">
                    Maintenance Required
                  </h3>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      <AnimatedShinyText>
                        System parameters indicate that maintenance is recommended. Please schedule maintenance soon to prevent potential failures.
                      </AnimatedShinyText>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-8">
            {/* Particule speed Row */}
            <div className="relative h-full">
              <ParticuleSpeedChart data={data} isRealTime={isRealTime} />
            </div>
            {/* Temperature Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-4">
                <TemperatureChart data={data} isRealTime={isRealTime} />
              </div>
              <div className="md:col-span-1">
                <TemperatureGaugeChart data={data} />
              </div>
            </div>
            {/* Pressure Row */}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-4">
                <PressureChart data={data} isRealTime={isRealTime} />
              </div>
              <div className="md:col-span-1">
                <PressureGaugeChart data={data} />
              </div>
            </div>

            {/* Flow Rate Row */}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-4">
                <FlowRateChart data={data} isRealTime={isRealTime} />
              </div>
              <div className="md:col-span-1">
                <FlowRateGaugeChart data={data} />
              </div>
            </div>
          </div>

          {/* Mic Data */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-4 mb-6 mt-8">
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-6 text-[#41463b]">
              {isRealTime
                ? "Real-Time Microphone Data"
                : `Microphone Data for ${filterDate?.toLocaleDateString()}`}
            </h1>
          </div>
          {/* Mic 0 Row */}
          <div className="relative h-full mb-8">
            <div>
              <MicrophoneDataChart
                micData={micData0}
                micId="0"
                color="rgb(220, 53, 69)"
                isRealTime={isRealTime}
              />
            </div>
          </div>

          {/* Mic 1 Row */}
          <div className="relative h-full mb-8">
            <div>
              <MicrophoneDataChart
                micData={micData1}
                micId="1"
                color="rgb(32, 201, 151)"
                isRealTime={isRealTime}
              />
            </div>
          </div>

          {/* Mic 1 Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <FrequencySpectrumChart
                micData={micData0}
                micId="0"
                color="rgb(220, 53, 69)"
                isRealTime={isRealTime}
              />
            </div>
            <div>
              <FrequencySpectrumChart
                micData={micData1}
                micId="1"
                color="rgb(32, 201, 151)"
                isRealTime={isRealTime}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColdsprayDash;
