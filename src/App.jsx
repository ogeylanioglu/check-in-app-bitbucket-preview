import ExportCSVButton from "./components/ExportCSVButton";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import logo from "./assets/C_logo.png";
import Header from "./components/Header";
import Stats from "./components/Stats";
import Controls from "./components/Controls";
import GuestCard from "./components/GuestCard";


function App() {
  const [guestList, setGuestList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkedIn, setCheckedIn] = useState({});
  const [sortAsc, setSortAsc] = useState(true);
  const [showManualOnly, setShowManualOnly] = useState(false);

  const addManualGuest = () => {
    const fullName = prompt("Enter guest's full name:");
    if (!fullName || !fullName.trim()) return;

    const name = fullName.trim();
    const email = name.toLowerCase().replace(/ /g, ".") + "@manual.com";

    const newGuest = { 
  Name: name, 
  Email: email, 
  registrationType: "On-Site" 
};
    const updatedList = [...guestList, newGuest];
    setGuestList(updatedList);
    localStorage.setItem("guestList", JSON.stringify(updatedList));
  };

 useEffect(() => {
  const savedList = localStorage.getItem("guestList");
  const savedCheckIns = localStorage.getItem("checkedIn");

  if (savedList) {
    let parsedList = JSON.parse(savedList);

    // Migration: add registrationType if missing
    parsedList = parsedList.map(guest => ({
      ...guest,
      registrationType: guest.registrationType || "Pre-Registered"
    }));

    setGuestList(parsedList);
    localStorage.setItem("guestList", JSON.stringify(parsedList)); // save back the updated list
  }

  if (savedCheckIns) setCheckedIn(JSON.parse(savedCheckIns));
}, []);

  useEffect(() => {
    localStorage.setItem("guestList", JSON.stringify(guestList));
  }, [guestList]);

  useEffect(() => {
    localStorage.setItem("checkedIn", JSON.stringify(checkedIn));
  }, [checkedIn]);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data
  .map(row => ({
    Name: row.Name?.trim(),
    registrationType: "Pre-Registered"
  }))
  .filter(row => row.Name);
        setGuestList(cleaned);
        setCheckedIn({});
        localStorage.setItem("guestList", JSON.stringify(cleaned));
        localStorage.setItem("checkedIn", JSON.stringify({}));
      },
    });
  };

  const toggleCheckIn = (name) => {
    const updated = { ...checkedIn, [name]: !checkedIn[name] };
    setCheckedIn(updated);
    localStorage.setItem("checkedIn", JSON.stringify(updated));
  };

const removeManualGuest = (name) => {
  // Remove from guestList (only if it's an On-Site record)
  setGuestList(prev => {
    const updated = prev.filter(
      g => !(g.Name === name && g.registrationType === "On-Site")
    );
    localStorage.setItem("guestList", JSON.stringify(updated));
    return updated;
  });

  // Clean up the checkedIn state for that name
  setCheckedIn(prev => {
    if (name in prev) {
      const { [name]: _omit, ...rest } = prev;
      localStorage.setItem("checkedIn", JSON.stringify(rest));
      return rest;
    }
    return prev;
  });
};

  const clearData = () => {
    setGuestList([]);
    setCheckedIn({});
    localStorage.removeItem("guestList");
    localStorage.removeItem("checkedIn");
  };

  const filteredGuests = guestList
    .filter((guest) => {
      const matchesSearch = guest.Name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesManual = !showManualOnly || guest.registrationType === "On-Site";
      return matchesSearch && matchesManual;
    })
    .sort((a, b) =>
      sortAsc ? a.Name.localeCompare(b.Name) : b.Name.localeCompare(a.Name)
    );

  const total = guestList.length;
  const checked = Object.values(checkedIn).filter(Boolean).length;
  const percentage = total > 0 ? ((checked / total) * 100).toFixed(1) : 0;

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
  guestList={guestList}
  checkedIn={checkedIn}
/>

       <Stats checked={checked} total={total} percentage={percentage} />

<div className="guest-grid">
  {filteredGuests.map((guest, idx) => (
    <GuestCard
      key={idx}
      guest={guest}
      checkedIn={checkedIn}
      toggleCheckIn={toggleCheckIn}
      onRemoveManual={removeManualGuest}
    />
  ))}
</div>

      
      <div className="fab" onClick={addManualGuest}>+</div>
    </div>
  );
}

export default App;
