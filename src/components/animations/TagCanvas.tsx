import React from "react";
import "../../assets/tagcanvas";
import { useEffect } from "react";

declare const window: any;

const skills = [
  { href: "#git_", title: "Git" },
  { href: "#json_", title: "JSON" },
  { href: "#solidity_", title: "Solidity" },
  { href: "#html_", title: "HTML" },
  { href: "#react_", title: "React" },
  { href: "#python_", title: "Python" },
  { href: "#sql_", title: "SQL" },
  { href: "#shopify_", title: "Shopify" },
  { href: "#aws_", title: "AWS" },
  { href: "#wordpress_", title: "WordPress" },
  { href: "#npm_", title: "npm" },
  { href: "#css_", title: "CSS" },
  { href: "#jquery_", title: "jQuery" },
  { href: "#js_", title: "JavaScript" },
  { href: "#c++_", title: "C++" },
  { href: "#java_", title: "Java" },
  { href: "#php_", title: "PHP" },
  { href: "#selenium_", title: "Selenium" },
  { href: "#remix_", title: "Remix" },
  { href: "#ganache_", title: "Ganache" },
  { href: "#hubspot_", title: "HubSpot" },
  { href: "#node.js_", title: "Node.js" },
  { href: "#hiveos_", title: "HiveOS" },
  { href: "#crypto_", title: "Crypto" },
  { href: "#mining_", title: "Mining" },
  { href: "#photoshop_", title: "Photoshop" },
  { href: "#illustrator_", title: "Illustrator" },
  { href: "#premier-pro_", title: "Premier Pro" },
  { href: "#truffle_", title: "Truffle" },
  { href: "#pyqt_", title: "PyQT" },
  { href: "#hardhat_", title: "Hardhat" },
];

const TagCanvas = () => {
  useEffect(() => {
    const TagCanvas = window.TagCanvas;
    const tagCanvasOptions = {
      textColour: "black",
      outlineThickness: 0.5,
      outlineColour: "black",
      maxSpeed: 0.06,
      freezeActive: true,
      shuffleTags: true,
      shape: "sphere",
      zoom: 0.8,
      wheelZoom: false,
      noSelect: true,
      textFont: null,
      freezeDecel: true,
      fadeIn: 3000,
      initial: [0.3, -0.1],
      depth: 1.1,
    };
    try {
      TagCanvas.Start("tagcanvas", "taglist", tagCanvasOptions);
    } catch (e) {
      console.log("Canvas error.");
      console.log(e);
    }
  }, []);

  return (
    <div className="container">
      <canvas
        id="tagcanvas"
        width="820"
        height="600"
        style={{
          maxWidth: "1000px",
          width: "100%",
          zIndex: "99",
          position: "relative",
          margin: "0 auto",
        }}
        className="to-fade-in fast-anim"
      ></canvas>
      <div id="taglist" style={{ display: "none" }}>
        <ul>
          {skills.map((skill) => (
            <li key={skill.title}>
              <a href={skill.href}>{skill.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TagCanvas;
