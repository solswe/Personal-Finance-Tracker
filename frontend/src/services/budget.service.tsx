import http from "../http-common"
import { JSONObject, JSONArray } from "../util/json";

// Axios generic functions don't instantiate objects
// Thus, it requires explicit deserialization of JSON data. 

class BudgetService {
  get(id: number, params: string) {
    return http.get(`/users/${id}/budget?${params}`);
  }

  update(id: number, params: string) {
    return http.put(`/users/${id}/budget?${params}`);
  }
}

export default new BudgetService();
