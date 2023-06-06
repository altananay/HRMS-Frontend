import { useEffect, useState } from "react";
import { getByJobSeekerId } from "../../services/JobSeekerService";
import { Cv } from "../../contracts/Cv";
import Navbar from "../public/Navbar";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { GetFromLocalStorage } from "../../services/LocalStorageService";
import { getClaims, getId, jwtDecode } from "../../services/JWTService";
import { NavLink, useNavigate } from "react-router-dom";
import "../../assets/argon-dashboard.css";
import Notfound from "../public/Notfound";
import github from "../../assets/images/github.png";
import linkedin from "../../assets/images/linkedin.png";
import emptyCv from "../../assets/images/dontResult.png";

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

const educationsColumns: GridColDef[] = [
  {
    field: "school",
    headerName: "Okul adı",
    width: 250,
    editable: true,
  },
  {
    field: "major",
    headerName: "Bölüm",
    width: 250,
    editable: true,
  },
  {
    field: "grade",
    headerName: "Ortalama/Puan",
    width: 250,
    editable: true,
  },
  {
    field: "years",
    headerName: "Yıl",
    width: 250,
    editable: true,
  },
  {
    field: "graduate",
    headerName: "Durum",
    width: 250,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  let dateOfBirth;

  useEffect(() => {
    let jwt = GetFromLocalStorage("token");
    let decodedJwt;
    let roles;
    let id;

    if (jwt) {
      decodedJwt = jwtDecode(jwt);
      roles = getClaims(decodedJwt);
    }

    roles!?.map((role) => {
      if (role == "jobseeker") {
        setIsAuthenticated(true);
        id = getId(decodedJwt);
      }
    });

    const getCv = async () => {
      await getByJobSeekerId(id).then((response) => {
        setCv(response.data.data);
      });
    };

    const parseDate = async () => {
      dateOfBirth = cv?.dateOfBirth?.split("-");
      dateOfBirth[2] = dateOfBirth[2][0] + dateOfBirth[2][1];
    };

    getCv();
    parseDate();
  }, []);

  if (!isAuthenticated) {
    return <Notfound></Notfound>;
  } else if (cv == null) {
    return (
      <section>
        <Navbar></Navbar>
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
                </div>
              </div>
              <NavLink to="/cvcreate">
                <button className="btn btn-primary">Cv Ekle</button>
              </NavLink>
            </div>
            <div className="col-lg-8 text-center">
              <h3>
                Cv bilginiz sistemde yoktur. Yeni Cv girişi yapabilirsiniz
              </h3>
              <img
                src={emptyCv}
                width="150"
                style={{ marginTop: "30px" }}
              ></img>
            </div>
          </div>
        </div>
      </section>
    );
  } else {
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

                    <h5 className="my-3">
                      {cv?.firstName.toUpperCase() +
                        " " +
                        cv?.lastName.toUpperCase()}
                    </h5>
                    <p className="text-muted mb-1">{cv?.information}</p>
                  </div>
                </div>
                <div className="company-card mb-4 mb-lg-0">
                  <div className="card-body p-0">
                    <ul className="list-group list-group-flush rounded-3">
                      <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                        <img
                          src={github}
                          className="img-fluid"
                          width="35"
                        ></img>
                        <p className="mb-0">{cv?.socialMedias?.github}</p>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                        <img
                          src={linkedin}
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
                        <p className="text-muted mb-0">
                          {cv?.firstName.toUpperCase() +
                            " " +
                            cv?.lastName.toUpperCase()}
                        </p>
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
                        <p className="mb-0">Doğum Tarihi</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">
                          {cv?.dateOfBirth?.split("-")[2][0] +
                            cv?.dateOfBirth!?.split("-")[2][1] +
                            "/" +
                            cv?.dateOfBirth!?.split("-")[1] +
                            "/" +
                            cv?.dateOfBirth!?.split("-")[0]}
                        </p>
                      </div>
                    </div>
                    <hr></hr>
                  </div>
                </div>

                <h4>Okul Bilgileri</h4>
                {cv?.educations! ? (
                  <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                      className="mt-3"
                      rows={cv?.educations!}
                      getRowId={(row) => cv.id}
                      columns={educationsColumns}
                      pageSize={5}
                      rowsPerPageOptions={[5, 10, 20]}
                      checkboxSelection
                      disableSelectionOnClick
                      experimentalFeatures={{ newEditingApi: true }}
                      sx={{ backgroundColor: "white" }}
                      pagination
                    />
                  </Box>
                ) : null}

                <h4 style={{ marginTop: "25px" }}>Projeler</h4>
                {cv?.projects! ? (
                  <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                      className="mt-3"
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

                <h4 style={{ marginTop: "25px" }}>İş tecrübeleri</h4>
                {cv?.jobExperiences! ? (
                  <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                      className="mt-3"
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
                        <p className="mb-0">Yetenekler</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">
                          {cv?.skills.map((i) => {
                            return <>{i + " "}</>;
                          })}
                        </p>
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
                            Yetenekler
                          </span>
                        </p>
                        {cv?.skills.map((item, index) => {
                          return (
                            <>
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
                            </>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )
      </>
    );
  }
};

export default Profile;
