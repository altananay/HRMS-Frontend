import React, { useState } from "react";
import "../../assets/login-and-signup-page-styles.css";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import Navbar from "../public/Navbar";
import { login } from "../../services/JobSeekerAuthService";
import { toast, ToastContainer } from "react-toastify";
import {
  AddLocalStorage,
} from "../../services/LocalStorageService";
import { useNavigate } from "react-router-dom";

interface FormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const initialValues: FormValues = {
    email: "",
    password: "",
  };

  const schema = Yup.object({
    email: Yup.string().email("Email adresinizi doğru formatta giriniz.").required("Email zorunlu"),
    password: Yup.string().required("Şifre zorunlu"),
  });

  return (
    <>
      <Navbar></Navbar>
      <section className="background-radial-gradient overflow-hidden">
        <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
          <div className="row gx-lg-5 align-items-center mb-5">
            <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
              <h1
                className="my-5 display-5 fw-bold ls-tight"
                style={{ color: "hsl(218, 81%, 95%)" }}
              >
                <span style={{ color: "hsl(218, 81%, 75%)" }}>
                  Kullanıcı Girişi
                </span>
              </h1>
            </div>

            <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
              <div
                id="radius-shape-1"
                className="position-absolute rounded-circle shadow-5-strong"
              ></div>
              <div
                id="radius-shape-2"
                className="position-absolute shadow-5-strong"
              ></div>

              <Formik
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  const jobSeekerLogin = async () => {
                     await login(values)
                      .then((response) => {
                        if (response.data.isSuccess) {
                          setSubmitting(false);
                          toast.success(`${response.data.message} Profil sayfasına yönlendirildiniz.`, {
                            position: toast.POSITION.BOTTOM_RIGHT,
                          });
                          AddLocalStorage("token", response.data.data.token)
                          setTimeout(() => {
                            navigate("/profile")
                          }, 1000);
                          
                        }
                      })
                      .catch((error) => {
                        toast.error(error.response.data.message, {
                          position: toast.POSITION.BOTTOM_RIGHT,
                        });
                      });
                  };
                  jobSeekerLogin();
                  resetForm();
                  setIsAuthenticated(true)
                }}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form noValidate>
                    <div className="card bg-glass">
                      <div className="card-body px-4 py-5 px-md-5">
                        <div className="form-outline mb-4">
                          <label className="form-label">Email adresi</label>
                          <Field
                            name="email"
                            type="email"
                            className={
                              "form-control " +
                              (touched.email && errors.email
                                ? "is-invalid"
                                : null)
                            }
                          />
                          {touched.email && errors.email ? (
                            <div className="text-danger">{errors.email}</div>
                          ) : null}
                        </div>

                        <div className="form-outline mb-4">
                          <label className="form-label">Şifre</label>
                          <Field
                            name="password"
                            type="password"
                            className={
                              "form-control " +
                              (touched.password && errors.password
                                ? "is-invalid"
                                : null)
                            }
                          />
                          {touched.password && errors.password ? (
                            <div className="text-danger">{errors.password}</div>
                          ) : null}
                        </div>

                        <button
                          className="btn btn-primary btn-block mb-4"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Please wait..." : "Giriş Yap"}
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer></ToastContainer>
    </>
  );
};

export default Login;
