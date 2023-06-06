import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Navbar from "../public/Navbar";
import * as Yup from "yup";
import { SocialMedia } from "../../contracts/SocialMedia";
import { Cv } from "../../requests/CreateCv";
import { JobExperience } from "../../requests/JobExperience";
import { Education } from "../../requests/Education";
import { Language } from "../../contracts/Language";
import { Project } from "../../requests/Project";
import { GetFromLocalStorage } from "../../services/LocalStorageService";
import { jwtDecode } from "../../services/JWTService";
import { getClaims } from "../../services/JWTService";
import { getUserId } from "../../services/JWTService";
import { addCv } from "../../services/CvService";
import { toast, ToastContainer } from "react-toastify";

interface SchoolFormValues {
  school: string;
  major: string;
  grade: string;
  years: string;
  graduate: string;
}

interface ProjectFormValues {
  projectName: string;
  description: string;
}

interface SocialMediaFormValues {
  github: string;
  linkedin: string;
  webSite: string;
}

interface JobExperienceFormValues {
  companyName: string;
  department: string;
  position: string;
  years: string;
  leaveWorkYear: string;
  description: string;
}

interface OtherInformationFormValues {
  skills: string;
  language: string;
  languageLevel: string;
  hobbies: string;
}

interface InformationFormValues {
  information: string;
}

