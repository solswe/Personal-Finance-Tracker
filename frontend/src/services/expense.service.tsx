import http from "../http-common"
import { JSONObject, JSONArray } from "../util/json";

// Axios generic functions don't instantiate objects
// Thus, it requires explicit deserialization of JSON data. 

export interface ExpensesResponseData {
  list: JSONArray;
  stat: JSONArray;
}

class ExpenseModelService {
  getAll(userId: number) {
    return http.get<ExpensesResponseData>(`/users/${userId}/expenses`);
  }

  get(id: number) {
    return http.get<JSONObject>(`/expense/${id}`);
  }

  create(userId:number, data: JSONObject) {
    return http.post<JSONObject>(`/users/${userId}/expenses`, data);
  }

  update(id: number, data: JSONObject) {
    return http.put<any>(`/expense/${id}`, data);
  }

  delete(id: number) {
    return http.delete<any>(`/expense/${id}`);
  }

  deleteAll(userId: number) {
    return http.delete<any>(`/users/${userId}/expenses`);
  }

  /* FIXIT: Temporary DateField Value -> Conditional Retrieve */
  // TODO: Implement conditional retrieve function.
  retrieveByConditions(userId: number, year:number, month:number, category: string|null) {
    // TODO: get year and month from the date
    //  and find expenses by date.
    return http.get<ExpensesResponseData>(
      `/users/${userId}/expenses?year=${year}&month=${month}${category !== null ? `&category=${category}` : ''}`
    );
  }
}

export default new ExpenseModelService();
