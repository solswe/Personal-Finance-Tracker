import { Link } from 'react-router-dom';

function Navbar(){
    return (
      <>
        <nav className="navbar has-background-black is-fixed-top" role="navigation" aria-label="main navigation">
          <div>
            <div className='is-pulled-left'>
              <Link className="nav-item nav-logo has-text-white-bis has-text-weight-bold" to="/budget">Birdie!</Link>
              <Link className="nav-item has-text-white-bis" to="/income">Income</Link>
              <Link className="nav-item has-text-white-bis" to="/expense">Expense</Link>
            </div>
            <div className="button is-small is-primary is-outlined is-pulled-right">Logout</div>
          </div>
        </nav>
      </>
    )
}

export default Navbar;