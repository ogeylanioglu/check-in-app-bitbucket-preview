import React from "react";
import trashUrl from "../assets/trash.svg?url";

const GuestCard = ({ guest, checkedIn, toggleCheckIn, onRemoveManual }) => {
  const nameKey = `${guest.firstName} ${guest.lastName}`;

  return (
    <div
      onClick={() => toggleCheckIn(nameKey)}
      className={`guest-card ${checkedIn[nameKey] ? "checked" : ""} ${
        guest.registrationType === "On-Site" ? "manual" : ""
      }`}
    >
      <div className="guest-top">
        <div className="guest-info">
          <span className="guest-name">{guest.firstName} {guest.lastName}</span>
          <div className="chips">
            <span className={`chip ${checkedIn[nameKey] ? "green" : "red"}`}>
              {checkedIn[nameKey] ? "Checked In" : "Not Checked In"}
            </span>
            <span className="chip gray">{guest.registrationType}</span>
          </div>
        </div>

      {/* Trash button only for On-Site guests */}
        {guest.registrationType === "On-Site" && (
          <button
            className="icon-btn icon-btn--danger"
            onClick={(e) => {
              e.stopPropagation(); // don't toggle check-in
              if (confirm(`Remove ${guest.firstName} ${guest.lastName}?`)) {
                onRemoveManual(nameKey);
              }
            }}
            aria-label="Remove on-site guest"
            title="Remove on-site guest"
          >
            <img src={trashUrl} alt="" className="icon-img" />
          </button>
        )}
      </div>
    </div>
 );
};

export default GuestCard;
