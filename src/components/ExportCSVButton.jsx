import React, { useRef } from "react";
import Papa from "papaparse";

const ExportCSVButton = ({ guestList, checkedIn, eventName }) => {
  const linkRef = useRef(null);

const getExportFileName = () => {
    const sanitizedEventName =
      typeof eventName === "string"
        ? eventName.replace(/[\\/:*?"<>|]/g, "").trim()
        : "";

    if (!sanitizedEventName) {
      return "Check-In Results.csv";
    }

    return `${sanitizedEventName} – Check-In Results.csv`;
  };
  
  const handleExport = () => {
   const dataToExport = guestList.map((guest) => {
      const nameKey = `${guest.firstName} ${guest.lastName}`;
      return {
        firstName: guest.firstName,
        lastName: guest.lastName,
        Company: guest.company || "",
        email: guest.email || guest.Email || "",
        CheckedIn: checkedIn[nameKey] ? "Yes" : "No",
        RegistrationType: guest.registrationType || "Pre-Registered",
      };
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    if (linkRef.current) {
      linkRef.current.href = url;
      linkRef.current.download = getExportFileName();
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
