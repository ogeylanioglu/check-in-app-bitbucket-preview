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
    const eventForGuest = ensureActiveEvent();
    const fullName = prompt("Enter guest's full name:");
    if (!fullName || !fullName.trim()) return;

    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ");
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

  const clearData = () => {
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
    </div>
  );
}

export default App;
