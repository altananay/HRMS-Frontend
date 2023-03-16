import { useEffect, useState } from "react";
import { getByJobSeekerId } from "../../services/JobSeekerService";
import { Cv } from "../../contracts/Cv";
import "../../assets/argon-dashboard.css";
import Navbar from "../public/Navbar";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  {
    field: "projectName",
    headerName: "Proje Adı",
    width: 250,
    editable: true,
  },
  {
    field: "description",
    headerName: "Açıklama",
    width: 500,
    editable: true,
  },
];

const jobExperiencesColumns: GridColDef[] = [
  {
    field: "companyName",
    headerName: "Şirket Adı",
    width: 150,
    editable: true,
  },
  {
    field: "department",
    headerName: "Departman",
    width: 150,
    editable: true,
  },
  {
    field: "position",
    headerName: "Pozisyon",
    width: 150,
    editable: true,
  },
  {
    field: "years",
    headerName: "Yıl",
    width: 150,
    editable: true,
  },
  {
    field: "leaveWorkYear",
    headerName: "Ayrılma Yılı",
    width: 150,
    editable: true,
  },
  {
    field: "description",
    headerName: "Açıklama",
    width: 150,
    editable: true,
  },
];


const Profile = () => {
  const [cv, setCv] = useState<Cv>();
  
  let dateOfBirth;

  useEffect(() => {
    //todo: loading koy
    const getCv = async () => {
      await getByJobSeekerId("640736b0de63636c38a70f43").then((response) => {
        setCv(response.data.data);
      });
    //todo: loading gizle.
    };

    const parseDate = async () => {
      dateOfBirth = cv?.dateOfBirth?.split("-")
      dateOfBirth[2] = dateOfBirth[2][0] + dateOfBirth[2][1]
      console.log(dateOfBirth);
    }
    getCv();
    parseDate();
  }, []);

  return (
    <>
      <Navbar></Navbar>
      <section style={{ backgroundColor: "#eee" }}>
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-4">
              <div className="company-card mb-4">
                <div className="card-body text-center">
                  <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                    alt="avatar"
                    className="rounded-circle img-fluid"
                    style={{ width: 150 }}
                  ></img>
                  <h5 className="my-3">Altan ANAY</h5>
                  <p className="text-muted mb-1">{cv?.information}</p>
                </div>
              </div>
              <div className="company-card mb-4 mb-lg-0">
                <div className="card-body p-0">
                  <ul className="list-group list-group-flush rounded-3">
                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                      <img
                        src="github.png"
                        className="img-fluid"
                        width="35"
                      ></img>
                      <p className="mb-0">{cv?.socialMedias?.github}</p>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                      <img
                        src="linkedin.png"
                        className="img-fluid"
                        width="35"
                      ></img>
                      <p className="mb-0">{cv?.socialMedias?.linkedin}</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="company-card mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Full Name</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">{cv?.firstName.toUpperCase() + " " + cv?.lastName.toUpperCase()}</p>
                    </div>
                  </div>
                  <hr></hr>
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Email</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">{cv?.email}</p>
                    </div>
                  </div>
                  <hr></hr>
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">TC Kimlik</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">111111111111</p>
                    </div>
                  </div>
                  <hr></hr>
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Doğum Tarihi</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">{cv?.dateOfBirth?.split("-")[2][0] + cv?.dateOfBirth!?.split("-")[2][1] + "/" + cv?.dateOfBirth!?.split("-")[1] + "/" + cv?.dateOfBirth!?.split("-")[0]}</p>
                    </div>
                  </div>
                  <hr></hr>
                </div>
              </div>

              {cv?.projects! ? (
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    className="mt-5"
                    rows={cv?.projects!}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection
                    disableSelectionOnClick
                    experimentalFeatures={{ newEditingApi: true }}
                    sx={{ backgroundColor: "white" }}
                    pagination
                  />
                </Box>
              ) : (
                <div></div>
              )}

              {cv?.jobExperiences! ? (
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    className="mt-5"
                    rows={cv?.jobExperiences!}
                    columns={jobExperiencesColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection
                    disableSelectionOnClick
                    experimentalFeatures={{ newEditingApi: true }}
                    sx={{ backgroundColor: "white" }}
                    pagination
                  />
                </Box>
              ) : (
                <div></div>
              )}

              

              <div className="company-card mb-4 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Programlama Dilleri</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">
                        {cv?.programmingLanguages.map((item) => {
                          return <>{item.languages + " "}</>;
                        })}
                      </p>
                    </div>
                  </div>
                  <hr></hr>
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Yetenekler</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">{cv?.skills.map((i) => {
                        return <>{i + " "}</>
                      })}</p>
                    </div>
                  </div>
                  <hr></hr>
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Yabancı Dil</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">
                        {cv?.languages.map((item) => {
                          return <>{item.languages + " "}</>;
                        })}
                      </p>
                    </div>
                  </div>
                  <hr></hr>
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Hobiler</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">{cv?.hobbies}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="company-card mb-4 mb-md-0">
                    <div className="card-body">
                      <p className="mb-4">
                        <span className="text-primary font-italic me-1">
                          Programlama Dilleri
                        </span>
                      </p>
                      {cv?.programmingLanguages?.map((item, index) => {
                        return (
                          <>
                            <p
                              key={index}
                              className="mt-4 mb-1"
                              style={{ fontSize: ".77rem" }}
                            >
                              {item.languages}
                            </p>
                            <div
                              className="progress rounded"
                              style={{ height: "5px" }}
                            >
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: "80%" }}
                              ></div>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="company-card mb-4 mb-md-0">
                    <div className="card-body">
                      <p className="mb-4">
                        <span className="text-primary font-italic me-1">
                          Yetenekler
                        </span>
                      </p>
                      {cv?.skills.map((item, index) => {
                        return (<>
                          <p
                            key={index}
                            className="mt-4 mb-1"
                            style={{ fontSize: ".77rem" }}
                          >
                            {item}
                          </p>
                          <div
                            className="progress rounded"
                            style={{ height: "5px" }}
                          >
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: "80%" }}
                            ></div>
                          </div>
                        </>)
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
