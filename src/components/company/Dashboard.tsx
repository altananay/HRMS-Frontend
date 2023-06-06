import { useEffect, useState } from "react";
import {
  DeleteFromLocalStorage,
  GetFromLocalStorage,
} from "../../services/LocalStorageService";
import jwtDecode from "jwt-decode";
import { getClaims, getId } from "../../services/JWTService";
import "../../assets/style.css";


import Charts from "./Charts";


import { getById } from "../../services/EmployerService";
import { Employer } from "../../contracts/Employer";
import Sidebar from "./layouts/Sidebar";

const Dashboard = () => {
  const [employer, setEmployer] = useState<Employer>();

  useEffect(() => {
    let jwt = GetFromLocalStorage("companyToken");
    let decodedJwt;
    let roles;
    let id;

    if (jwt) {
      decodedJwt = jwtDecode(jwt);
      roles = getClaims(decodedJwt);
    }

    roles!?.map((role) => {
      if (role == "employer") {
        id = getId(decodedJwt);
      }
    });

    getById(id)
      .then((response) => {
        setEmployer(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      
      <Sidebar></Sidebar>
      <div className="content-body">
        <div className="container-fluid mt-3">
          <div className="row">
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-1">
                <div className="card-body">
                  <h3 className="card-title text-white">Çalışan Sayısı</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">
                      {employer?.numberOfEmployees}
                    </h2>
                  </div>
                  <span className="float-right display-5 opacity-5"></span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-2">
                <div className="card-body">
                  <h3 className="card-title text-white">İş ilanı sayısı</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">{employer?.companyPhone}</h2>
                  </div>
                  <span className="float-right display-5 opacity-5"></span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-3">
                <div className="card-body">
                  <h3 className="card-title text-white">Sektör sayısı</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">{employer?.sector.length}</h2>
                  </div>
                  <span className="float-right display-5 opacity-5"></span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-4">
                <div className="card-body">
                  <h3 className="card-title text-white">
                    Customer Satisfaction
                  </h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">99%</h2>
                    <p className="text-white mb-0">Jan - March 2019</p>
                  </div>
                  <span className="float-right display-5 opacity-5">
                    <i className="fa fa-heart"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Charts deparments={employer?.departments}></Charts>
      </div>
    </>
  );
};

export default Dashboard;
