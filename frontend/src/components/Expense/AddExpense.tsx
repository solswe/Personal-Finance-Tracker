import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDollarSign } from '@fortawesome/free-solid-svg-icons';

// Get Expense Category
import { expenseTags } from './Categories';
import { standardizeString, getKeys } from '../../util/utils';

// Expense POST Tools
import { convertDateToField, ExpenseModel } from '../../services/models';

// TODO: Add interval field
type AddExpenseProps = { onSubmit:Function, onCancel:Function, activeExpense: ExpenseModel }
function AddExpense({ onSubmit, onCancel, activeExpense }:AddExpenseProps): JSX.Element{

  // Form values
  const [item, setItem] = useState(activeExpense.description);
  const [category, setCategory] = useState(activeExpense.tag);
  const [spending, setSpending] = useState(activeExpense.amount);
  const [date, setDate] = useState(activeExpense.date.toString());
  const [recurring, setRecurring] = useState(activeExpense.recurring);

  const saveDate = async() => {
    activeExpense.amount = spending;
    activeExpense.tag = category;
    activeExpense.description = item;
    activeExpense.recurring = recurring;
    activeExpense.date = convertDateToField(date);
  }

  const handleSave = async () => {
    await saveDate();
    await onSubmit();
  }

  return (
    <>
      <section className="hero is-small is-dark">
        <p className="hero-subtitle">Expense</p>
      </section>

      <div className="container p-5">
        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Item</label>
          </div>
          <div className="field-body">
            <p className="control has-icons-left has-icons-right">
              {/* Get item description */}
              <input className="input is-primary" type="text" 
                value={item} 
                onChange={e => setItem(e.target.value)}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faCheck} />
              </span>
            </p>
          </div>
        </div>

        <div className="field is-horizontal">      
          <div className="field-label is-normal">
            <label className="label">Categories</label>
          </div>
          <div className="field-body control">
            <div className="select is-primary">
              {/* Get category */}
              <select defaultValue={category} onChange={e => setCategory(e.target.value)}>
                <option value="none" disabled hidden>Select category</option>
                { 
                  getKeys(expenseTags).map((key, i) => 
                    <option key={i} value={key}>
                      {standardizeString(key)}
                    </option>
                  )
                }     
              </select>
            </div>
          </div>
        </div>
        
        <div className="field is-horizontal">      
          <div className="field-label is-normal">
            <label className="label">Spending</label>
          </div>
          <div className="field-body">
            <p className="control has-icons-left">
              {/* Get expense amount */}
              <input 
                className="input is-primary"
                type="number"
                placeholder='0.00'
                step="0.01"
                value={spending}
                onChange={e => {
                  const validated = e.target.value.match(/^(\d*\.{0,1}\d{0,2}$)/)
                  if (validated) {
                    setSpending(parseFloat(e.target.value))
                  }
                }}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faDollarSign} />
              </span>
            </p>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Date</label>
          </div>
          <div className="field-body">
            {/* Get date of expense */}
            <input className="input is-primary" type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}></input>
          </div>
        </div>

        <div className='field is-horizontal'>
          <div className='field-label is-normal'>
            <label className='label'>Recurring</label>
          </div>
          <div className='field-body control'>
            {/* Get recurring */}
            <label className="radio">
              <input type="radio" name="question" 
                onChange={e => setRecurring(true)} />
              &nbsp; Yes
            </label>&nbsp;
            <label className="radio">
              <input type="radio" name="question" checked 
                onChange={e => setRecurring(false)} />
              &nbsp; No
            </label>
          </div>
        </div>

        <div className="buttons mt-5 is-pulled-right">
          <p className="control">
            <button className="button is-black"
              onClick={()=>handleSave()}>
              Save
            </button>
            <button className="button is-black is-outlined"
              onClick={()=>onCancel()}>
              Cancel
            </button>
          </p>
        </div>
      </div>
    </>
  )
}

export default AddExpense;