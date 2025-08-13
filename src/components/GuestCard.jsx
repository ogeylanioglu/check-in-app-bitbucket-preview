import React from "react";
import { HiOutlineTrash } from "react-icons/hi";

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

     {/* TEMP: render for everyone to verify visibility */}
<button
  className="icon-btn icon-btn--danger"
  onClick={(e) => {
    e.stopPropagation();
    alert("Trash button visible (temp test)"); // sanity check
  }}
  aria-label="Remove guest (temp)"
  title="Remove guest (temp)"
>
  <HiOutlineTrash className="icon" />
</button>
      </div>
    </div>
 );
};

export default GuestCard;
