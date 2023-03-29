import React, { useEffect, useState } from "react";
import "../../assets/styles.css";
import { GetFromLocalStorage } from "../../services/LocalStorageService";
import TagCanvas from "../animations/TagCanvas";
import Features from "./Features";
import Footer from "./Footer";
import Header from "./Header";
import Navbar from "./Navbar";

const Homepage = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (GetFromLocalStorage("token")) {
      setIsAuthenticated(true)
    }
  }, [])
  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated}></Navbar>

      <Header></Header>

      <aside className="text-center bg-gradient-primary-to-secondary">
        <div className="container px-5">
          <div className="row gx-5 justify-content-center">
            <div className="col-xl-8">
              <div className="h2 fs-1 text-white mb-4">
                "An intuitive solution to a common problem that we all face,
                wrapped up in a single app!"
              </div>
            </div>
          </div>
        </div>
      </aside>

      <Features></Features>

      <section className="bg-light">
        <div className="container px-5">
          <div className="row gx-5 align-items-center justify-content-center justify-content-lg-between">
            <div className="col-12 col-lg-6">
              <h2 className="display-4 lh-1 mb-4">
                Enter a new age of web design
              </h2>
              <p className="lead fw-normal text-muted mb-5 mb-lg-0">
                This section is perfect for featuring some information about
                your application, why it was built, the problem it solves, or
                anything else! There's plenty of space for text here, so don't
                worry about writing too much.
              </p>
            </div>
            <div className="col-sm-8 col-md-6 col-lg-6">
              <div className="px-5 px-sm-0">
                <TagCanvas></TagCanvas>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <div className="container px-5">
            <h2 className="text-white display-1 lh-1 mb-4">
              Stop waiting.
              <br />
              Start building.
            </h2>
            <a
              className="btn btn-outline-light py-3 px-4 rounded-pill"
              href="https://startbootstrap.com/theme/new-age"
              target="_blank"
            >
              Download for free
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gradient-primary-to-secondary" id="download">
        <div className="container px-5">
          <h2 className="text-center text-white font-alt mb-4">
            Get the app now!
          </h2>
          <div className="d-flex flex-column flex-lg-row align-items-center justify-content-center">
            <a className="me-lg-3 mb-4 mb-lg-0" href="#!">
              <img
                className="app-badge"
                src="google-play-badge.svg"
                alt="..."
              />
            </a>
            <a href="#!">
              <img className="app-badge" src="app-store-badge.svg" alt="..." />
            </a>
          </div>
        </div>
      </section>

      <Footer></Footer>
    </div>
  );
};

export default Homepage;