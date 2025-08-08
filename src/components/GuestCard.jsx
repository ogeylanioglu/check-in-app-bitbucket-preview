import React from "react";

const GuestCard = ({ guest, checkedIn, toggleCheckIn, onRemoveManual }) => (
  <div
    onClick={() => toggleCheckIn(guest.Name)}
    className={`guest-card ${checkedIn[guest.Name] ? "checked" : ""} ${
      guest.registrationType === "On-Site" ? "manual" : ""
    }`}
  >
    <div className="guest-top">
      <div className="guest-info">
        <span className="guest-name">{guest.Name}</span>
        <div className="chips">
          <span className={`chip ${checkedIn[guest.Name] ? "green" : "red"}`}>
            {checkedIn[guest.Name] ? "Checked In" : "Not Checked In"}
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
            if (confirm(`Remove ${guest.Name}?`)) {
              onRemoveManual(guest.Name);
            }
          }}
          aria-label="Remove on-site guest"
          title="Remove on-site guest"
        >
          🗑️
        </button>
      )}
    </div>
  </div>
);

export default GuestCard;
