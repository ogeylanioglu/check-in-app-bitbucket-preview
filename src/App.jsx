import React, { useState, useEffect, useId } from "react";
import Papa from "papaparse";
import { buildHeaderMapping, normalizeRow } from "./utils/csvNormalization";
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
  const [manualGuestData, setManualGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [eventPendingDeletion, setEventPendingDeletion] = useState(null);
  const deleteModalTitleId = useId();
  const deleteModalDescriptionId = useId();
  const resetModalTitleId = useId();
  const resetModalDescriptionId = useId();

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
    setManualGuestData({ firstName: "", lastName: "", email: "" });
    setManualGuestModalOpen(true);
  };

  const closeManualGuestModal = () => {
    setManualGuestModalOpen(false);
    setManualGuestData({ firstName: "", lastName: "", email: "" });
  };

  const handleManualGuestSubmit = () => {
    const firstName = manualGuestData.firstName.trim();
    const lastName = manualGuestData.lastName.trim();
    const email = manualGuestData.email.trim();

    if (!firstName || !lastName) return;

    const eventForGuest = ensureActiveEvent();
 
    const newGuest = {
      firstName,
      lastName,
      email,
      company: "",
      isCheckedIn: false,
      onSiteRegistration: true,
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

  const handleManualGuestInputChange = (field, value) => {
    setManualGuestData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isManualGuestFormValid =
    manualGuestData.firstName.trim() && manualGuestData.lastName.trim();
  
  const handleManualGuestKeyDown = (event) => {
     if (event.key === "Enter" && isManualGuestFormValid) {
      event.preventDefault();
      handleManualGuestSubmit();
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
        const headers = results.meta?.fields || [];
        const headerMapping = buildHeaderMapping(headers);

        const normalizedGuests = results.data
          .map((row) => normalizeRow(row, headerMapping))
          .filter((guest) => guest.firstName && guest.lastName);

        const cleaned = normalizedGuests.map((guest) => {
          const { checkedIn, ...rest } = guest;
          return {
            ...rest,
            registrationType: "Pre-Registered",
          };
        });

        const initialCheckedIn = normalizedGuests.reduce((acc, guest) => {
          if (!guest.checkedIn) return acc;
          const nameKey = `${guest.firstName} ${guest.lastName}`.trim();
          if (nameKey) {
            acc[nameKey] = true;
          }
          return acc;
        }, {});

        const defaultName = file.name?.replace(/\.csv$/i, "") || "New Event";
        const eventName = prompt("Enter a name for this event", defaultName) || defaultName;
        const newEvent = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: eventName,
          guests: cleaned,
          checkedIn: initialCheckedIn,
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

  const requestDeleteEvent = (event) => {
    if (!event) return;

    setEventPendingDeletion(event);
  };

  const cancelDeleteEvent = () => {
    setEventPendingDeletion(null);
  };

  const confirmDeleteEvent = () => {
    if (!eventPendingDeletion) return;

    removeEvent(eventPendingDeletion.id);
    setEventPendingDeletion(null);
  };

  const resetAllData = () => {  
    setEvents([]);
    setActiveEventId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("guestList");
    localStorage.removeItem("checkedIn");
  };

 const clearData = () => {
    setShowResetModal(true);
  };

  const cancelResetAllData = () => {
    setShowResetModal(false);
  };

  const confirmResetAllData = () => {
    resetAllData();
    setShowResetModal(false);
  };

  useEffect(() => {
    if (!showResetModal && !eventPendingDeletion) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (eventPendingDeletion) {
          setEventPendingDeletion(null);
        } else {
          setShowResetModal(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [eventPendingDeletion, showResetModal]);

  useEffect(() => {
    const payload = {
      events,
      activeEventId,
    };

    if (events.length === 0 && !activeEventId) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    
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
        onRequestDeleteEvent={requestDeleteEvent}
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
              <h2 id="manual-guest-modal-title">Add a new guest</h2>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label className="modal__label" htmlFor="manual-guest-first-name">
                  First Name
                </label>
                <input
                  id="manual-guest-first-name"
                  type="text"
                  value={manualGuestData.firstName}
                  onChange={(event) =>
                    handleManualGuestInputChange("firstName", event.target.value)
                  }
                  onKeyDown={handleManualGuestKeyDown}
                  autoFocus
                />
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="manual-guest-last-name">
                  Last Name
                </label>
                <input
                  id="manual-guest-last-name"
                  type="text"
                  value={manualGuestData.lastName}
                  onChange={(event) =>
                    handleManualGuestInputChange("lastName", event.target.value)
                  }
                  onKeyDown={handleManualGuestKeyDown}
                />
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="manual-guest-email">
                  Email (optional)
                </label>
                <input
                  id="manual-guest-email"
                  type="email"
                  value={manualGuestData.email}
                  onChange={(event) =>
                    handleManualGuestInputChange("email", event.target.value)
                  }
                  onKeyDown={handleManualGuestKeyDown}
                />
              </div>
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
                onClick={handleManualGuestSubmit}
                disabled={!isManualGuestFormValid}
              >
                Add to List
              </button>
            </div>
          </div>
        </div>
      )}

      {eventPendingDeletion && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              cancelDeleteEvent();
            }
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={deleteModalTitleId}
            aria-describedby={deleteModalDescriptionId}
          >
            <div className="modal__header">
              <h2 id={deleteModalTitleId}>
                Delete "{eventPendingDeletion?.name || "this event"}"?
              </h2>
            </div>
            <div className="modal__body">
              <div id={deleteModalDescriptionId} className="modal__description">
                <p>
                  This will remove the guest list and check-in history for this
                  event. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={cancelDeleteEvent}
              >
                Nevermind, take me back
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={confirmDeleteEvent}
              >
                Yes, delete this event
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              cancelResetAllData();
            }
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={resetModalTitleId}
            aria-describedby={resetModalDescriptionId}
          >
            <div className="modal__header">
              <h2 id={resetModalTitleId}>Are you sure you want to reset all?</h2>
            </div>
            <div className="modal__body">
              <div id={resetModalDescriptionId} className="modal__description">
                <p>
                  This will remove the spreadsheet and all data for everyone
                  you’ve checked in so far.
                </p>
              </div>
            </div>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={cancelResetAllData}
              >
                Nevermind, take me back
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={confirmResetAllData}
              >
                Yes, I want to remove the spreadsheet &amp; start over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
