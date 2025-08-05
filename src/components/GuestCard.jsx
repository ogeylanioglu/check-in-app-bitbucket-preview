import React from "react";

const GuestCard = ({ guest, checkedIn, toggleCheckIn }) => (
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
    </div>
  </div>
);

export default GuestCard;
