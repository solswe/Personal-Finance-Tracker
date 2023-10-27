// Expense/Categories.tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { cloneElement, useState } from 'react';

export const expenseTags:{ [category:string] : JSX.Element } = {
  'DEBT': <span key='1' className="tag" style={{backgroundColor: "papayawhip"}}>Debt</span> ,
  'EDUCATION': <span key='2' className="tag" style={{backgroundColor: "honeydew"}}>Education</span>,
  'ENTERTAINMENT': <span key='3' className="tag" style={{backgroundColor: "mistyrose"}}>Entertainment</span>,
  'FOOD': <span key='4' className="tag is-primary is-light">Food</span>,
  'HOUSEHOLD': <span key='5' className="tag" style={{backgroundColor: "lemonchiffon"}}>Household</span>,
  'HOUSING': <span key='6' className="tag" style={{backgroundColor: "paleturquoise"}}>Housing</span>,
  'INSURANCE': <span key='7' className="tag is-info is-light">Insurance</span>,
  'INVESTMENT': <span key='8' className="tag" style={{backgroundColor: "lightcyan"}}>Investment</span>,
  'MEDICAL': <span key='9' className="tag" style={{backgroundColor: "peachpuff"}}>Medical</span>,
  'SAVING': <span key='10' className="tag is-danger is-light">Saving</span>,
  'SHOPPING': <span key='11' className="tag is-link is-light">Shopping</span>,
  'SUBSCRIPTION': <span key='12' className="tag is-success is-light" >Subscription</span>,
  'TRANSPORTATION': <span key='13' className="tag" style={{backgroundColor: "lavender"}}>Transportation</span>,
  'OTHER': <span key='14' className="tag" style={{backgroundColor: "whitesmoke"}}>Other</span>,
}

/**
 * Returns the background color property of a tag.
 * If not found, returns null.
 */
export function getTagBackgroundColor(tag:string): string|null {
  if (tag.toUpperCase() in expenseTags)
    return expenseTags[tag].props.style.backgroundColor;
  else
    return null
}

/**
 * Returns the JSX tag component that matches the tag name as input.
 * If not found, returns null.
 */
export function getExpenseTag(tag:string): JSX.Element|null {
  if (tag.toUpperCase() in expenseTags) 
    return expenseTags[tag];
  else 
    return null;
}

/**
 * Returns all JSX income tag componenets.
 * @returns All JSX elements of tags
 */
export function getAllExpenseTags(onTagClick:Function): JSX.Element[] {
  let values: JSX.Element[] = [];
  for (let category in expenseTags) {
    let value = expenseTags[category];
    values.push(cloneElement(value, 
      { 
        style: { ...value.props.style, cursor:'pointer' }, 
        onClick: ()=>{ onTagClick(category) } 
      })
    );
  }

  return values;
}

// Click handler to notify what tag is seleted.
type ExpenseCategoriesProps = { onTagClick: Function };
function ExpenseCategories({ onTagClick }: ExpenseCategoriesProps): JSX.Element {

  const [toggle, setToggle] = useState(false);
  
  let button;
  if (toggle) {
    button = <FontAwesomeIcon icon={faChevronUp}/>
  } else {
    button = <FontAwesomeIcon icon={faChevronDown}/>
  };

  return (
    <>
      <section className="hero is-small is-dark">
        <div className="hero-body p-1">
          <p className='hero-title is-pulled-left'>Categories</p>
          <div className='is-pulled-right fold-icon' onClick={() => setToggle(!toggle)}>
            {button}
          </div>
        </div>
      </section>

      { toggle && (
        <div className="tags tag-container">
          { getAllExpenseTags(onTagClick) }
          <span 
            key='15' 
            className="tag" 
            style={{
              backgroundColor: "white",
              cursor:'pointer'
            }}
            onClick={()=>onTagClick(null)}
          >
            All
          </span>
        </div>
      )}
    </>
  )
}

export default ExpenseCategories;