import { useState, useEffect } from "react";
// Components
import ItemList from "../components/ItemList";
import AddExpense from "../components/Expense/AddExpense";
import ExpenseCategories from "../components/Expense/Categories";
import Monthly from "../components/MonthlyChart";
import ErrorPopup from "../components/ErrorPopup";
// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
// API fetching helpers
import ExpenseService from "../services/expense.service";
import { DateField, ExpenseModel } from "../services/models";
import { ExpenseListDeserializer } from "../services/deserializers";
import { ExpenseSerializer } from "../services/serializers";
// Util functions
import { Map } from "../util/utils";

/// Pass User Id via Prop
function Expense(){
  // FIXIT: Require a real User ID
  // Use Params and localStorage
  const tmpUserID = 2;
  // Change state when API loading is successful
  const [loaded, setLoaded] = useState(false);
  // Change state when retrieving is failed
  const [error, setError] = useState<any>(null);
  // List of Expense objects
  const [expenseList, setExpenseList] = useState(Array<ExpenseModel>);
  // Stat data
  const [dataset, setDataset] = useState<Map>();

  // States for conditional query
  const [year, setYear] = useState<number>((new DateField()).year);
  const [month, setMonth] = useState<number>((new DateField()).month);
  const [category, setCategory] = useState<string|null>(null);

  // Active Expense
  const [mode, setMode] = useState<string>('none');
  const [active, setActive] = useState<boolean>(false);
  const [activeExpense, setActiveExpense] = useState<ExpenseModel>(new ExpenseModel());
  
  /**
   * Fetch the user expense history from API.
   */
  const fetchExpenseList = async() => {
    // HTTP Request to get the expense list.
    // TODO: After backend update, change `getAll` 
    // to `retrieveByConditions`.
    ExpenseService.retrieveByConditions(tmpUserID, year, month, category)
    .then(response => {
      if (response.status === 200 && response.data) {
        // success
        console.log(response.data.list);
        console.log(response.data.stat);
        const expenseListDeserializer = new ExpenseListDeserializer(response.data.list);
        setExpenseList(expenseListDeserializer.data());
        setDataset(response.data.stat);
        setLoaded(true);
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
   * Add an expense.
   */
  const handleAddExpense = async() => {
    activeExpense.userId = tmpUserID;
    const expenseSerializer = new ExpenseSerializer(activeExpense);
    ExpenseService.create(tmpUserID, expenseSerializer.data())
    .then(response => { // FIXIT: Debuggin Purpose
      if (response.status === 201) {
        // success
        console.log(response.data);
        // reload
        setLoaded(false);
        // reset active item
        setActive(false);
        setActiveExpense(new ExpenseModel());
      } else {
        // failure
        console.log(response);
        setError({
          code: 'Unknown Error',
          message: 'Unable to add data.'
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
   * Modify the information of expense and update.
   * @param id 
   */
  const handleModifyExpense = async() => {
    const id = activeExpense.id ? activeExpense.id : -1;
    const expenseSerializer = new ExpenseSerializer(activeExpense);
    ExpenseService.update(id, expenseSerializer.data())
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data);
        // reload
        setLoaded(false);
        // reset active item
        setActive(false);
        setActiveExpense(new ExpenseModel());
      } else {
        // failure
        console.log(response);
        setError({
          code: 'Unknown Error',
          message: 'Unable to modify data.'
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
   * Delete an expense.
   * @param id 
   */
  const handleDeleteExpense = async(id:number) => {
    ExpenseService.delete(id)
    .then(response => {
      if (response.status === 204) {
        // success
        console.log(response.data);
        // reload
        setLoaded(false);
        // reset active item
        setActive(false);
        setActiveExpense(new ExpenseModel());
      } else {
        // failure
        console.log(response);
        setError({
          code: 'Unknown Error',
          message: 'Unable to delete data.'
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
   * A callback function activated when the 'Save' button
   * on the Expense Form is clicked.
   * It distinguishes the mode between 'add' or 'edit' and
   * execute the appropriate handling function.
   * When the handling is done, it closes the form and 
   * reset the 'Active Expense.'
   */
  const handleFormSubmit = async() => {
    console.log(mode);
    if (mode === 'add') {
      handleAddExpense();
    } else if (mode === 'edit') {
      handleModifyExpense();
    }
  }

  /**
   * A callback function activated when the 'Cancel' button
   * on the Expense Form is clicked.
   * It cancels the editing mode and closes the form.
   */
  const handleFormCancel = () => {
    setActive(false);
    setActiveExpense(new ExpenseModel());
  }

  /**
   * A callback function activated when the 'Edit' button 
   * of a Item component is clicked. 
   * The ID indicates which expense item should be edited.
   * @param id Item ID passed from the Item component.
   */
  const handleEditClick = (id:number) => {
    setActive(true); setMode('edit');
    const currExpense = expenseList.find(expense => expense.id === id);
    if (currExpense) {
      setActiveExpense(currExpense);
    }
  }

  /**
   * A callback function activated when the 'Delete' button 
   * of a Item component is clicked.
   * The ID indicates which expense item would be deleted.
   * @param id Item ID passed from the Item component.
   */
  const handleDeleteClick = (id:number) => {
    handleDeleteExpense(id);
    setActive(false);
  }

  /**
   * A callback function activated when one of the tags
   * is clicked.
   * Reload the expense list after fetch data by conditions.
   */
  const handleTagClick = (category:string|null) => {
    setCategory(category);
    setLoaded(false);
  }

  /**
   * A callback function activated when the left arrow 
   * in the month div is clicked.
   * Loads the expense list of the previous month.
   */
  const handleMonthLeftClick = async() => {
    const getMonth = async() => {
      if (month-1 === 0) {
        setMonth(12);
        setYear(year-1);
      } else {
        setMonth(month-1);
      }
    }

    await getMonth();
    await setLoaded(false);
  }

  /**
   * A callback function activated when the right arrow 
   * in the month div is clicked.
   * Loads the expense list of the next month.
   */
  const handleMonthRightClick = async() => {
    const getMonth = async() => {
      if (month+1 === 13) {
        setMonth(1);
        setYear(year+1);
      } else {
        setMonth(month+1);
      }
    }

    await getMonth();
    await setLoaded(false);
  }

  // Set title
  useEffect(() => {
    document.title = 'My expense';

    if (!loaded) {  // Initialize Expense List
      fetchExpenseList();
    }
  }, [dataset, year, month, category, loaded]);
    
  return (
    <>
      { !active ? 
        <div className="container">
          <div className="columns">
            <div className="column">
              <Monthly
                dataset={dataset}
                year={year}
                month={month}
                onLeftClick={handleMonthLeftClick}
                onRightClick={handleMonthRightClick}
              />
            </div>

            <div className="column">
              <ExpenseCategories onTagClick={handleTagClick}/>
              <section className="hero is-small is-dark hero-item">
                <div className="hero-body p-1">
                  <p className="hero-title">Expense Items</p>
                  <p className="has-text-right"><small>Click the item to edit/delete</small></p>
                </div>
              </section>
              <ItemList 
                items={expenseList} 
                onEditClick={handleEditClick} 
                onDeleteClick={handleDeleteClick}
              />
            </div>
          </div>
        </div>
        :
        <AddExpense 
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          activeExpense={activeExpense}
        />
      }

      <div className="container">
        <button 
          className="add-button"
          onClick={()=>{ setActive(true); setMode('add'); }}
        >
        <FontAwesomeIcon icon={faCirclePlus} size="2xl" style={{color: "#000000",}} />
        </button>
      </div>

      { // Error Pop-Up Window
        error &&
        <ErrorPopup 
          errorCode={error.code}
          errorMessage={error.message}
          onClose={()=>setError(null)}
        />
      }
    </> 
  )
}

export default Expense;