import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { logout } from '../store'

const Navbar = ({ handleClick, isLoggedIn }) => (
  <div className='navbar navbar-expand-md navbar-dark sticky-top bg-dark py-0'>
    <Link to='/' className='navbar-brand' >CryptoCoinAlgo</Link>
    <nav className='collapse navbar-collapse' id='navbar-collapse'>
      <ul className='navbar-nav mr-auto'>
        {isLoggedIn && <li className='nav-item'><Link className='nav-link' to='/dashboard'>Dashboard</Link></li>}
        <li className='nav-item'><Link className='nav-link' to='/market'>Market</Link></li>
        <li className='nav-item'><Link className='nav-link' to='/algorithm'>Algorithm</Link></li>
        {isLoggedIn && <li className='nav-item'><Link className='nav-link' to='/historicaldata'>Historical Data</Link></li>}
      </ul>
      <ul className='navbar-nav'>
        {isLoggedIn && <li className='nav-item'>
          <a href='#' onClick={handleClick}>
            Logout
                </a>
        </li>
        }
        {!isLoggedIn && <li className='nav-item'>
          <Link className='nav-link' to='/login'>Login</Link>
        </li>
        }
        {!isLoggedIn && <li className='nav-item'>
          <Link className='nav-link' to='/signup'>Sign Up</Link>
        </li>
        }
      </ul>
    </nav>
  </div>
)

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    isLoggedIn: !!state.user.id
  }
}

const mapDispatch = dispatch => {
  return {
    handleClick() {
      dispatch(logout())
    }
  }
}

export default connect(mapState, mapDispatch)(Navbar)

/**
 * PROP TYPES
 */
Navbar.propTypes = {
  handleClick: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}
