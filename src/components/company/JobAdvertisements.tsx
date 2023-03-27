import Navbar from "../public/Navbar";
import Sidebar from "./layouts/Sidebar";
import "../../assets/style.scss";
import { useEffect, useState } from "react";
import { JobAdvertisement } from "../../contracts/JobAdvertisement";
import {
  getAllJobAdvertisement,
  getAllJobAdvertisementsByStatus,
} from "../../services/JobAdvertisementService";
import { bool } from "yup";
import { Link } from "react-router-dom";

const JobAdvertisements = () => {
  const [jobAdvertisements, setJobAdvertisemets] =
    useState<JobAdvertisement[]>();

  useEffect(() => {
    getJobAdvertisements();
  }, []);

  const getJobAdvertisements = async () => {
    await getAllJobAdvertisement()
      .then((response) => {
        setJobAdvertisemets(response.data.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getJobAdvertisementsByStatus = async (status: string) => {
    await getAllJobAdvertisementsByStatus(status)
      .then((response) => {
        setJobAdvertisemets(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <body className="g-sidenav-show">
        <Sidebar></Sidebar>

        <main className="main-content position-relative border-radius-lg">
          <div className="container-fluid py-4">
            <div className="row">
              <div className="col">
                <button
                  className="btn btn-primary"
                  style={{ marginRight: "20px" }}
                  onClick={() => getJobAdvertisements()}
                >
                  Hepsi
                </button>
                <button
                  className="btn btn-success"
                  style={{ marginRight: "20px" }}
                  onClick={() => getJobAdvertisementsByStatus("true")}
                >
                  Aktif
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => getJobAdvertisementsByStatus("false")}
                >
                  Pasif
                </button>
              </div>
            </div>
            <div className="row">
              {jobAdvertisements?.map((item, index) => {
                return (
                  <>
                    <div className="col-sm-4" style={{ marginTop: "60px" }}>
                      <div className="job-card">
                        <div className="job-card__content">
                          <div className="job-card_info">
                            <h6 className="text-muted">
                              <a href="#!" className="job-card_company">
                                {item.companyName}
                              </a>
                              <a href="#!" className="float-right">
                                <i className="fa fa-heart-o"></i>
                              </a>
                            </h6>
                            <h4>{item.title}</h4>
                            <p className="mb-0">
                              {item.minSalary + "-" + item.maxSalary}
                            </p>
                          </div>
                        </div>
                        <div className="job-card__footer">
                          <div className="job-card_job-type">
                            {item.skills.map((item, index) => {
                              return (
                                <>
                                  <span className="job-label">{item}</span>
                                </>
                              );
                            })}
                          </div>
                          <Link to="/company/updatejobadvertisement" state={{updateValue: item}}>
                            <button className="btn btn-primary">
                              Güncelle
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </main>
      </body>
    </>
  );
};

export default JobAdvertisements;
