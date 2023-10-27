import { useState, useEffect } from "react";
import chartEx from "../assets/chartEx.png";
import IncomeGoal from "../components/Budget/IncomeGoal";
import ExpenseBudget from "../components/Budget/ExpenseBudget";
import LineChart from "../components/LineChart";

// Fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

// API Services
import { ExpenseModel } from "../services/models";
import { JSONObject, JSONArray, JSONValue } from "../util/json";
import { ExpenseListDeserializer } from "../services/deserializers";
import budgetService from "../services/budget.service";
import netIncomeService from "../services/net-income.service";
import graphDataService from "../services/graph-data.service";
import upcomingExpensesService from "../services/upcoming-expenses.service";

// Util functions
import { Map, getKeys, getValues } from "../util/utils";

function Budget(){
  // FIXIT: Require a real User ID
  // Use Params and localStorage
  const tmpUserID = 2;
  // Change state when API loading is successful
  const [loaded, setLoaded] = useState(false);
  // Throw error message when `error` is not null
  const [error, setError] = useState<any>(null);
  // Budget States
  const [incomeGoal, setIncomeGoal] = useState<number>(0.0);
  const [monthlyTotalIncome, setMonthlyTotalIncome] = useState<number>(0.0);
  const [expenseBudget, setExpenseBudget] = useState<number>(0.0);
  const [monthlyTotalExpense, setMonthlyTotalExpense] = useState<number>(0.0);
  const [netIncome, setNetIncome] = useState<number>(0.0);
  const [upcomingExpenses, setUpcomingExpenses] = useState<ExpenseModel[]>([]);
  // Chart States
  const [graphScale, setGraphScale] = useState<string>('');
  const [data, setData] = useState<any>({
    datasets: [{
      data: []
    }]
  });

  /**
   * Retrieve user's income goal and total income this month.
   */
  const fetchIncomeGoal = async() => {
    budgetService.get(tmpUserID, "incomeGoal=true")
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data);
        setIncomeGoal(response.data.income_goal);
        setMonthlyTotalIncome(response.data.monthly_total_income);
      } else {
        // failure
        setError({
          code: 'Unknown Error',
          message: 'Unable to fetch data.'
        });
      }
    })
    .catch(error => {
      // failure
      console.error('Error:', error);
      setError(error);
    });
  }

  /**
   * Retrieve user's expense budget and total expense this month.
   */
  const fetchExpenseBudget = async() => {
    budgetService.get(tmpUserID, "expenseBudget=true")
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data);
        setExpenseBudget(response.data.expense_budget);
        setMonthlyTotalExpense(response.data.monthly_total_expense);
      } else {
        // failure
        setError({
          code: 'Unknown Error',
          message: 'Unable to fetch data.'
        });
      }
    })
    .catch(error => {
      // failure
      console.error('Error:', error);
      setError(error);
    });
  }

  /**
   * Retrieve the amount of net income so far.
   */
  const fetchNetIncome = async() => {
    netIncomeService.get(tmpUserID)
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data);
        setNetIncome(parseFloat(response.data['net_income'] as string));
      } else {
        // failure
        setError({
          code: 'Unknown Error',
          message: 'Unable to fetch data.'
        });
      }
    })
    .catch(error => {
      // failure
      console.error('Error:', error);
      setError(error);
    });
  }

  /**
   * Retrieve the net income data of the previous 5 months + current month
   */
  const fetchGraphData = async() => {
    graphDataService.get(tmpUserID, graphScale)
    .then(response => {
      if (response.status === 200) {
        // success
        //console.log(response.data);
        const keys = getKeys(response.data.net_income_flow);
        const values = getValues(response.data.net_income_flow);
        const history = getValues(response.data.net_income_list)
        console.log(keys, values, history);
        setData({
          labels: keys,
          datasets: [{
            label: 'Money Flow',
            data: values
          }, {
            label: 'Net Income History',
            data: history
          }]
        });
        console.log(data);
      } else {
        // failure
        setError({
          code: 'Unknown Error',
          message: 'Unable to fetch data.'
        });
      }
    })
    .catch(error => {
      // failure
      console.error('Error:', error);
      setError(error);
    });
  }

  /**
   * Retrieve recurring expenses in next 30 days
   */
  const fetchUpcomingExpensesList = async() => {
    upcomingExpensesService.get(tmpUserID)
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data);
        const expenseListDeserializer = new ExpenseListDeserializer(response.data);
        setUpcomingExpenses(expenseListDeserializer.data());
      } else {
        // failure
        setError({
          code: 'Unknown Error',
          message: 'Unable to fetch data.'
        });
      }
    })
    .catch(error => {
      // failure
      console.error('Error:', error);
      setError(error);
    });
  }

  const fetchAPI = async() => {
    await fetchIncomeGoal();
    await fetchExpenseBudget();
    await fetchNetIncome();
    //await fetchGraphData();
    await fetchUpcomingExpensesList();
    await setLoaded(true);
  }
  
  // Set title
  useEffect(() => {
    document.title = 'Birdie!';
    if (!loaded) {
      fetchAPI();
    }
    fetchGraphData();
  }, [loaded, graphScale]);
  
  const [incomeToggle, setIncomeToggle] = useState(false);
  // let incomeGoalForm;
  // if (incomeToggle) {
  //   incomeGoalForm = ;
  // }; 


  const [expenseToggle, setExpenseToggle] = useState(false);
  // let expenseBudgetForm;
  // if (expenseToggle) {
  //   expenseBudget = 
  // }; 

  /**
   * Change the scale of the graph when one of the buttons
   * in the LineChart component is clicked.
   */
  const handleButtonClick = (value:string) => {
    console.log(`Graph Scale: ${value}`);
    setGraphScale(value);
  }

  /**
   * Update income goal when the value of the income goal is changed.
   */ 
  const handleIncomeGoalFormSubmit = async(value:number) => {
    budgetService.update(tmpUserID, `incomeGoal=${value}`)
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data);
        setIncomeGoal(response.data.income_goal)
        setMonthlyTotalIncome(response.data.monthly_total_income)
        setIncomeToggle(false);
      } else {
        // failure
        setError({
          code: 'Unknown Error',
          message: 'Unable to fetch data.'
        });
      }
    })
    .catch(error => {
      // failure
      console.error('Error:', error);
      setError(error);
    });
  }

  /**
   * Update budget goal when the value of the budget goal is changed.
   */ 
  const handleBudgetGoalFormSubmit = async(value:number) => {
    budgetService.update(tmpUserID, `expenseBudget=${value}`)
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data);
        setExpenseBudget(response.data.expense_budget)
        setMonthlyTotalExpense(response.data.monthly_total_expense)
        setExpenseToggle(false)
      } else {
        // failure
        setError({
          code: 'Unknown Error',
          message: 'Unable to fetch data.'
        });
      }
    })
    .catch(error => {
      // failure
      console.error('Error:', error);
      setError(error);
    });
  }

  return (
    <>
      <div className="container">
        <section 
          className="hero has-background-white"
          style={{
            margin: '5% 3%',
            boxShadow: '0 0 0 2px rgba(255, 255, 255, 1), 0.3em 0.3em 3rem rgba(50, 50, 50, 0.1)',
            borderRadius: '0.5rem'
          }}
        >
          <div className="hero-body">
            {/* <p className="title net-font">In my pocket: $1500</p> */}
            <p className="title net-font">Net income</p>
            <p className="title net-font">${netIncome}</p>
          </div>
          <LineChart 
            data={data} 
            handleButtonClick={handleButtonClick}/>
        </section>
        
        <div className="columns is-multiline">
          <div className="column home-cont is-5-desktop">
            <article className="notification tile-bud has-background-grey-dark">
              <div className="media-content">
                <p className="bud-item-title is-pulled-left">Income goal</p>
                <button className="button is-small bud-edit-button">
                  <FontAwesomeIcon 
                    className="bud-edit-icon" 
                    icon={faPenToSquare} 
                    style={{color: "#ffffff",}}
                    onClick={() => setIncomeToggle(!incomeToggle)}
                  />   
                </button>
                {incomeToggle && 
                  <IncomeGoal 
                    handleClick={handleIncomeGoalFormSubmit}
                  />
                }
              </div>

              {!incomeToggle && (
                <>
                  <div className="media-content written-progress">
                    <p className="bud-item-mon">${monthlyTotalIncome}/${incomeGoal}</p>
                  </div>
                  <progress 
                    className={"progress is-medium " 
                      + ((monthlyTotalIncome/incomeGoal*100.0) > 100.0 ? "is-success" : "is-warning")}
                    value={`${monthlyTotalIncome/incomeGoal*100.0}`} 
                    max="100"></progress>
                </>
              )}

            </article>
          </div>

          <div className="column home-cont is-5-desktop">
            <article className="notification tile-bud has-background-grey-darker">
              <div className="media-content">
                <p className="bud-item-title is-pulled-left">Expense budget</p>
                <button className="button is-small bud-edit-button">
                  <FontAwesomeIcon 
                    className="bud-edit-icon" 
                    icon={faPenToSquare} 
                    style={{color: "#ffffff",}}
                    onClick={() => setExpenseToggle(!expenseToggle)}
                  />   
                </button>
                {expenseToggle && 
                  <ExpenseBudget
                    handleClick={handleBudgetGoalFormSubmit}
                  />
                }
              </div>

              {!expenseToggle && (
                <>
                  <div className="media-content written-progress">
                    <p className="bud-item-mon">${monthlyTotalExpense}/${expenseBudget}</p>
                  </div>
                  <progress 
                    className={"progress is-medium " 
                      + (monthlyTotalExpense/expenseBudget*100.0 > 100.0 ? "is-danger" : "is-primary")}
                    value={`${monthlyTotalExpense/expenseBudget*100.0}`} 
                    max="100"></progress>
                </>
              )}
            </article>
          </div>

          <div className="column home-cont">
            <article className="notification tile-bud has-background-black-ter">
              <div className="media-content upcoming-title">
                <div className="content has-text-white">
                  <p className="bud-item-title">Upcoming expense</p>
                </div>
              </div>
              
              {upcomingExpenses.map(expense => {
                return (
                  <article key={expense.id} className="media media-il">
                    <figure className="media-left has-text-white">
                      <small>{expense.date.getBrief()}</small>
                    </figure>
                    <div className="media-content">
                      <div className="content">
                        <p>
                          <strong className="has-text-white">
                            {expense.description}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="media-right">
                      <p className="item-mon">
                        <strong className="has-text-white">${expense.amount}</strong><br></br>
                      </p>
                    </div>
                  </article>
                )
              })}
            </article>
          </div>
        </div>
      </div>
    </> 
  )
}

export default Budget;