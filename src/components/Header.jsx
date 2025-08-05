import React from "react";
import logo from "../assets/C_logo.png";

const Header = () => (
  <header className="hero">
    <img src={logo} alt="Convene Logo" className="logo" />
    <h1>Elevate Your Check-In Process</h1>
    <p className="subtitle">
      A seamless, modern experience built for every Convene location.
    </p>
  </header>
);

export default Header;
