import { useState, useEffect } from "react";
import { getIncomeTag } from "./Income/Categories";
import { getExpenseTag } from "./Expense/Categories";
import { ItemModel } from "../services/models";
// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrashCan, faAngleDown, faGhost } from '@fortawesome/free-solid-svg-icons';
// Transition Modules
import { CSSTransition } from "react-transition-group";
import '../styles/ItemList.css';

/**
 * Find the right tag from Income and Expense categories 
 * and return the appropriate JSX element.
 * @param tag the name of the tag.
 */
function getTag(tag:string): JSX.Element|null {
  let res = getIncomeTag(tag);
  if (res !== null) return res;
  res = getExpenseTag(tag);
  if (res !== null) return res;
  return null;
}

/**
 * Represents each item cell in the ItemList component
 */
type ItemProps = { 
  item: ItemModel, 
  totalAmount: number, 
  onClick:Function, clickedID:number|null, 
  onEdit:Function, onDelete:Function 
}
function Item({ item, totalAmount, onClick, clickedID, onEdit, onDelete }: ItemProps): JSX.Element {
  const [t, setT] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (item.id === clickedID)
      setClicked(true);
    else
      setClicked(false);
    setT(false);
  }, [clickedID, t]);

  return (
    <>
      <div 
        className="container mt-4 mb-3" 
        style={{height: 60}}
      >
        <article 
          className="media media-il mt-0"
          style={{cursor: "pointer"}}
          onClick={()=>{ setT(true); onClick(item.id);}}
        >
          <figure className="media-left item-date-col">
            <small>{item.date.getBrief()}</small>
          </figure>
          {/* <figure className="media-left">
            <small>{item.date.getBrief()}</small>
          </figure> */}
          <div className="media-content">
            <div className="content">
              <p>
                <strong>{item.description}</strong><br></br>
                {getTag(item.tag)} 
              </p>
            </div>
          </div>
          <div className="media-right">
            <p className="item-mon">
              <strong>{item.amount.toFixed(2)}</strong><br></br>
              <small>{totalAmount.toFixed(2)}</small>
            </p>
          </div>
        </article>
        <CSSTransition
          in={clicked}
          timeout={500}
          classNames="btn-with-anim"
          unmountOnExit
          appear
        >
          <div className="btn-container" style={{height: 60}}>
            <button 
              className="button is-black"
              onClick={()=>onEdit(item.id)}
            >
              <span className="icon is-centered">
                <FontAwesomeIcon icon={faGear} />
              </span>
            </button>
            <button 
              className="button is-black"
              onClick={()=>onDelete(item.id)}
            >
              <span className="icon is-centered">
                <FontAwesomeIcon icon={faTrashCan} />
              </span>
            </button>
            <button 
              className="button is-black"
              onClick={()=>setClicked(false)}
            >
              <span className="icon is-centered">
                <strong><FontAwesomeIcon icon={faAngleDown} /></strong>
              </span>
            </button>
          </div>
        </CSSTransition>
      </div>
    </>
  )
}

/**
 * Helper component for showing the expense list and income list
 */
type ItemListProps = { items: ItemModel[], onEditClick:Function, onDeleteClick:Function }
function ItemList({ items, onEditClick, onDeleteClick }: ItemListProps): JSX.Element {
  // Calculate the total amount of the items
  let totalAmount:number = 0;
  items.forEach((item) => totalAmount += item.amount);
  // Clicked item state
  const [clickedItem, setClickedItem] = useState<number|null>(null);
  
  if (items.length === 0) {
    return (
      <>
        <p className="no-item-alert-icon">
          <FontAwesomeIcon icon={faGhost} style={{color: "#141414",}} /><br></br>
        </p>
        <p className="no-item-alert">
          No items available
        </p>
      </>
    );
  }

  return (
    <>
      {items.map((item) => {
        const mem = totalAmount;
        totalAmount = totalAmount - item.amount;
        return (
          <Item 
            key={item.id}
            item={item}
            totalAmount={mem}
            onClick={setClickedItem}
            clickedID={clickedItem}
            onEdit={onEditClick}
            onDelete={onDeleteClick}
          />
        )
      })}
    </>
  )
}

export default ItemList;
