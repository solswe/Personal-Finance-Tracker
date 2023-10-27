import budgetService from "../../services/budget.service";
import { useState } from 'react'

type ExpenseBudgetFormProps = { handleClick: Function };
function ExpenseBudget({ handleClick }:ExpenseBudgetFormProps):JSX.Element{
  const [expenseBudgetValue, setExpenseBudgetValue] = useState<string>('');
  return(
    <>
      <div className="container mt-5 has-background-grey-dark">
        <div className="field-body">
          <input 
            className="input is-primary" 
            type="number"
            placeholder='Type your budget'
            step="0.01"
            value={expenseBudgetValue}
            onChange={e => {
              const validated = e.target.value.match(/^(\d*\.{0,1}\d{0,2}$)/)
              if (validated) {
                setExpenseBudgetValue(e.target.value)
              }
            }}
          />
          <button 
            className="button is-small is-primary is-outlined is-pulled-right mt-3"
            onClick={()=>handleClick(parseFloat(expenseBudgetValue))}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}

export default ExpenseBudget;