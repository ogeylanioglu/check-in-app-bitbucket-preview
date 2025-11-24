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
  checkedIn,
  addManualGuest,
  events,
  activeEventId,
  setActiveEventId,
  onRequestDeleteEvent,
}) => {
  const selectedEvent = events.find((event) => event.id === activeEventId) || null;

  const handleDeleteEvent = () => {
    if (!activeEventId || !selectedEvent) return;

    onRequestDeleteEvent?.(selectedEvent);
  };

  return (
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
        <button className="add-guest-btn" onClick={addManualGuest}>
          + Add guest
        </button>
        <div className="event-select-wrapper">
          <select
            className={`event-select${activeEventId ? " event-select--active" : ""}`}
            value={activeEventId || ""}
            onChange={(e) => setActiveEventId(e.target.value || null)}
          >
            <option value="">Select Event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-row">
        <div className="search-row__input">
          <input
            id="guestSearch"
            type="text"
            placeholder="Search by Full Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button type="button" onClick={() => setSearchTerm("")}>
          Clear
        </button>
      </div>

      <div className="control-actions">
        <button type="button" onClick={() => setSortAsc((prev) => !prev)}>
          Sort {sortAsc ? "↓ Z-A" : "↑ A-Z"}
        </button>
        <button type="button" onClick={() => setShowManualOnly((prev) => !prev)}>
          {showManualOnly ? "Show All" : "On-Site Registrations"}
        </button>
        <ExportCSVButton guestList={guestList} checkedIn={checkedIn} />
        <button
          type="button"
          className="delete-event-btn btn--danger"
          onClick={handleDeleteEvent}
          disabled={!activeEventId}
        >
          Delete Selected Event
        </button>
        <button type="button" className="btn--danger" onClick={clearData}>
          Delete All Data
        </button>
      </div>
    </div>
  );
};

export default Controls;
