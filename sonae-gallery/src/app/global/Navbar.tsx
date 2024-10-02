import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css'; // Estilos da barra de navegação

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/">Galeria</Link>
        </li>
        <li>
          <Link to="/palestras">Palestras</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