const CvCreate = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [schools, setSchools] = useState<Education[]>([]);
  const [jobExperiences, setJobExperiences] = useState<JobExperience[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageLevel, setLanguageLevel] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [socialMedias, setSocialMedias] = useState<SocialMedia>();
  const [information, setInformation] = useState<string>("");
  const [jobSeekerId, setJobSeekerId] = useState<string>("");

  useEffect(() => {
    let token = GetFromLocalStorage("token");
    let decodedJwt = jwtDecode(token!);
    let roles = getClaims(decodedJwt);
    let id = getUserId(decodedJwt);
    setJobSeekerId(id);
  }, []);

  const createCv = async () => {
    if (schools.length === 0 || information === "" || skills.length === 0) {
      toast.error(`Okul bilginiz, bilgilendirme yazınız ve yetenekleriniz boş olamaz`, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } else {
      let hobby = "";
      hobbies.map((val) => {
        hobby += val + ", ";
      });

      let cvLanguages: Language[] = [];
      for (let index = 0; index < languages.length; index++) {
        cvLanguages[index] = {
          languages: languages[index],
        };
      }

      for (let index = 0; index < languageLevel.length; index++) {
        cvLanguages[index].languageLevel = languageLevel[index];
      }

      let cv: Cv = {
        jobSeekerId: jobSeekerId,
        jobExperiences: jobExperiences,
        educations: schools,
        hobbies: hobby,
        imageUrl: "",
        information: information,
        languages: cvLanguages,
        projects: projects,
        skills: skills,
        socialMedias: socialMedias!,
      };
      console.log(cv);

      addCv(cv).then(response => {
        if (response.data.isSuccess) {
          toast.success(`${response.data.message}`, {
            position: toast.POSITION.BOTTOM_RIGHT,
          });
        }
      }).catch(error => {
        console.log(error)
      })
    }

  };

  const schoolInitialValues: SchoolFormValues = {
    school: "",
    major: "",
    grade: "",
    years: "",
    graduate: "",
  };

  const projectInitialValues: ProjectFormValues = {
    projectName: "",
    description: "",
  };

  const jobExperienceInitialValues: JobExperienceFormValues = {
    companyName: "",
    department: "",
    leaveWorkYear: "",
    position: "",
    years: "",
    description: "",
  };

  const socialMediaInitialValues: SocialMediaFormValues = {
    github: "",
    linkedin: "",
    webSite: "",
  };

  const otherInformationsInitialValues: OtherInformationFormValues = {
    hobbies: "",
    language: "",
    languageLevel: "",
    skills: "",
  };

  const informationInitialValues: InformationFormValues = {
    information: "",
  };

  const schoolSchema = Yup.object({
    school: Yup.string()
      .min(15, "Minimum 15 karakter olmalı")
      .required("Okul adı zorunlu"),
    major: Yup.string()
      .min(10, "Minimum 10 karakter olmalı.")
      .required("Bölüm zorunlu"),
    grade: Yup.string().required("Ortalama/puan zorunlu"),
    years: Yup.string()
      .min(4, "Minimum 4 karakter olmalı")
      .required("Yıl bilgisi zorunlu."),
    graduate: Yup.string()
      .min(4, "Minimum 4 karakter olmalı")
      .required("Durum bilgisi zorunlu"),
  });

  const projectSchema = Yup.object({
    projectName: Yup.string()
      .min(5, "Minimum 5 karakter olmalı")
      .required("Proje ismi boş olamaz"),
    description: Yup.string()
      .min(20, "Minimum 20 karakter olmalı")
      .required("Açıklama boş olamaz"),
  });

  const jobExperienceSchema = Yup.object({
    companyName: Yup.string()
      .min(5, "Minimum 5 karakter olmalı")
      .required("Şirket adı boş olamaz"),
    department: Yup.string()
      .min(5, "Minimum 5 karakter olmalı")
      .required("Departman boş olamaz"),
    position: Yup.string()
      .min(5, "Minimum 5 karakter olmalı")
      .required("Pozisyon boş olamaz"),
    years: Yup.string()
      .min(4, "Minimum 4 karakter olmalı")
      .required("Yıl boş olamaz"),
    leaveWorkYear: Yup.string()
      .min(4, "Minimum 4 karakter olmalı")
      .required("İşten ayrılma yılı boş olamaz"),
    description: Yup.string()
      .min(20, "Minimum 20 karakter olmalı")
      .required("Açıklama boş olamaz"),
  });

  const otherInformationSchema = Yup.object({
    skills: Yup.string().required("Boş olamaz"),
    language: Yup.string()
      .min(5, "Minimum 5 karakter olmak zorunda")
      .required("Zorunlu alan"),
    languageLevel: Yup.string().required("Zorunlu alan"),
    hobbies: Yup.string().required("Boş olamaz"),
    information: Yup.string()
      .min(20, "Minimum 20 karakter olmalı")
      .required("Boş olamaz"),
  });

  const informationSchema = Yup.object({
    information: Yup.string()
      .min(20, "20 karakterden az olamaz")
      .required("Boş olamaz"),
  });

  return (
    <>
      <Navbar></Navbar>
      <section>
        <div className="container">
          <div className="row">
            <div className="col">
              <Formik
                initialValues={schoolInitialValues}
                validationSchema={schoolSchema}
                onSubmit={(values, { resetForm }) => {
                  let school: Education = {
                    school: values.school,
                    major: values.major,
                    grade: values.grade,
                    years: [values.years],
                    graduate: values.graduate,
                  };

                  setSchools((schools) => [...schools, school]);
                  resetForm();
                }}
              >
                {({ touched, errors, values, handleChange }) => (
                  <Form noValidate>
                    <h5>Okul Bilgileri</h5>
                    <div className="card">
                      <div className="card-body px-4 py-5 px-md-5">
                        <div className="row">
                          <div className="col-md-3">
                            <label className="form-label">Okul Adı</label>
                            <input
                              type="text"
                              name="school"
                              value={values.school}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.school && errors.school
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.school && errors.school ? (
                              <div className="text-danger">{errors.school}</div>
                            ) : null}
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Bölüm</label>
                            <input
                              type="text"
                              className={
                                "form-control " +
                                (touched.major && errors.major
                                  ? "is-invalid"
                                  : null)
                              }
                              name="major"
                              value={values.major}
                              onChange={handleChange}
                            ></input>
                            {touched.major && errors.major ? (
                              <div className="text-danger">{errors.major}</div>
                            ) : null}
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Ortalama/Puan</label>
                            <input
                              type="text"
                              name="grade"
                              value={values.grade}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.grade && errors.grade
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.grade && errors.grade ? (
                              <div className="text-danger">{errors.grade}</div>
                            ) : null}
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Yıl</label>
                            <input
                              type="text"
                              name="years"
                              className={
                                "form-control " +
                                (touched.years && errors.years
                                  ? "is-invalid"
                                  : null)
                              }
                              value={values.years}
                              onChange={handleChange}
                            ></input>
                            {touched.years && errors.years ? (
                              <div className="text-danger">{errors.years}</div>
                            ) : null}
                          </div>
                          <div className="col-md-3 mt-3">
                            <label className="form-label">Durum</label>
                            <input
                              type="text"
                              name="graduate"
                              className={
                                "form-control " +
                                (touched.graduate && errors.graduate
                                  ? "is-invalid"
                                  : null)
                              }
                              value={values.graduate}
                              onChange={handleChange}
                            ></input>
                            {touched.graduate && errors.graduate ? (
                              <div className="text-danger">
                                {errors.graduate}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-md-3 mt-3">
                            <button
                              type="submit"
                              className="btn btn-primary mt-4"
                            >
                              Ekle
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>

              {schools.length !== 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Okul Adı</th>
                      <th scope="col">Bölüm</th>
                      <th scope="col">Ortalama/Puan</th>
                      <th scope="col">Yıl</th>
                      <th scope="col">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {schools.map((val, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row">{index}</th>
                          <td>{val.school}</td>
                          <td>{val.major}</td>
                          <td>{val.grade}</td>
                          <td>{val.years}</td>
                          <td>{val.graduate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}

              <Formik
                initialValues={projectInitialValues}
                validationSchema={projectSchema}
                onSubmit={(values, { resetForm }) => {
                  setProjects([...projects, values]);
                  resetForm();
                }}
              >
                {({ isSubmitting, touched, errors, values, handleChange }) => (
                  <Form noValidate>
                    <h5 style={{ marginTop: "20px" }}>Projeleriniz</h5>
                    <div className="card">
                      <div className="card-body px-4 py-5 px-md-5">
                        <div className="row justify-content-center">
                          <div className="col-3">
                            <label className="form-label">Proje Adı</label>
                            <input
                              type="text"
                              name="projectName"
                              value={values.projectName}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.projectName && errors.projectName
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.projectName && errors.projectName ? (
                              <div className="text-danger">{errors.projectName}</div>
                            ) : null}
                          </div>
                          <div className="col-6">
                            <label className="form-label">
                              Proje Açıklaması
                            </label>
                            <textarea
                              className={
                                "form-control " +
                                (touched.description && errors.description
                                  ? "is-invalid"
                                  : null)
                              }
                              name="description"
                              value={values.description}
                              onChange={handleChange}
                            ></textarea>
                            {touched.description && errors.description ? (
                              <div className="text-danger">
                                {errors.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-3 mt-5">
                            <button type="submit" className="btn btn-primary">
                              Ekle
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>

              {projects.length !== 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Proje Adı</th>
                      <th scope="col">Proje açıklaması</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {projects.map((val, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row">{index}</th>
                          <td>{val.projectName}</td>
                          <td>{val.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}

              <Formik
                initialValues={jobExperienceInitialValues}
                validationSchema={jobExperienceSchema}
                onSubmit={(values, { resetForm }) => {
                  setJobExperiences([...jobExperiences, values]);
                  resetForm();
                }}
              >
                {({ isSubmitting, touched, errors, values, handleChange }) => (
                  <Form noValidate>
                    <h5 style={{ marginTop: "20px" }}>İş Tecrübeleri</h5>
                    <div className="card">
                      <div className="card-body px-4 py-5 px-md-5">
                        <div className="row justify-content-center">
                          <div className="col-3">
                            <label className="form-label">Şirket adı</label>
                            <input
                              type="text"
                              name="companyName"
                              value={values.companyName}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.companyName && errors.companyName
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.companyName && errors.companyName ? (
                              <div className="text-danger">
                                {errors.companyName}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-3">
                            <label className="form-label">Departman</label>
                            <input
                              type="text"
                              name="department"
                              value={values.department}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.department && errors.department
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.department && errors.department ? (
                              <div className="text-danger">
                                {errors.department}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-3">
                            <label className="form-label">Pozisyon</label>
                            <input
                              type="text"
                              name="position"
                              value={values.position}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.position && errors.position
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.position && errors.position ? (
                              <div className="text-danger">
                                {errors.position}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-3">
                            <label className="form-label">Yıl</label>
                            <input
                              type="text"
                              name="years"
                              value={values.years}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.years && errors.years
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.years && errors.years ? (
                              <div className="text-danger">{errors.years}</div>
                            ) : null}
                          </div>
                          <div className="col-3 mt-3">
                            <label className="form-label">
                              İşten ayrılma yılı
                            </label>
                            <input
                              type="text"
                              name="leaveWorkYear"
                              value={values.leaveWorkYear}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.leaveWorkYear && errors.leaveWorkYear
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.leaveWorkYear && errors.leaveWorkYear ? (
                              <div className="text-danger">
                                {errors.leaveWorkYear}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-6 mt-3">
                            <label className="form-label">Açıklama</label>
                            <textarea
                              value={values.description}
                              name="description"
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.description && errors.description
                                  ? "is-invalid"
                                  : null)
                              }
                            ></textarea>
                            {touched.description && errors.description ? (
                              <div className="text-danger">
                                {errors.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-3 mt-5">
                            <button type="submit" className="btn btn-primary">
                              Ekle
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>

              {jobExperiences.length !== 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Şirket Adı</th>
                      <th scope="col">Departmanı</th>
                      <th scope="col">Pozisyon</th>
                      <th scope="col">Yıl</th>
                      <th scope="col">İşten ayrılma yılı</th>
                      <th scope="col">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {jobExperiences.map((val, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row">{index}</th>
                          <td>{val.companyName}</td>
                          <td>{val.department}</td>
                          <td>{val.position}</td>
                          <td>{val.years}</td>
                          <td>{val.leaveWorkYear}</td>
                          <td>{val.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}

              <Formik
                initialValues={socialMediaInitialValues}
                onSubmit={(values, { resetForm }) => {
                  let socialMedia: SocialMedia = {
                    github: values.github,
                    linkedin: values.linkedin,
                    webSite: values.webSite,
                  };
                  console.log(socialMedia);

                  setSocialMedias(socialMedia);
                  resetForm();
                }}
              >
                {({ isSubmitting, touched, errors, values, handleChange }) => (
                  <Form noValidate>
                    <h5>Sosyal Medya</h5>
                    <div className="card">
                      <div className="card-body px-4 py-5 px-md-5">
                        <div className="row">
                          <div className="col-3">
                            <label className="form-label">Github</label>
                            <input
                              type="text"
                              name="github"
                              value={values.github}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.github && errors.github
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.github && errors.github ? (
                              <div className="text-danger">{errors.github}</div>
                            ) : null}
                          </div>
                          <div className="col-3">
                            <label className="form-label">Linkedin</label>
                            <input
                              type="text"
                              name="linkedin"
                              value={values.linkedin}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.linkedin && errors.linkedin
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.linkedin && errors.linkedin ? (
                              <div className="text-danger">
                                {errors.linkedin}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-3">
                            <label className="form-label">Web Siteniz</label>
                            <input
                              type="text"
                              name="webSite"
                              value={values.webSite}
                              onChange={handleChange}
                              className={
                                "form-control " +
                                (touched.webSite && errors.webSite
                                  ? "is-invalid"
                                  : null)
                              }
                            ></input>
                            {touched.webSite && errors.webSite ? (
                              <div className="text-danger">
                                {errors.webSite}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-3" style={{ marginTop: "30px" }}>
                            <button type="submit" className="btn btn-primary">
                              Ekle
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>

              {socialMedias ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Github</th>
                      <th scope="col">Linkedin</th>
                      <th scope="col">Web Site</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    <tr>
                      <th scope="row">#</th>
                      <td>
                        {socialMedias?.github ? socialMedias?.github : "-"}
                      </td>
                      <td>
                        {socialMedias?.linkedin ? socialMedias?.linkedin : "-"}
                      </td>
                      <td>
                        {socialMedias?.webSite ? socialMedias?.webSite : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : null}

              <Formik
                initialValues={otherInformationsInitialValues}
                validationSchema={otherInformationSchema}
                onSubmit={() => {}}
              >
                {({ isSubmitting, touched, errors, values, handleChange }) => (
                  <>
                    <Form noValidate>
                      <h5>Diğer Bilgileriniz</h5>
                      <div className="card">
                        <div className="card-body px-4 py-5 px-md-5">
                          <div className="row">
                            <div className="col-3">
                              <div className="form-outline">
                                <label className="form-label">
                                  Yetenekleriniz
                                </label>
                                <input
                                  type="text"
                                  name="skills"
                                  value={values.skills}
                                  onChange={handleChange}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" &&
                                      values.skills !== ""
                                    ) {
                                      setSkills([...skills, values.skills]);
                                      values.skills = "";
                                      event.preventDefault();
                                    }
                                  }}
                                  className={
                                    "form-control " +
                                    (touched.skills && errors.skills
                                      ? "is-invalid"
                                      : null)
                                  }
                                ></input>
                              </div>
                              {touched.skills && errors.skills ? (
                                <div className="text-danger">
                                  {errors.skills}
                                </div>
                              ) : null}
                            </div>
                            <div className="col-3">
                              <label className="form-label">Yabancı Dil</label>
                              <input
                                type="text"
                                name="language"
                                value={values.language}
                                onChange={handleChange}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" &&
                                    values.language !== ""
                                  ) {
                                    setLanguages([
                                      ...languages,
                                      values.language,
                                    ]);
                                    values.language = "";
                                    event.preventDefault();
                                  }
                                }}
                                className={
                                  "form-control " +
                                  (touched.language && errors.language
                                    ? "is-invalid"
                                    : null)
                                }
                              ></input>
                              {touched.language && errors.language ? (
                                <div className="text-danger">
                                  {errors.language}
                                </div>
                              ) : null}
                            </div>
                            <div className="col-3">
                              <label className="form-label">
                                Yabancı Dil Seviyeniz
                              </label>
                              <input
                                type="text"
                                name="languageLevel"
                                value={values.languageLevel}
                                onChange={handleChange}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" &&
                                    values.languageLevel !== ""
                                  ) {
                                    setLanguageLevel([
                                      ...languageLevel,
                                      values.languageLevel,
                                    ]);
                                    values.languageLevel = "";
                                    event.preventDefault();
                                  }
                                }}
                                className={
                                  "form-control " +
                                  (touched.languageLevel && errors.languageLevel
                                    ? "is-invalid"
                                    : null)
                                }
                              ></input>
                              {touched.languageLevel && errors.languageLevel ? (
                                <div className="text-danger">
                                  {errors.languageLevel}
                                </div>
                              ) : null}
                            </div>
                            <div className="col-3">
                              <label className="form-label">Hobileriniz</label>
                              <input
                                type="text"
                                name="hobbies"
                                value={values.hobbies}
                                onChange={handleChange}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" &&
                                    values.hobbies !== ""
                                  ) {
                                    setHobbies([...hobbies, values.hobbies]);
                                    values.hobbies = "";
                                    event.preventDefault();
                                  }
                                }}
                                className={
                                  "form-control " +
                                  (touched.hobbies && errors.hobbies
                                    ? "is-invalid"
                                    : null)
                                }
                              ></input>
                              {touched.hobbies && errors.hobbies ? (
                                <div className="text-danger">
                                  {errors.hobbies}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-3">
                              {skills.length !== 0 ? (
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th scope="col">#</th>
                                      <th scope="col">Yetenek</th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-group-divider">
                                    {skills.map((val, index) => {
                                      return (
                                        <tr key={index}>
                                          <th scope="row">{index}</th>
                                          <td>{val}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : null}
                            </div>
                            <div className="col-3">
                              {languages.length !== 0 ? (
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th scope="col">#</th>
                                      <th scope="col">Yabancı Dil</th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-group-divider">
                                    {languages.map((val, index) => {
                                      return (
                                        <tr key={index}>
                                          <th scope="row">{index}</th>
                                          <td>{val}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : null}
                            </div>
                            <div className="col-3">
                              {languageLevel.length !== 0 ? (
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th scope="col">#</th>
                                      <th scope="col">Yabancı Dil Seviyesi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-group-divider">
                                    {languageLevel.map((val, index) => {
                                      return (
                                        <tr key={index}>
                                          <th scope="row">{index}</th>
                                          <td>{val}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : null}
                            </div>
                            <div className="col-3">
                              {hobbies.length !== 0 ? (
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th scope="col">#</th>
                                      <th scope="col">Hobi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-group-divider">
                                    {hobbies.map((val, index) => {
                                      return (
                                        <tr key={index}>
                                          <th scope="row">{index}</th>
                                          <td>{val}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button type="submit" className={"invisible"}></button>
                    </Form>
                  </>
                )}
              </Formik>

              <Formik
                initialValues={informationInitialValues}
                validationSchema={informationSchema}
                onSubmit={(values, { resetForm }) => {
                  setInformation(values.information);
                  resetForm();
                }}
              >
                {({ isSubmitting, touched, errors, values, handleChange }) => (
                  <Form noValidate>
                    <div className="row justify-content-center">
                      <div className="col-6">
                        <label className="form-label">Hakkınızda.</label>
                        <textarea
                          name="information"
                          value={values.information}
                          onChange={handleChange}
                          className={
                            "form-control " +
                            (touched.information && errors.information
                              ? "is-invalid"
                              : null)
                          }
                          placeholder="Kendinizi tanıtın..."
                        ></textarea>
                        {touched.information && errors.information ? (
                          <div className="text-danger">
                            {errors.information}
                          </div>
                        ) : null}
                        <button type="submit" className="btn btn-primary mt-3">
                          Ekle
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => createCv()}
              >
                Cv Ekle
              </button>
            </div>
          </div>
        </div>
        <ToastContainer></ToastContainer>
      </section>
    </>
  );
};

export default CvCreate;
