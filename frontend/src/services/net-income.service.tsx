import http from "../http-common"
import { JSONObject, JSONArray } from "../util/json";

class NetIncomeService {
  get(userId: number) {
    const today = new Date();
    const year:number = today.getFullYear();
    const month:number= today.getMonth()+1;
    const day:number  = today.getDate();
    return http.get<JSONObject>(`/users/${userId}/netIncome?year=${year}&month=${month}&day=${day}`);
  }
}

export default new NetIncomeService();