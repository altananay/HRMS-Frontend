import Navbar from "./Navbar";
import "../../assets/util.css";
import "../../assets/main.css";
import img from "../../assets/images/img-01.png";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import { addContact } from "../../services/ContactService";
import { toast, ToastContainer } from "react-toastify";
interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const initialValues: FormValues = {
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  };

  const schema = Yup.object({
    firstName: Yup.string()
      .min(3, "İsminiz 3 karakterden az olamaz.")
      .required("İsminiz boş olamaz"),
    lastName: Yup.string()
      .min(3, "Soyisminiz 3 karakterden az olamaz.")
      .required("Soyisminiz boş olamaz"),
    email: Yup.string()
      .email("Email adresiniz doğru formatta olmalı")
      .required("Emal adresiniz boş olamaz"),
    subject: Yup.string()
      .min(5, "Konu başlığı 5 karaterden az olamaz")
      .required("Konu başlığı boş olamaz"),
    message: Yup.string()
      .min(20, "Mesajınız 20 karakterden az olamaz")
      .required("Mesajınız boş olamaz"),
  });

  return (
    <>
      <Navbar isAuthenticated={false}></Navbar>
      <div className="contact1">
        <div className="container-contact1">
          <div className="contact1-pic js-tilt" data-tilt>
            <img src={img} alt="IMG"></img>
          </div>

          <div className="contact1-form">
            <span className="contact1-form-title">
              Bizimle iletişime geçin.
            </span>

            <Formik
              initialValues={initialValues}
              validationSchema={schema}
              onSubmit={(values, { setSubmitting, resetForm }) => {
                addContact(values)
                  .then((response) => {
                    if (response.data.isSuccess) {
                      setSubmitting(false);
                      toast.success(`${response.data.message}`, {
                        position: toast.POSITION.BOTTOM_RIGHT,
                      });
                      resetForm()
                    }
                  })
                  .catch((error) => {
                    toast.error(error.response.data.message, {
                      position: toast.POSITION.BOTTOM_RIGHT,
                    });
                  });
              }}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form noValidate>
                  <div className="wrap-input1">
                    <Field
                      className={
                        "input1 " +
                        (touched.firstName && errors.firstName
                          ? "is-invalid"
                          : null)
                      }
                      type="text"
                      name="firstName"
                      placeholder="Adınız"
                    ></Field>
                    {touched.firstName && errors.firstName ? (
                      <div className="text-danger">{errors.firstName}</div>
                    ) : null}
                    <span className="shadow-input1"></span>
                  </div>

                  <div className="wrap-input1">
                    <Field
                      className={
                        "input1 " +
                        (touched.lastName && errors.lastName
                          ? "is-invalid"
                          : null)
                      }
                      type="text"
                      name="lastName"
                      placeholder="Soyadınız"
                    ></Field>
                    {touched.lastName && errors.lastName ? (
                      <div className="text-danger">{errors.lastName}</div>
                    ) : null}
                    <span className="shadow-input1"></span>
                  </div>

                  <div className="wrap-input1">
                    <Field
                      className={
                        "input1 " +
                        (touched.email && errors.email ? "is-invalid" : null)
                      }
                      type="email"
                      name="email"
                      placeholder="Mail adresiniz"
                    ></Field>
                    {touched.email && errors.email ? (
                      <div className="text-danger">{errors.email}</div>
                    ) : null}
                    <span className="shadow-input1"></span>
                  </div>

                  <div className="wrap-input1">
                    <Field
                      className={
                        "input1 " +
                        (touched.subject && errors.subject
                          ? "is-invalid"
                          : null)
                      }
                      type="text"
                      name="subject"
                      placeholder="Konu"
                    ></Field>
                    {touched.subject && errors.subject ? (
                      <div className="text-danger">{errors.subject}</div>
                    ) : null}
                    <span className="shadow-input1"></span>
                  </div>

                  <div className="wrap-input1">
                    <Field
                      as="textarea"
                      className={
                        "input1 " +
                        (touched.message && errors.message
                          ? "is-invalid"
                          : null)
                      }
                      name="message"
                      placeholder="Mesajınız"
                      style={{ maxHeight: "200px" }}
                    ></Field>
                    {touched.message && errors.message ? (
                      <div className="text-danger">{errors.message}</div>
                    ) : null}
                    <span className="shadow-input1"></span>
                  </div>

                  <div className="container-contact1-form-btn">
                    <button
                      className="contact1-form-btn"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Please wait..." : "Gönder"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <ToastContainer></ToastContainer>
    </>
  );
};

export default Contact;
