import React from "react";

const Features = () => {
  return (
    <div>
      <section id="features">
        <div className="container px-5">
          <div className="row gx-5 align-items-center">
            <div className="col-lg-8 order-lg-1 mb-5 mb-lg-0">
              <div className="container-fluid px-5">
                <div className="row gx-5">
                  <div className="col-md-6 mb-5">
                    <div className="text-center">
                      <i className="bi-phone icon-feature text-gradient d-block mb-3"></i>
                      <h3 className="font-alt">Device Mockups</h3>
                      <p className="text-muted mb-0">
                        Ready to use HTML/CSS device mockups, no Photoshop
                        required!
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 mb-5">
                    <div className="text-center">
                      <i className="bi-camera icon-feature text-gradient d-block mb-3"></i>
                      <h3 className="font-alt">Flexible Use</h3>
                      <p className="text-muted mb-0">
                        Put an image, video, animation, or anything else in the
                        screen!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-5 mb-md-0">
                    <div className="text-center">
                      <i className="bi-gift icon-feature text-gradient d-block mb-3"></i>
                      <h3 className="font-alt">Free to Use</h3>
                      <p className="text-muted mb-0">
                        As always, this theme is free to download and use for
                        any purpose!
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-center">
                      <i className="bi-patch-check icon-feature text-gradient d-block mb-3"></i>
                      <h3 className="font-alt">Open Source</h3>
                      <p className="text-muted mb-0">
                        Since this theme is MIT licensed, you can use it
                        commercially!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 order-lg-0">
              <div className="features-device-mockup">
                <div className="device-wrapper">
                  <div
                    className="device"
                    data-device="iPhoneX"
                    data-orientation="portrait"
                    data-color="black"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;