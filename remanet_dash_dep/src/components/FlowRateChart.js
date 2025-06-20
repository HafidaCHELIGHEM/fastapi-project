// src/components/FlowRateChart.js
import React from "react";
import BaseChart from "@/components/BaseChart";

const FlowRateChart = ({ data, isRealTime }) => {
  return (
    <BaseChart
      data={data}
      isRealTime={isRealTime}
      title="Flow Rate (Q_PG_N2)"
      yAxisLabel="Flow Rate"
      dataKey="Q_PG_N2"
      lineColor="rgb(75, 192, 192)"
      backgroundColor="rgba(75, 192, 192, 0.5)"
      emptyMessage="No flow rate data available"
    />
  );
};

export default FlowRateChart;