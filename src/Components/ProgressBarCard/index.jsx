import React from "react";
import style from "./index.module.css";

const ProgressBarCard = ({
  title,
  percentage, // Overall total percentage (top right)
  totalTitle,
  totalValue, // Bottom right value
  paid = 0,    // Segment count or value for Paid
  pending = 0, // Segment count or value for Pending
  overdue = 0, // Segment count or value for Overdue
}) => {
  const totalSegments = paid + pending + overdue;

  // Calculate the percentage width for each segment safely
  const paidWidth = totalSegments ? (paid / totalSegments) * 100 : 0;
  const pendingWidth = totalSegments ? (pending / totalSegments) * 100 : 0;
  const overdueWidth = totalSegments ? (overdue / totalSegments) * 100 : 0;

  // Ensure main percentage stays between 0 and 100
  const clampedMainPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={style.cardContainer}>
      {/* Top Row: Title & Main Percentage */}
      <div className={style.row}>
        <span className={style.title}>{title}</span>
        <span className={style.percentage}>{clampedMainPercentage}%</span>
      </div>

      {/* Multi-Segment Progress Bar Track */}
      <div className={style.barTrack}>
        {paidWidth > 0 && (
          <div
            className={`${style.barSegment} ${style.bgPaid}`}
            style={{ width: `${paidWidth}%` }}
            title={`Paid: ${paid}`}
          />
        )}
        {pendingWidth > 0 && (
          <div
            className={`${style.barSegment} ${style.bgPending}`}
            style={{ width: `${pendingWidth}%` }}
            title={`Pending: ${pending}`}
          />
        )}
        {overdueWidth > 0 && (
          <div
            className={`${style.barSegment} ${style.bgOverdue}`}
            style={{ width: `${overdueWidth}%` }}
            title={`Overdue: ${overdue}`}
          />
        )}
      </div>

      {/* Bottom Row: Total Title & Numbers */}
      <div className={style.row}>
        <span className={style.totalTitle}>{totalTitle}</span>
        <span className={style.totalValue}>{totalValue}</span>
      </div>
    </div>
  );
};

export default ProgressBarCard;