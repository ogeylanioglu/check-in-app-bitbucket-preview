import React, { useRef } from "react";
import Papa from "papaparse";

const ExportCSVButton = ({ guestList, checkedIn }) => {
  const linkRef = useRef(null);

  const handleExport = () => {
    const dataToExport = guestList.map((guest) => ({
      Name: guest.Name,
      CheckedIn: checkedIn[guest.Name] ? "Yes" : "No",
      RegistrationType: guest.registrationType || "Pre-Registered",
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    if (linkRef.current) {
      linkRef.current.href = url;
      linkRef.current.download = "checkin_results.csv";
      linkRef.current.click();
    }
  };

  return (
    <>
      <button onClick={handleExport} className="export-btn">
        Export CSV
      </button>
      {/* Hidden anchor tag managed by React instead of document.createElement */}
      <a ref={linkRef} style={{ display: "none" }}>
        hidden link
      </a>
    </>
  );
};

export default ExportCSVButton;
