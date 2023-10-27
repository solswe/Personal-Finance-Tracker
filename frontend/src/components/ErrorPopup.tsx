import { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import '../styles/ErrorPopup.css';

type ErrorPopupProps = { errorCode:string, errorMessage:string, onClose:Function };
function ErrorPopup({ errorCode, errorMessage, onClose }: ErrorPopupProps): JSX.Element {
  const [isMount, setIsMount] = useState<boolean>(false);

  useEffect(() => {
    setIsMount(true);
  }, [])

  return (
    <> 
      <CSSTransition
        in={isMount}
        timeout={500}
        classNames="popup-transition"
        unmountOnExit
        appear
      >
      <div className='layover'>
        <article className="error-message message is-danger">
          <div className="message-header">
            <p>{errorCode}</p>
            <button 
              className="delete" 
              aria-label="delete"
              onClick={()=>onClose()}
            ></button>
          </div>
          <div className="message-body">
            {errorMessage}
          </div>
        </article>
      </div>
      </CSSTransition>
    </>
  )
}

export default ErrorPopup;