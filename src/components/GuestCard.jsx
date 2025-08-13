import React from "react";

const TrashIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
    {...props}
  >
    {/* Simple, high-contrast trash can (stroke = currentColor) */}
    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="6" y="6" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);


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
  <TrashIcon className="icon" />
</button>
      </div>
    </div>
 );
};

export default GuestCard;
