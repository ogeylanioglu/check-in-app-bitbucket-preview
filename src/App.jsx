import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Header from "./components/Header";
import Stats from "./components/Stats";
import Controls from "./components/Controls";
import GuestCard from "./components/GuestCard";

const STORAGE_KEY = "eventsData";

function App() {
  const [events, setEvents] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [showManualOnly, setShowManualOnly] = useState(false);
  const [isManualGuestModalOpen, setManualGuestModalOpen] = useState(false);
  const [manualGuestStep, setManualGuestStep] = useState("first");
  const [manualGuestData, setManualGuestData] = useState({
    firstName: "",
    lastName: "",
  });

  const activeEvent = events.find((event) => event.id === activeEventId) || null;

  const ensureActiveEvent = () => {
    if (activeEvent) return activeEvent;

    if (events.length > 0) {
      const firstEvent = events[0];
      setActiveEventId(firstEvent.id);
      return firstEvent;
    }

    const fallbackEvent = {
      id: `${Date.now()}`,
      name: "Untitled Event",
      guests: [],
      checkedIn: {},
    };

   setEvents((prev) => {
      const nextEvents = [...prev, fallbackEvent];
      setActiveEventId(fallbackEvent.id);
      return nextEvents;
    });

   return fallbackEvent;
  };

  const migrateLegacyData = (savedList, savedCheckIns) => {
    if (!savedList && !savedCheckIns) return null;

let parsedList = [];
    if (savedList) {
      parsedList = JSON.parse(savedList);
      parsedList = parsedList.map((guest) => {
        const firstName = guest.firstName || guest.Name?.split(" ")[0] || "";
        const lastName =
          guest.lastName || guest.Name?.split(" ").slice(1).join(" ") || "";
        const { Name, ...rest } = guest;
        return {
          ...rest,
          firstName,
          lastName,
          registrationType: guest.registrationType || "Pre-Registered",
        };
      });
    }

       const parsedCheckIns = savedCheckIns ? JSON.parse(savedCheckIns) : {};

    const migratedEvent = {
      id: `${Date.now()}`,
      name: "Imported Event",
      guests: parsedList,
      checkedIn: parsedCheckIns,
    };

    localStorage.removeItem("guestList");
    localStorage.removeItem("checkedIn");

    return migratedEvent;
  };

  const addManualGuest = () => {
    ensureActiveEvent();
    setManualGuestData({ firstName: "", lastName: "" });
    setManualGuestStep("first");
    setManualGuestModalOpen(true);
  };

  const closeManualGuestModal = () => {
    setManualGuestModalOpen(false);
    setManualGuestStep("first");
    setManualGuestData({ firstName: "", lastName: "" });
  };

  const handleManualGuestNext = () => {
    if (!manualGuestData.firstName.trim()) return;
    setManualGuestData((prev) => ({
      ...prev,
      firstName: prev.firstName.trim(),
    }));
    setManualGuestStep("last");
  };

  const handleManualGuestSubmit = () => {
    const firstName = manualGuestData.firstName.trim();
    const lastName = manualGuestData.lastName.trim();

    if (!firstName || !lastName) return;

    const eventForGuest = ensureActiveEvent();

    const emailName = `${firstName}${lastName ? "." + lastName : ""}`
      .toLowerCase()
      .replace(/\s+/g, "");
    const email = `${emailName}@manual.com`;

    const newGuest = {
      firstName,
      lastName,
      Email: email,
      registrationType: "On-Site",
    };

      setEvents((prevEvents) => {
      const nextEvents = prevEvents.map((event) => {
        if (event.id !== eventForGuest.id) return event;
        return {
          ...event,
          guests: [...event.guests, newGuest],
        };
      });

      return nextEvents;
    });

    closeManualGuestModal();
  };

  const isManualGuestFirstStep = manualGuestStep === "first";
  const manualGuestInputLabel = isManualGuestFirstStep
    ? "Enter the guest's first name"
    : "Enter the guest's last name";
  const manualGuestInputValue = isManualGuestFirstStep
    ? manualGuestData.firstName
    : manualGuestData.lastName;
  const manualGuestPrimaryLabel = isManualGuestFirstStep
    ? "Next"
    : "Check in guest";
  const manualGuestPrimaryAction = isManualGuestFirstStep
    ? handleManualGuestNext
    : handleManualGuestSubmit;
  const isManualGuestPrimaryDisabled = !manualGuestInputValue.trim();

  const handleManualGuestInputChange = (value) => {
    setManualGuestData((prev) =>
      isManualGuestFirstStep
        ? { ...prev, firstName: value }
        : { ...prev, lastName: value }
    );
  };

  const handleManualGuestKeyDown = (event) => {
    if (event.key === "Enter" && !isManualGuestPrimaryDisabled) {
      event.preventDefault();
      manualGuestPrimaryAction();
    }
  };

    useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        if (Array.isArray(parsed.events)) {
          setEvents(parsed.events);
          setActiveEventId(parsed.activeEventId || parsed.events[0]?.id || null);
          return;
        }
      } catch (error) {
        console.error("Failed to parse events data", error);
      }
  }

    const legacyGuestList = localStorage.getItem("guestList");
    const legacyCheckIns = localStorage.getItem("checkedIn");
    const migratedEvent = migrateLegacyData(legacyGuestList, legacyCheckIns);
    if (migratedEvent) {
      setEvents([migratedEvent]);
      setActiveEventId(migratedEvent.id);
    }
  }, []);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data
          .map((row) => ({
            firstName: row.firstName?.trim(),
            lastName: row.lastName?.trim(),
            registrationType: "Pre-Registered",
          }))
          .filter((row) => row.firstName && row.lastName);

        const defaultName = file.name?.replace(/\.csv$/i, "") || "New Event";
        const eventName = prompt("Enter a name for this event", defaultName) || defaultName;
        const newEvent = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: eventName,
          guests: cleaned,
          checkedIn: {},
        };

        setEvents((prevEvents) => [...prevEvents, newEvent]);
        setActiveEventId(newEvent.id);
        e.target.value = "";
      },
    });
  };

  const toggleCheckIn = (nameKey) => {
    if (!activeEventId) return;

    setEvents((prevEvents) => {
      return prevEvents.map((event) => {
        if (event.id !== activeEventId) return event;
        const updatedCheckedIn = {
          ...event.checkedIn,
          [nameKey]: !event.checkedIn[nameKey],
        };
        return {
          ...event,
          checkedIn: updatedCheckedIn,
        };
      });
    });
  };

    const removeManualGuest = (nameKey) => {
    if (!activeEventId) return;

    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id !== activeEventId) return event;

        const guests = event.guests.filter((guest) => {
          const guestKey = `${guest.firstName} ${guest.lastName}`;
          return !(guestKey === nameKey && guest.registrationType === "On-Site");
        });

        if (!(nameKey in event.checkedIn)) {
          return {
            ...event,
            guests,
          };
        }

        const { [nameKey]: _omit, ...restCheckedIn } = event.checkedIn;

        return {
          ...event,
          guests,
          checkedIn: restCheckedIn,
        };
      })
    );
  };

  const removeEvent = (eventId) => {
    if (!eventId) return;

    setEvents((prevEvents) => {
      const filteredEvents = prevEvents.filter((event) => event.id !== eventId);

      setActiveEventId((currentId) => {
        if (filteredEvents.length === 0) {
          return null;
        }

        if (currentId === eventId) {
          return filteredEvents[0].id;
        }

        const stillExists = filteredEvents.some((event) => event.id === currentId);
        if (!currentId || !stillExists) {
          return filteredEvents[0].id;
        }

        return currentId;
      });

      return filteredEvents;
    });
  };

  const clearData = () => {
    const shouldClear = window.confirm(
      "Are you sure you want to clear all events and check-in data?"
    );
    if (!shouldClear) {
      return;
    }
    
    setEvents([]);
    setActiveEventId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("guestList");
    localStorage.removeItem("checkedIn");
  };

 useEffect(() => {
    const payload = {
      events,
      activeEventId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [events, activeEventId]);

 const filteredGuests = (activeEvent?.guests || [])
    .filter((guest) => {
      const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesManual =
        !showManualOnly || guest.registrationType === "On-Site";
      return matchesSearch && matchesManual;
    })
    .sort((a, b) => {
      const fullNameA = `${a.firstName} ${a.lastName}`;
      const fullNameB = `${b.firstName} ${b.lastName}`;
      return sortAsc
        ? fullNameA.localeCompare(fullNameB)
        : fullNameB.localeCompare(fullNameA);
    });

  const total = activeEvent?.guests.length || 0;
  const checked = activeEvent
    ? Object.values(activeEvent.checkedIn).filter(Boolean).length
    : 0;
  const percentage = total > 0 ? ((checked / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="wrapper">
      <Header />

 <Controls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortAsc={sortAsc}
        setSortAsc={setSortAsc}
        showManualOnly={showManualOnly}
        setShowManualOnly={setShowManualOnly}
        handleCSVUpload={handleCSVUpload}
        clearData={clearData}
        guestList={activeEvent?.guests || []}
        checkedIn={activeEvent?.checkedIn || {}}
        addManualGuest={addManualGuest}
        events={events}
        activeEventId={activeEventId}
        setActiveEventId={setActiveEventId}
        removeEvent={removeEvent}
      />

      <Stats checked={checked} total={total} percentage={percentage} />

      <div className="guest-grid">
        {filteredGuests.map((guest, idx) => (
          <GuestCard
            key={`${guest.firstName}-${guest.lastName}-${idx}`}
            guest={guest}
            checkedIn={activeEvent?.checkedIn || {}}
            toggleCheckIn={toggleCheckIn}
            onRemoveManual={removeManualGuest}
          />
        ))}
      </div>

      {isManualGuestModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-guest-modal-title"
          >
            <div className="modal__header">
              <h2 id="manual-guest-modal-title">Check in a new user</h2>
            </div>
            <div className="modal__body">
              <label className="modal__label" htmlFor="manual-guest-input">
                {manualGuestInputLabel}
              </label>
              <input
                id="manual-guest-input"
                type="text"
                value={manualGuestInputValue}
                onChange={(event) => handleManualGuestInputChange(event.target.value)}
                onKeyDown={handleManualGuestKeyDown}
                autoFocus
              />
            </div>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={closeManualGuestModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={manualGuestPrimaryAction}
                disabled={isManualGuestPrimaryDisabled}
              >
                {manualGuestPrimaryLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
