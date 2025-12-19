import React from "react";
import trashUrl from "../assets/trash.svg?url";

const GuestCard = ({ guest, checkedIn, toggleCheckIn, onRemoveManual }) => {
  const nameKey = `${guest.firstName} ${guest.lastName}`;

  const isCheckedIn = checkedIn[nameKey];

  return (
    <div
     className={`guest-card ${isCheckedIn ? "checked" : ""} ${
        guest.registrationType === "On-Site" ? "manual" : ""
      }`}
    >
      <div className="guest-top">
        <div className="guest-info">
          <span className="guest-name">{guest.firstName} {guest.lastName}</span>
          <div className="chips">
            <span className={`chip ${isCheckedIn ? "green" : "red"}`}>
              {isCheckedIn ? "Checked In" : "Not Checked In"}
            </span>
            <span className="chip gray">{guest.registrationType}</span>
          </div>
        </div>

      <div className="guest-actions">
          <button
            className={`check-btn ${isCheckedIn ? "check-btn--undo" : "check-btn--check"}`}
            onClick={() => toggleCheckIn(nameKey)}
            type="button"
          >
            {isCheckedIn ? "Undo" : "Check In"}
          </button>
        
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
              type="button"
            >
              <img src={trashUrl} alt="" className="icon-img" />
            </button>
          )}
        </div>
      </div>
    </div>
 );
};

export default GuestCard;
