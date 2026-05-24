// lib/setup.service.ts
import { all } from "axios";
import api from "./api";



export const SetupService = {

  getMenus: async (page = 1, pageSize = 10) => {
    return api.get("/Setup/menu", {
      params: { page, pageSize },
    });
  },



    GetSummaryMenus(page: number = 1, pageSize: number = 10, search: string = "") {
      alert
  return api.get(`/Setup/menu-summary?page=${page}&pageSize=${pageSize}&search=${search}`);
},

  createMenu(data: any) {  
    //console.log("Creating user with data:", data);
    return api.post("/Setup/menu", data);
  },

       updateMenu(id: string, data: any) {
  return api.put(`/Setup/menu/${id}`, data);
},

 deleteMenu(id: string) {
    return api.delete(`/Setup/menu/${id}`);
  },


  getAgencies(page: number = 1, pageSize: number = 10, search: string = "") {

  return api.get(`/Setup/agency?page=${page}&pageSize=${pageSize}&search=${search}`);
},

  createAgency(data: any) {    
    //console.log("Creating user with data:", data);
    return api.post("/Setup/agency", data);
  },
  
  updateAgency(id: string, data: any) {
  return api.put(`/Setup/agency/${id}`, data);
},

  deleteAgency(id: string) {
    return api.delete(`/Setup/agency/${id}`);
  },




    getBranches(page: number = 1, pageSize: number = 10, search: string = "") {

  return api.get(`/Setup/branch?page=${page}&pageSize=${pageSize}&search=${search}`);
},

  createBranch(data: any) {    
    //console.log("Creating user with data:", data);
    return api.post("/Setup/branch", data);
  },

    updateBranch(id: string, data: any) {
  return api.put(`/Setup/branch/${id}`, data);
},


  deleteBranch(id: string) {
    return api.delete(`/Setup/branch/${id}`);
  },



      getPermissions(page: number = 1, pageSize: number = 10, search: string = "") {

  return api.get(`/Setup/permission?page=${page}&pageSize=${pageSize}&search=${search}`);
},

  createPermission(data: any) {    
    //console.log("Creating user with data:", data);
    return api.post("/Setup/permission", data);
  },

     updatePermission(id: string, data: any) {
  return api.put(`/Setup/permission/${id}`, data);
},

  deletePermission(id: string) {
    return api.delete(`/Setup/permission/${id}`);
  },




      getModules(page: number = 1, pageSize: number = 10, search: string = "") {

  return api.get(`/Setup/module?page=${page}&pageSize=${pageSize}&search=${search}`);
},

  createModule(data: any) {    
    //console.log("Creating user with data:", data);
    return api.post("/Setup/module", data);
  },

       updateModule(id: string, data: any) {
  return api.put(`/Setup/module/${id}`, data);
},

 deleteModule(id: string) {
    return api.delete(`/Setup/module/${id}`);
  },


        getRolePermissions(page: number = 1, pageSize: number = 10, search: string = "") {

  return api.get(`/Setup/role-permission?page=${page}&pageSize=${pageSize}&search=${search}`);
},

  assignRolePermissions(data: any) {    
    //console.log("Creating user with data:", data);
    return api.post("/Setup/role-permission", data);
  },

   deleteRolePermission(id: string) {
    return api.delete(`/Setup/role-permission/${id}`);
  },


  
   getMenusSingle() {
    return api.get("/Setup/menus-summary");
  },


          getMenuPermissions(page: number = 1, pageSize: number = 10, search: string = "") {

  return api.get(`/Setup/menu-permission?page=${page}&pageSize=${pageSize}&search=${search}`);
},

  AssignMenuPermissions(data: any) {    
    //console.log("Creating user with data:", data);
    return api.post("/Setup/menu-permission", data);
  },



 // DELETE: Corrected to use ID in the path
  RemoveMenuPermissions: (id: string | number) => {
    return api.delete(`/Setup/menu-permission/${id}`);
  },


// UPDATE: Corrected to use ID in the path
  UpdateMenuPermissions: (id: string | number, data: any) => {
    return api.put(`/Setup/menu-permission/${id}`, data);
  },


};


