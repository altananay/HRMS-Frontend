import React, { useState } from "react";
import "../../assets/login-and-signup-page-styles.css";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import Navbar from "./Navbar";
import { login } from "../../services/JobSeekerAuthService";
import { TokenModel } from "../../contracts/tokenModel";
import { toast, ToastContainer } from "react-toastify";
import {
  AddLocalStorage,
  GetFromLocalStorage,
} from "../../services/LocalStorageService";
import { getClaims, jwtDecode } from "../../services/JWTService";

interface FormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {

  const initialValues: FormValues = {
    email: "",
    password: "",
  };

  const schema = Yup.object({
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
                  const decode = async () => {
                    let token = await GetFromLocalStorage("token");
                    let decodedJwt = await jwtDecode(token!);
                    console.log(decodedJwt)
                    getClaims(decodedJwt)
                  };

                  const jobSeekerLogin = async () => {
                     await login(values)
                      .then((response) => {
                        if (response.data.isSuccess) {
                          setSubmitting(false);
                          toast.success(response.data.message, {
                            position: toast.POSITION.BOTTOM_RIGHT,
                          });
                          AddLocalStorage("token", response.data.data.token)
                          decode();
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
                }}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form noValidate>
                    <div className="card bg-glass">
                      <div className="card-body px-4 py-5 px-md-5">
                        <div className="form-outline mb-4">
                          <label className="form-label">Email address</label>
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
                          <label className="form-label">Password</label>
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
