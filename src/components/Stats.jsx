import React from "react";

const Stats = ({ checked, total, percentage }) => (
  <div className="stats">
    <div className="stat-box">
      Attendance Rate: {percentage}%
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
    <div className="stat-box">Checked in: {checked} / {total}</div>
  </div>
);

export default Stats;
