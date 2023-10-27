import http from "../http-common"
import { JSONObject, JSONArray } from "../util/json";

export interface Data {
  net_income_flow: JSONObject[];
  net_income_list: JSONObject[];
}

/**
 * Security issue: date time access should not be happening
 * inside of the frontend. Use the server time.
 */
class GraphDataService {
  get(userId: number, scale:string) {
    return http.get<Data>(`/users/${userId}/graphData?scale=${scale}`);
  }
}

export default new GraphDataService();