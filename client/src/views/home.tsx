import React from "react";
import "./styles/home.css";
import transparentLogo from '../transparentLogo.png'

const Home = () => {
  return (
    <div className="home">
      <div className="home__container">
        <img src={transparentLogo} alt="logo" className="home__logo" />
        <h2 className="home__subtitle">Welcome to</h2>
        <h1 className="home__title">Cause Connect</h1>
        <p className="home__description">Where service meets passion</p>
      </div>

    </div>
  );
}
export default Home;