import React, { useState } from "react";
import "../../assets/login-and-signup-page-styles.css";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import Navbar from "../public/Navbar";
import { login } from "../../services/JobSeekerAuthService";
import { toast, ToastContainer } from "react-toastify";
import { AddLocalStorage } from "../../services/LocalStorageService";
import { useNavigate } from "react-router-dom";
import { companyLogin, signUp } from "../../services/EmployerAuthService";

interface FormValues {
  companyName: string;
  companyPhone: string;
  webSite: string;
  email: string;
  password: string;
}

const CompanySignUp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const initialValues: FormValues = {
    companyName: "",
    companyPhone: "",
    webSite: "",
    email: "",
    password: "",
  };

  const schema = Yup.object({
    companyName: Yup.string().required("Şirket ismi zorunlu"),
    companyPhone: Yup.string().required("Telefon zorunlu"),
    webSite: Yup.string().required("Web sitesi zorunlu"),
    email: Yup.string().email().required("Email zorunlu"),
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
                The best offer <br />
                <span style={{ color: "hsl(218, 81%, 75%)" }}>
                  for your business
                </span>
              </h1>
              <p
                className="mb-4 opacity-70"
                style={{ color: "hsl(218, 81%, 85%)" }}
              >
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Temporibus, expedita iusto veniam atque, magni tempora mollitia
                dolorum consequatur nulla, neque debitis eos reprehenderit quasi
                ab ipsum nisi dolorem modi. Quos?
              </p>
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
                  signUp(values)
                    .then((response) => {
                      if (response.data.isSuccess) {
                        toast.success(
                          `${response.data.message} Giriş sayfasına yönlendirildiniz.`,
                          {
                            position: toast.POSITION.BOTTOM_RIGHT,
                          }
                        );
                        setTimeout(() => {
                          navigate("/companylogin");
                        }, 1000);
                      } else {
                        toast.warning(`${response.data.message}`);
                      }
                    })
                    .catch((error) => {
                      toast.error(error.response.data.message, {
                        position: toast.POSITION.BOTTOM_RIGHT,
                      });
                    });

                  resetForm();
                  setIsAuthenticated(true);
                }}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form noValidate>
                    <div className="card bg-glass">
                      <div className="card-body px-4 py-5 px-md-5">
                        <div className="form-outline mb-4">
                          <label className="form-label">Şirket adınız</label>
                          <Field
                            name="companyName"
                            type="text"
                            className={
                              "form-control " +
                              (touched.companyName && errors.companyName
                                ? "is-invalid"
                                : null)
                            }
                          />
                          {touched.companyName && errors.companyName ? (
                            <div className="text-danger">
                              {errors.companyName}
                            </div>
                          ) : null}
                        </div>

                        <div className="form-outline mb-4">
                          <label className="form-label">Şirket telefonu</label>
                          <Field
                            name="companyPhone"
                            type="text"
                            className={
                              "form-control " +
                              (touched.companyPhone && errors.companyPhone
                                ? "is-invalid"
                                : null)
                            }
                          />
                          {touched.companyPhone && errors.companyPhone ? (
                            <div className="text-danger">
                              {errors.companyPhone}
                            </div>
                          ) : null}
                        </div>

                        <div className="form-outline mb-4">
                          <label className="form-label">Web siteniz</label>
                          <Field
                            name="webSite"
                            type="text"
                            className={
                              "form-control " +
                              (touched.webSite && errors.webSite
                                ? "is-invalid"
                                : null)
                            }
                          />
                          {touched.webSite && errors.webSite ? (
                            <div className="text-danger">{errors.webSite}</div>
                          ) : null}
                        </div>

                        <div className="form-outline mb-4">
                          <label className="form-label">Email adresiniz</label>
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
                          {isSubmitting ? "Please wait..." : "Kayıt Ol"}
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

export default CompanySignUp;
