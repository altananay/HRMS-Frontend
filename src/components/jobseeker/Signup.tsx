import React from "react";
import "../../assets/login-and-signup-page-styles.css";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import Navbar from "../public/Navbar";
import {signup} from "../../services/JobSeekerAuthService"
import { toast, ToastContainer } from "react-toastify";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordAgain: string;
}

const SignUp: React.FC = () => {
  const initialValues: FormValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordAgain: "",
  };

  const schema = Yup.object({
    firstName: Yup.string().required("Ad zorunlu"),
    lastName: Yup.string().required("Soyadı zorunlu"),
    email: Yup.string().email().required("Email zorunlu"),
    password: Yup.string().required("Şifre zorunlu"),
    passwordAgain: Yup.string()
      .oneOf([Yup.ref("password"), null], "Şifreler eşleşmek zorunda")
      .required("Zorunlu alan"),
  });

  return (
    <>
    <Navbar></Navbar>
      <section className="background-radial-gradient overflow-hidden">
        <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
          <div className="row gx-lg-5 mb-5">
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
                  setTimeout(() => {

                    const signUpValues = {
                      email: values.email,
                      password: values.password,
                      firstName: values.firstName,
                      lastName: values.lastName,

                    }

                    signup(signUpValues).then((response) => {
                      if (response.data.isSuccess)
                      {
                        toast.success(response.data.message, {
                          position: toast.POSITION.BOTTOM_RIGHT
                        })
                      }
                      else
                      {
                        toast.warning(response.data.message, {
                          position: toast.POSITION.BOTTOM_RIGHT
                        })
                      }
                      
                    })
                    setSubmitting(false);
                    resetForm();
                  }, 1000);
                }}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form noValidate>
                    <div className="card bg-glass">
                      <div className="card-body px-4 py-5 px-md-5">
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <div className="form-outline">
                              <label className="form-label">First name</label>
                              <Field
                                name="firstName"
                                type="text"
                                className={
                                  "form-control " +
                                  (touched.firstName && errors.firstName
                                    ? "is-invalid"
                                    : null)
                                }
                              />
                              {touched.firstName && errors.firstName ? (
                                <div className="text-danger">
                                  {errors.firstName}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="col-md-6 mb-4">
                            <div className="form-outline">
                              <label className="form-label">Last name</label>
                              <Field
                                name="lastName"
                                className={
                                  "form-control " +
                                  (touched.lastName && errors.lastName
                                    ? "is-invalid"
                                    : null)
                                }
                                type="text"
                              />

                              {touched.lastName && errors.lastName ? (
                                <div className="text-danger">
                                  {errors.lastName}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>

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

                        <div className="form-outline mb-4">
                          <label className="form-label">
                            Şifreyi tekrar girin.
                          </label>
                          <Field
                            name="passwordAgain"
                            type="password"
                            className={
                              "form-control " +
                              (touched.passwordAgain && errors.passwordAgain
                                ? "is-invalid"
                                : null)
                            }
                          />
                          {touched.passwordAgain && errors.passwordAgain ? (
                            <div className="text-danger">
                              {errors.passwordAgain}
                            </div>
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

export default SignUp;
