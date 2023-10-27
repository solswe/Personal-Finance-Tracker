import { useState } from 'react'

type IncomeGoalFormProps = { handleClick: Function };
function IncomeGoal({ handleClick }:IncomeGoalFormProps):JSX.Element {
  const [incomeGoalValue, setIncomeGoalValue] = useState<string>('');
  return (
    <>
      <div className="container mt-5 has-background-grey-dark">
        <div className="field-body">
          <input 
            className="input is-primary" 
            type="number"
            placeholder='Type your goal'
            step="0.01"
            value={incomeGoalValue}
            onChange={e => {
              const validated = e.target.value.match(/^(\d*\.{0,1}\d{0,2}$)/)
              if (validated) {
                setIncomeGoalValue(e.target.value)
              }
            }}
          />
          <button 
            className="button is-small is-primary is-outlined is-pulled-right mt-3"
            onClick={()=>handleClick(parseFloat(incomeGoalValue))}>
              Save
          </button>
        </div>
      </div>
    </>
  )
}

export default IncomeGoal;