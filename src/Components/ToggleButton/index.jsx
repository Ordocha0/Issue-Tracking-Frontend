import styles from "./index.module.css";
import PropTypes from 'prop-types';
import { useState } from "react";

const ToggleButton = (props) => 
  {
    const [check, setChecked] = useState(props.check);
    return(
      <div className={styles.container}>
        <input type="checkbox" id={props.id} className={styles.input} onChange={() => setChecked(!check)} checked={check}  />
        <label className={styles.check} htmlFor={props.id} />
      </div>
    );
  }
ToggleButton.propTypes = {
  id: PropTypes.string,
  check: PropTypes.bool
}

export default ToggleButton