import http from "../http-common"
import { JSONArray } from "../util/json";

class UpcomingExpensesService {
  get(userId: number) {
    return http.get<JSONArray>(`/users/${userId}/upcomingExpenses`);
  }
}

export default new UpcomingExpensesService();