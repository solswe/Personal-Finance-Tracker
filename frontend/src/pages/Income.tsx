import { useEffect, useState } from "react";
// Components
import ItemList from "../components/ItemList";
import AddIncome from "../components/Income/AddIncome";
import IncomeCategories from "../components/Income/Categories";
import Monthly from "../components/MonthlyChart";
import ErrorPopup from "../components/ErrorPopup";
// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
// API fetching helpers
import IncomeService from "../services/income.service";
import { DateField, IncomeModel } from "../services/models";
import { IncomeListDeserializer } from "../services/deserializers";
import { IncomeSerializer } from "../services/serializers";
// Util functions
import { Map } from "../util/utils";


function Income(){
  // FIXIT: Require a real User ID
  // Use Params and localStorage
  const tmpUserID = 2;
  // Change state when loading is successful
  const [loaded, setLoaded] = useState(false);
  // Change state when retrieving is failed
  const [error, setError] = useState<any>(null);
  // List of Income objects
  const [incomeList, setIncomeList] = useState(Array<IncomeModel>);
  // Stat data
  const [dataset, setDataset] = useState<Map>();

  // States for conditional query
  const [year, setYear] = useState<number>((new DateField()).year);
  const [month, setMonth] = useState<number>((new DateField()).month);
  const [source, setSource] = useState<string|null>(null);

  // Active Income
  const [mode, setMode] = useState<string>('none');
  const [active, setActive] = useState<boolean>(false);
  const [activeIncome, setActiveIncome] = useState<IncomeModel>(new IncomeModel());
  
  /**
   * Fetch the user income history from API.
   */
  const fetchIncomeList = async() => {
    // HTTP Request to get the income list.
    // TODO: After backend update, change `getAll` 
    // to `retrieveByConditions`.
    IncomeService.retrieveByConditions(tmpUserID, year, month, source)
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data)
        console.log(response.data.list);
        console.log(response.data.stat);
        const incomeListDeserializer = new IncomeListDeserializer(response.data.list);
        setIncomeList(incomeListDeserializer.data());
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
   * Add an income.
   */
  const handleAddIncome = async() => {
    activeIncome.userId = tmpUserID;
    const incomeSerializer = new IncomeSerializer(activeIncome);
    IncomeService.create(tmpUserID, incomeSerializer.data())
    .then(response => { // FIXIT: Debuggin Purpose
      if (response.status === 201) {
        // success
        console.log(response.data);
        // reload
        setLoaded(false);
        // reset active item
        setActive(false);
        setActiveIncome(new IncomeModel());
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
   * Modify the information of income and update.
   * @param id 
   */
  const handleModifyIncome = async() => {
    const id = activeIncome.id ? activeIncome.id : -1;
    const incomeSerializer = new IncomeSerializer(activeIncome);
    IncomeService.update(id, incomeSerializer.data())
    .then(response => {
      if (response.status === 200) {
        // success
        console.log(response.data);
        // reload
        setLoaded(false);
        // reset active item
        setActive(false);
        setActiveIncome(new IncomeModel());
      } else {
        // failure
        console.log(response);
        setError({
          code: 'Unknown Error',
          message: 'Unable to edit data.'
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
   * Delete an income.
   * @param id 
   */
  const handleDeleteIncome = async(id:number) => {
    IncomeService.delete(id)
    .then(response => {
      if (response.status === 204) {
        // success
        console.log(response.data);
        // reload
        setLoaded(false);
        // reset active item
        setActive(false);
        setActiveIncome(new IncomeModel());
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
   * on the Income Form is clicked.
   * It distinguishes the mode between 'add' or 'edit' and
   * execute the appropriate handling function.
   * When the handling is done, it closes the form and 
   * reset the 'Active Income.'
   */
  const handleFormSubmit = async() => {
    console.log(mode);
    if (mode === 'add') {
      handleAddIncome();
    } else if (mode === 'edit') {
      handleModifyIncome();
    }
  }

  /**
   * A callback function activated when the 'Cancel' button
   * on the Income Form is clicked.
   * It cancels the editing mode and closes the form.
   */
  const handleFormCancel = () => {
    setActive(false);
    setActiveIncome(new IncomeModel());
  }

  /**
   * A callback function activated when the 'Edit' button 
   * of a Item component is clicked. 
   * The ID indicates which income item should be edited.
   * @param id Item ID passed from the Item component.
   */
  const handleEditClick = (id:number) => {
    setActive(true); setMode('edit');
    const currIncome = incomeList.find(income => income.id === id);
    if (currIncome) {
      setActiveIncome(currIncome);
    }
  }

  /**
   * A callback function activated when the 'Delete' button 
   * of a Item component is clicked.
   * The ID indicates which income item would be deleted.
   * @param id Item ID passed from the Item component.
   */
  const handleDeleteClick = (id:number) => {
    handleDeleteIncome(id);
    setActive(false);
  }

  /**
   * A callback function activated when one of the tags
   * is clicked.
   * Reload the expense list after fetch data by conditions.
   */
  const handleTagClick = (category:string|null) => {
    setSource(category);
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
    document.title = 'My income';

    if (!loaded) {  // Initialize Income List
      fetchIncomeList();
    }
  }, [dataset, year, month, source, loaded]);

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
              <IncomeCategories onTagClick={handleTagClick}/>
              <section className="hero is-small is-dark hero-item">
                <div className="hero-body p-1">
                  <p className="hero-title">Income Items</p>
                  <p className="has-text-right"><small>Click the item to edit/delete</small></p>
                </div>
              </section>
              <ItemList 
                items={incomeList} 
                onEditClick={handleEditClick} 
                onDeleteClick={handleDeleteClick}
              />
            </div>
          </div>
        </div>
        :
        <AddIncome
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          activeIncome={activeIncome}
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

export default Income;