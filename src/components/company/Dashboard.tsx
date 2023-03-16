import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import "../../assets/argon-dashboard.css";

import Navbar from "../public/Navbar";
import Sidebar from "./layouts/Sidebar";
import Statistics from "./layouts/Statistics";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "firstName",
    headerName: "First name",
    width: 150,
    editable: true,
  },
  {
    field: "lastName",
    headerName: "Last name",
    width: 150,
    editable: true,
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.firstName || ""} ${params.row.lastName || ""}`,
  },
];

const rows = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
];

const Dashboard = () => {
  return (
    <>
      <body className="g-sidenav-show" style={{marginTop: "60px", backgroundColor: "#5F73E3"}}>
        <div
          className="min-height-300 position-absolute w-100"
          style={{ backgroundColor: "#5E72E4" }}
        ></div>
        <Sidebar></Sidebar>
        <main className="main-content position-relative border-radius-lg" style={{backgroundColor: "#5F73E3"}}>
          <div className="container-fluid py-4">
            <Statistics></Statistics>

            <div className="row mt-4">
              <div className="col-lg-7 mb-lg-0">
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={rows}
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
              </div>
              <div className="col-lg-5">
                <div className="company-card">
                  <div className="card-header pb-0 p-3">
                    <h6 className="mb-0">Categories</h6>
                  </div>
                  <div className="card-body p-3">
                    <ul className="list-group">
                      <li className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                        <div className="d-flex align-items-center">
                          <div className="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                            <i className="ni ni-mobile-button text-white opacity-10"></i>
                          </div>
                          <div className="d-flex flex-column">
                            <h6 className="mb-1 text-dark text-sm">Devices</h6>
                            <span className="text-xs">
                              250 in stock,{" "}
                              <span className="font-weight-bold">
                                346+ sold
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="d-flex">
                          <button className="btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right my-auto">
                            <i
                              className="ni ni-bold-right"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div>
                      </li>
                      <li className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                        <div className="d-flex align-items-center">
                          <div className="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                            <i className="ni ni-tag text-white opacity-10"></i>
                          </div>
                          <div className="d-flex flex-column">
                            <h6 className="mb-1 text-dark text-sm">Tickets</h6>
                            <span className="text-xs">
                              123 closed,{" "}
                              <span className="font-weight-bold">15 open</span>
                            </span>
                          </div>
                        </div>
                        <div className="d-flex">
                          <button className="btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right my-auto">
                            <i
                              className="ni ni-bold-right"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div>
                      </li>
                      <li className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                        <div className="d-flex align-items-center">
                          <div className="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                            <i className="ni ni-box-2 text-white opacity-10"></i>
                          </div>
                          <div className="d-flex flex-column">
                            <h6 className="mb-1 text-dark text-sm">
                              Error logs
                            </h6>
                            <span className="text-xs">
                              1 is active,{" "}
                              <span className="font-weight-bold">
                                40 closed
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="d-flex">
                          <button className="btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right my-auto">
                            <i
                              className="ni ni-bold-right"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div>
                      </li>
                      <li className="list-group-item border-0 d-flex justify-content-between ps-0 border-radius-lg">
                        <div className="d-flex align-items-center">
                          <div className="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                            <i className="ni ni-satisfied text-white opacity-10"></i>
                          </div>
                          <div className="d-flex flex-column">
                            <h6 className="mb-1 text-dark text-sm">
                              Happy users
                            </h6>
                            <span className="text-xs font-weight-bold">
                              + 430
                            </span>
                          </div>
                        </div>
                        <div className="d-flex">
                          <button className="btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right my-auto">
                            <i
                              className="ni ni-bold-right"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </body>
    </>
  );
};

export default Dashboard;
