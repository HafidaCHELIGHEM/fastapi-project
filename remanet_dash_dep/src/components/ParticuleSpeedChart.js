// src/components/ParticuleSpeedChart.js
import React from "react";
import BaseChart from "@/components/BaseChart";

const ParticuleSpeedChart = ({ data, isRealTime }) => {
  return (
    <BaseChart
      data={data}
      isRealTime={isRealTime}
      title="Particule Speed (V_Particule)"
      yAxisLabel="Particule Speed"
      dataKey="V_Particule"
      lineColor="rgb(255, 206, 86)"
      backgroundColor="rgba(255, 206, 86, 0.3)"
      emptyMessage="No Particule Speed data available"
    />
  );
};

export default ParticuleSpeedChart;