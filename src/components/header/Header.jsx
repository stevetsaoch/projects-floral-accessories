import { useState, useEffect } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { selectCurrentUser } from '../../redux/user/user-selectors';
import { selectCartHidden, selectCartItemsCount } from '../../redux/cart/cart-selectors';
import { selectMessageHidden } from '../../redux/wishlist/wishlist-selectors';
import { toggleCartHidden } from '../../redux/cart/cart-actions';
import { toggleMessageHidden } from '../../redux/wishlist/wishlist-actions';

import SaleMessage from '../sale-message/SaleMessage';
import SideNav from '../side-nav/SideNav';
import CartIcon from '../cart-icon/cartIcon';
import CartDropdown from '../cart-dropdown/CartDropdown';
import PopupMessage from '../popup-message/PopupMessage';
import HeaderDirectory from '../header-directory/HeaderDirectory';
import Search from '../search/Search';

import styles from './header.module.scss';

import CompanyLogo from '../../assets/logo_transparent_cut.png';
import { ReactComponent as SideNavIcon } from '../../assets/sidenav-icon.svg';
import { ReactComponent as ContactIcon } from '../../assets/contact-icon.svg';
import { ReactComponent as UserIcon } from '../../assets/user-icon-2.svg';

const Header = ({ history }) => {
  // react-redux hooks
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const cartHidden = useSelector(selectCartHidden);
  const messageHidden = useSelector(selectMessageHidden);
  
  // local state for displaying sidenav & directory
  const [showSideNav, setShowSideNav] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);

  // set timer to hide cart after 4 seconds
  useEffect(() => {
    let timer = setTimeout(() => dispatch(toggleCartHidden(true)), 4000);
    return () => clearTimeout(timer); // to clear the previous effect before executing the next effect (if user click multiple times)
  }, [cartItemsCount, dispatch]);

  // set timer to hide popup message after 4 seconds
  useEffect(() => {
    let timer = setTimeout(() => dispatch(toggleMessageHidden(true)), 4000);
    return () => clearTimeout(timer); // to clear the previous effect before executing the next effect (if user click multiple times)
  }, [messageHidden, dispatch]);

  // if user is signed in, redirect sign in page to user profile page
  const redirect = () => {
    currentUser ? history.push('/user-profile') : history.push('/sign-in');
  }
  
  return (
    <header className={styles.header}>

      <SideNav showSideNav={showSideNav} setShowSideNav={setShowSideNav}/>
      { messageHidden ? null : <PopupMessage /> }
      
      <SaleMessage />

      <div className={styles.mainHeader}>
        <div className={styles.leftOptions}>
          <SideNavIcon className={styles.sideNavIcon} onClick={() => setShowSideNav(showSideNav => !showSideNav)}/>
          <Search />
        </div>
        <Link to='/'>
          <img src={CompanyLogo} className={styles.companyLogo} alt='company logo'/>
        </Link>
        <div className={styles.rightOptions}>
          <Link to='/contact-us'>
            <ContactIcon className={styles.contactIcon}/>
          </Link>
          <UserIcon className={styles.userIcon} onClick={redirect} />
          <div 
            className={styles.cartGroup} 
            onMouseEnter={() => dispatch(toggleCartHidden(false))} 
            onMouseLeave={() => dispatch(toggleCartHidden(true))}
          >
            <Link to='/cart'>
              <CartIcon />
            </Link>
            { cartHidden || cartItemsCount === 0 ? null : <CartDropdown /> }
          </div>
        </div>
      </div>

      <nav className={styles.categoryList}>
        <Link to='/shop/new-arrival'><span>新品上市</span></Link>
        <div 
          className={styles.directory}
          onMouseEnter={() => setShowDirectory(true)}
          onMouseLeave={() => setShowDirectory(false)}
        >
          <Link to='/shop'><span>商品分類</span></Link>
          { showDirectory ? <HeaderDirectory setShowDirectory={setShowDirectory} /> : null }
        </div>
        <Link to='/under-construction'><span>會員專區</span></Link>
        <Link to='/under-construction'><span>潮流話題</span></Link>
      </nav>

    </header>
  )
}

export default withRouter(Header);