import React from "react";
import logo from "../assets/C_logo.png";

const Header = () => (
  <header className="hero">
    <img src={logo} alt="Convene Logo" className="logo" />
    <h1>Convene Check-In</h1>
    <p className="subtitle">
      A seamless, modern experience built for every Convene location.
    </p>
  </header>
);

export default Header;
