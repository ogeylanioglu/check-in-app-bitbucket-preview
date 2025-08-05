import React, { useState } from "react";
import Papa from "papaparse";
import ExportCSVButton from "./components/ExportCSVButton";
import "./index.css"; //

function App() {
  const [guestList, setGuestList] = useState([]);
  const [checkedIn, setCheckedIn] = useState({});

  // CSV Upload Handler
  const handleFileUpload = (e) => {
    Papa.parse(e.target.files[0], {
      header: true,
      complete: (results) => {
        const uploadedGuests = results.data.map((row) => ({
          Name: row.Name,
          checkedIn: false,
          manual: false,
        }));
        setGuestList(uploadedGuests);
      },
    });
  };

  // Manual Add Guest
  const handleAddGuest = () => {
    const name = prompt("Enter guest name:");
    if (name) {
      setGuestList([
        ...guestList,
        { Name: name, checkedIn: false, manual: true },
      ]);
    }
  };

  // Toggle Check-In
  const toggleCheckIn = (name) => {
    setCheckedIn((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Stats
  const checkedCount = Object.values(checkedIn).filter(Boolean).length;
  const percentage =
    guestList.length > 0 ? Math.round((checkedCount / guestList.length) * 100) : 0;

  return (
    <div className="container"> {/* restored wrapper */}
      <h1>Guest Check-In</h1>

      {/* File Upload */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="upload-btn"  // styled class
      />

      {/* Add Guest */}
      <button onClick={handleAddGuest} className="add-btn">
        + Add Guest
      </button>

      {/* Export CSV (new component) */}
      <ExportCSVButton guestList={guestList} checkedIn={checkedIn} />

      {/* Attendance Stats */}
      <div className="stats">
        <p>
          Checked In: {checkedCount} / {guestList.length} ({percentage}%)
        </p>
      </div>

      {/* Guest List */}
      <ul className="guest-list">
        {guestList.map((guest, index) => (
          <li
            key={index}
            className={checkedIn[guest.Name] ? "checked-in" : "not-checked"}
            onClick={() => toggleCheckIn(guest.Name)}
          >
            {guest.Name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
