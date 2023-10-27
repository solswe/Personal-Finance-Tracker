// Income/Categories.tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { cloneElement, useState } from 'react';

export const incomeTags:{ [category:string] : JSX.Element} = {
  'BUSINESS': <span key='1' className="tag is-danger is-light">Business</span>,
  'DIVIDEND': <span key='2' className="tag is-primary is-light" >Dividend</span>,
  'GOVERNMENT': <span key='3' className="tag is-info is-light">Government</span>,
  'INTEREST': <span key='4' className="tag" style={{backgroundColor: "lavender"}}>Interest</span>,
  'INVESTMENT': <span key='5' className="tag is-link is-light">Investment</span>,
  'PENSION': <span key='6' className="tag" style={{backgroundColor: "lavenderblush"}}>Pension</span>,
  'SALARY': <span key='7' className="tag" style={{backgroundColor: "lemonchiffon"}}>Salary</span>,
  'OTHER': <span key='8' className="tag" style={{backgroundColor: "whitesmoke"}}>Other</span>
}

/**
 * Returns the background color property of a tag.
 * If not found, returns null.
 */
export function getTagBackgroundColor(tag:string): string|null {
  if (tag.toUpperCase() in incomeTags)
    return incomeTags[tag].props.style.backgroundColor;
  else
    return null
}

/**
 * Returns the JSX tag component that matches the tag name as input.
 * If not found, returns null.
 */
export function getIncomeTag(tag:string): JSX.Element|null {
  if (tag.toUpperCase() in incomeTags) 
    return incomeTags[tag];
  else 
    return null;
}

/**
 * Returns all JSX income tag componenets.
 * @returns All JSX elements of tags
 */
export function getAllIncomeTags(onTagClick:Function): JSX.Element[] {
  let values: JSX.Element[] = [];
  for (let category in incomeTags) {
    let value = incomeTags[category];
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
function IncomeCategories({ onTagClick }: ExpenseCategoriesProps): JSX.Element{

  const [toggle, setToggle] = useState(false);
  
  let button;
  if (toggle) {
    button = <FontAwesomeIcon icon={faChevronUp} className='is-pulled-right fold-icon'/>
  } else {
    button = <FontAwesomeIcon icon={faChevronDown} className='is-pulled-right fold-icon'/>
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
          { getAllIncomeTags(onTagClick) }
          <span 
            key='9' 
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

export default IncomeCategories;
