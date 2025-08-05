import React from "react";
import ExportCSVButton from "./ExportCSVButton";

const Controls = ({
  searchTerm,
  setSearchTerm,
  sortAsc,
  setSortAsc,
  showManualOnly,
  setShowManualOnly,
  handleCSVUpload,
  clearData,
  guestList,
  checkedIn
}) => (
  <div className="controls">
    <div className="upload-wrapper">
      <label htmlFor="csvUpload" className="upload-label">
        Upload Guest List (.csv)
      </label>
      <input
        type="file"
        id="csvUpload"
        className="hidden-input"
        accept=".csv"
        onChange={handleCSVUpload}
      />
    </div>

    <div className="search-row">
      <input
        type="text"
        placeholder="Search by full name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={() => setSearchTerm("")}>Clear</button>
      <button onClick={clearData}>Reset All</button>
      <button onClick={() => setSortAsc((prev) => !prev)}>
        Sort {sortAsc ? "↓ Z-A" : "↑ A-Z"}
      </button>
      <button onClick={() => setShowManualOnly((prev) => !prev)}>
        {showManualOnly ? "Show All" : "On-Site Registrations"}
      </button>
      <ExportCSVButton guestList={guestList} checkedIn={checkedIn} />
    </div>
  </div>
);

export default Controls;
