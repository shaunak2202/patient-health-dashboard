import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const createPatient = (data) => api.post("/patients", data);
export const listPatients = () => api.get("/patients");
export const getPatient = (id) => api.get(`/patients/${id}`);
export const deletePatient = (id) => api.delete(`/patients/${id}`);
