// src/components/TemperatureChart.js
import React from "react";
import BaseChart from "@/components/BaseChart";

const TemperatureChart = ({ data, isRealTime }) => {
  return (
    <BaseChart
      data={data}
      isRealTime={isRealTime}
      title="Temperature (T_gun)"
      yAxisLabel="Temperature"
      dataKey="T_gun"
      lineColor="rgb(255, 99, 132)"
      backgroundColor="rgba(255, 99, 132, 0.3)"
      emptyMessage="No temperature data available"
    />
  );
};

export default TemperatureChart;