import React, { KeyboardEventHandler } from "react";
import { Field, Form, Formik } from "formik";
import Sidebar from "./layouts/Sidebar";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import axios from "axios";
import { addJobAdvertisement } from "../../services/JobAdvertisementService";
import CreatableSelect from "react-select/creatable";
import { toast, ToastContainer } from "react-toastify";

const components = {
  DropdownIndicator: null,
};

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label: label,
  value: label,
});

interface FormValues {
  employerId: string;
  title: string;
  jobPositionName: string;
  description: string;
  experience: string;
  skills: string[];
  city: string;
  currency: string;
  minSalary: Number;
  maxSalary: Number;
  openPosition: Number;
  jobType: string;
  deadline: string;
}

const AddJobAdvertisement = () => {
  const [cities, setCities] = useState<any>();
  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState<readonly Option[]>([]);
  let [skills, setSkills] = useState<string[]>([]);

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setValue((prev) => [...prev, createOption(inputValue)]);
        setInputValue("");
        event.preventDefault();
    }
  };

  useEffect(() => {
    axios
      .get(
        "https://gist.githubusercontent.com/serong/9b25594a7b9d85d3c7f7/raw/9904724fdf669ad68c07ab79af84d3a881ff8859/iller.json"
      )
      .then((response) => {
        setCities(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const initialValues: FormValues = {
    employerId: "6405b6b53671dcf339a9692c",
    title: "",
    jobPositionName: "",
    description: "",
    experience: "",
    skills: [],
    city: "",
    currency: "",
    minSalary: 0,
    maxSalary: 0,
    openPosition: 0,
    jobType: "",
    deadline: "",
  };

  const schema = Yup.object({
    jobPositionName: Yup.string().required("İş pozisyonu boş bırakılamaz."),
    title: Yup.string().required("Başlık boş olamaz"),
    experience: Yup.string().required("Tecrübe bilgisi boş olamaz."),
    description: Yup.string().required("İş ilanı için açıklama girmelisiniz."),
    city: Yup.string().required("Şehir boş olamaz."),
    minSalary: Yup.number()
      .required("Minimum maaş alanı boş olamaz")
      .lessThan(Yup.ref("maxSalary"), "Min. maaş, Max. maaştan yüksek olamaz"),
    maxSalary: Yup.number()
      .required("Maximum maaş alanı boş olamaz")
      .moreThan(Yup.ref("minSalary"), "Max. maaş, Min. maaştan az olamaz"),
    openPosition: Yup.number().required("Açık pozisyon sayısı boş bırakılamaz"),
    jobType: Yup.string().required("İş türü boş olamaz"),
    deadline: Yup.string().required("Son başvuru tarihi boş olamaz"),
    currency: Yup.string().required("Para birimi boş olamaz."),
  });

  return (
    <>
      <body className="g-sidenav-show">
        <div className="min-height-300 position-absolute w-100"></div>
        <Sidebar></Sidebar>
        <main className="main-content position-relative border-radius-lg">
          <div className="container-fluid py-4">
            <section className="background-radial-gradient overflow-hidden">
              <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
                <div className="row justify-content-center gx-lg-5 mb-5">
                  <div
                    className="col-lg-12 mb-5 mb-lg-0"
                    style={{ zIndex: 10 }}
                  >
                    <h1
                      className="fw-bold ls-tight text-center"
                      style={{ color: "hsl(218, 81%, 95%)" }}
                    >
                      İş İlanı Ekleme<br />
                    </h1>
                  </div>

                  <div className="col-lg-6 mb-5 mb-lg-0 position-relative mt-5">
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
                          const skillInitialize = async () => {
                            await value.map((item) => {
                              skills.push(item.value);
                            });
                          };
                          skillInitialize();
                          values.skills = skills;
                          addJobAdvertisement(values).then((response) => {
                            toast.success(response.data.message, {
                              position: toast.POSITION.BOTTOM_RIGHT
                            })
                          }).catch((error) => {
                            console.log(error.response.data)
                          })
                          setSubmitting(false);
                          resetForm();
                          skills = [];
                        }, 1000);
                      }}
                    >
                      {({ isSubmitting, touched, errors }) => (
                        <Form noValidate>
                          <div className="card bg-glass">
                            <div className="card-body px-4 py-5 px-md-5">
                              <div className="row">
                                <div className="form-outline mb-4">
                                  <label className="form-label">
                                    İş ilanı başlığı
                                  </label>
                                  <Field
                                    name="title"
                                    type="text"
                                    className={
                                      "form-control " +
                                      (touched.title && errors.title
                                        ? "is-invalid"
                                        : null)
                                    }
                                  />
                                  {touched.title && errors.title ? (
                                    <div className="text-danger">
                                      {errors.title}
                                    </div>
                                  ) : null}
                                </div>
                                <div className="col-md-6 mb-4">
                                  <div className="form-outline">
                                    <label className="form-label">
                                      İş pozisyonu
                                    </label>
                                    <Field
                                      name="jobPositionName"
                                      type="text"
                                      className={
                                        "form-control " +
                                        (touched.jobPositionName &&
                                        errors.jobPositionName
                                          ? "is-invalid"
                                          : null)
                                      }
                                    />
                                    {touched.jobPositionName &&
                                    errors.jobPositionName ? (
                                      <div className="text-danger">
                                        {errors.jobPositionName}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="col-md-6 mb-4">
                                  <div className="form-outline">
                                    <label className="form-label">Şehir</label>
                                    <Field
                                      as="select"
                                      name="city"
                                      className={
                                        "form-select " +
                                        (touched.city && errors.city
                                          ? "is-invalid"
                                          : null)
                                      }
                                    >
                                      {cities
                                        ? Object.keys(cities).map((i) => {
                                            return (
                                              <option
                                                key={i}
                                                value={cities[i]}
                                                id={i}
                                              >
                                                {cities[i]}
                                              </option>
                                            );
                                          })
                                        : null}
                                    </Field>

                                    {touched.city && errors.city ? (
                                      <div className="text-danger">
                                        {errors.city}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-outline">
                                    <label className="form-label">
                                      Minimum maaş
                                    </label>
                                    <Field
                                      name="minSalary"
                                      type="text"
                                      className={
                                        "form-control " +
                                        (touched.minSalary && errors.minSalary
                                          ? "is-invalid"
                                          : null)
                                      }
                                    />
                                    {touched.minSalary && errors.minSalary ? (
                                      <div className="text-danger">
                                        {errors.minSalary as String}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                  <div className="form-outline">
                                    <label className="form-label">
                                      Maksimum Maaş
                                    </label>
                                    <Field
                                      name="maxSalary"
                                      type="text"
                                      className={
                                        "form-control " +
                                        (touched.maxSalary && errors.maxSalary
                                          ? "is-invalid"
                                          : null)
                                      }
                                    />
                                    {touched.maxSalary && errors.maxSalary ? (
                                      <div className="text-danger">
                                        {errors.maxSalary as String}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <label className="form-label">Yetenekler</label>
                              <CreatableSelect
                                name="skills"
                                components={components}
                                inputValue={inputValue}
                                isClearable
                                isMulti
                                menuIsOpen={false}
                                onChange={(newValue) => setValue(newValue)}
                                onInputChange={(newValue) =>
                                  setInputValue(newValue)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Gerekli yetenekleri giriniz."
                                value={value}
                              />

                              <div className="form-outline mb-3 mt-3">
                                <label className="form-label">
                                  Para birimi
                                </label>
                                <Field
                                  name="currency"
                                  type="text"
                                  className={
                                    "form-control " +
                                    (touched.currency && errors.currency
                                      ? "is-invalid"
                                      : null)
                                  }
                                />
                                {touched.currency && errors.currency ? (
                                  <div className="text-danger">
                                    {errors.currency}
                                  </div>
                                ) : null}
                              </div>

                              <div className="row">
                                <div className="col-md-6 mb-4">
                                  <div className="form-outline">
                                    <label className="form-label">
                                      Açık Pozisyon Sayısı
                                    </label>
                                    <Field
                                      name="openPosition"
                                      type="text"
                                      className={
                                        "form-control " +
                                        (touched.openPosition &&
                                        errors.openPosition
                                          ? "is-invalid"
                                          : null)
                                      }
                                    />
                                    {touched.openPosition &&
                                    errors.openPosition ? (
                                      <div className="text-danger">
                                        {errors.openPosition as String}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="col-md-6 mb-4">
                                  <div className="form-outline">
                                    <label className="form-label">
                                      Tecrübe
                                    </label>
                                    <Field
                                      name="experience"
                                      type="text"
                                      className={
                                        "form-control " +
                                        (touched.experience && errors.experience
                                          ? "is-invalid"
                                          : null)
                                      }
                                    />
                                    {touched.experience && errors.experience ? (
                                      <div className="text-danger">
                                        {errors.experience}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="form-outline mb-4">
                                <label className="form-label">İş Türü</label>
                                <Field
                                  name="jobType"
                                  type="text"
                                  className={
                                    "form-control " +
                                    (touched.jobType && errors.jobType
                                      ? "is-invalid"
                                      : null)
                                  }
                                />
                                {touched.jobType && errors.jobType ? (
                                  <div className="text-danger">
                                    {errors.jobType}
                                  </div>
                                ) : null}
                              </div>

                              <div className="form-outline mb-4">
                                <label className="form-label">
                                  Son Başvuru Tarihi
                                </label>
                                <Field
                                  name="deadline"
                                  type="date"
                                  className={
                                    "form-control " +
                                    (touched.deadline && errors.deadline
                                      ? "is-invalid"
                                      : null)
                                  }
                                />
                                {touched.deadline && errors.deadline ? (
                                  <div className="text-danger">
                                    {errors.deadline}
                                  </div>
                                ) : null}
                              </div>

                              <div className="form-outline mb-4">
                                <label className="form-label">
                                  İstenen Nitelikler
                                </label>
                                <Field
                                  style={{ maxHeight: "200px" }}
                                  name="description"
                                  type="text"
                                  as="textarea"
                                  className={
                                    "form-control " +
                                    (touched.description && errors.description
                                      ? "is-invalid"
                                      : null)
                                  }
                                />
                                {touched.description && errors.description ? (
                                  <div className="text-danger">
                                    {errors.description}
                                  </div>
                                ) : null}
                              </div>

                              <button
                                className="btn btn-primary btn-block mb-4"
                                type="submit"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Please wait..." : "İlan Ver"}
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
          </div>
        </main>
        <ToastContainer></ToastContainer>
      </body>
    </>
  );
};

export default AddJobAdvertisement;
