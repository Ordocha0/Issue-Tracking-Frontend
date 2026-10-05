import React from "react";
import style from "./index.module.css";

const CustomAlert = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={style.overlay}>
      <div className={style.alertBox}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className={style.actions}>
          <button className={style.cancelBtn} onClick={() => onConfirm(false)}>
            Cancel
          </button>
          <button className={style.confirmBtn} onClick={() => onConfirm(true)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;