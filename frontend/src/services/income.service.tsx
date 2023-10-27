import http from "../http-common"
import { JSONObject, JSONArray } from "../util/json";

// Axios generic functions don't instantiate objects
// Thus, it requires explicit deserialization of JSON data. 

export interface IncomeResponseData {
  list: JSONArray;
  stat: JSONArray;
}

class IncomeModelService {
  getAll(userId: number) {
    return http.get<IncomeResponseData>(`/users/${userId}/incomes`);
  }

  get(id: number) {
    return http.get<JSONObject>(`/income/${id}`);
  }

  create(userId:number, data: JSONObject) {
    return http.post<JSONObject>(`/users/${userId}/incomes`, data);
  }

  update(id: number, data: JSONObject) {
    return http.put<any>(`/income/${id}`, data);
  }

  delete(id: number) {
    return http.delete<any>(`/income/${id}`);
  }

  deleteAll(userId: number) {
    return http.delete<any>(`/users/${userId}/incomes`);
  }

  /* FIXIT: Temporary DateField Value -> Conditional Retrieve */
  // TODO: Implement conditional retrieve function.
  retrieveByConditions(userId: number, year:number, month:number, source:string|null) {
    // TODO: get year and month from the date
    //  and find expenses by date.
    return http.get<IncomeResponseData>(`/users/${userId}/incomes?year=${year}&month=${month}${source !== null ? `&source=${source}` : ''}`);
  }
}

export default new IncomeModelService();
