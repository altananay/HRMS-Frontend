import React from "react";

const Header = () => {
  return (
    <header className="masthead">
      <div className="container px-5">
        <div className="row gx-5 align-items-center">
          <div className="col-lg-6">
            <div className="mb-5 mb-lg-0 text-center text-lg-start">
              <h1 className="display-1 lh-1 mb-3">
                Showcase your app beautifully.
              </h1>
              <p className="lead fw-normal text-muted mb-5">
                Launch your mobile app landing page faster with this free, open
                source theme from Start Bootstrap!
              </p>
              <div className="d-flex flex-column flex-lg-row align-items-center"></div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="masthead-device-mockup">
              <svg
                className="circle"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="circleGradient"
                    gradientTransform="rotate(45)"
                  >
                    <stop className="gradient-start-color" offset="0%"></stop>
                    <stop className="gradient-end-color" offset="100%"></stop>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <div className="device-wrapper">
                <div
                  className="device"
                  data-device="iPhoneX"
                  data-orientation="portrait"
                  data-color="black"
                >
                  <div className="screen bg-black"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
