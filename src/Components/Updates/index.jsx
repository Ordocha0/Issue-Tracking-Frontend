import React from "react";
import style from "./index.module.css";
import PropTypes from "prop-types";
import { MdClose, MdCelebration } from "react-icons/md";
import updateReleaseNotes from "../../utils/update-steps.js";

const UpdatesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { currentVersion, changelog } = updateReleaseNotes;

  const handleClose = () => {
    // Save the current version to localStorage so they don't see this specific update again
    localStorage.setItem("lastSeenUpdateVersion", currentVersion);
    onClose();
  };

  return (
    <div className={style.overlay} onClick={handleClose}>
      <div className={style.container} onClick={(e) => e.stopPropagation()}>
        
        {/* Upper Header Row */}
        <div className={style.topMetaRow}>
          <div className={style.progressContainer}>
            <span className={style.progressText}>System Update v{currentVersion}</span>
          </div>
          <button onClick={handleClose} className={style.closeIconButton}>
            <MdClose />
          </button>
        </div>

        {/* Dynamic Updates Content Frame */}
        <div className={style.tourBody} style={{ flexDirection: "column", alignItems: "stretch", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", alignSelf: "center" }}>
            <MdCelebration style={{ color: "#FFD700", fontSize: "28px" }} />
            <h1 style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontSize: "22px", color: "#0B0324" }}>
              See What's New!
            </h1>
          </div>

          {/* Scrollable container if you have multiple updates */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", maxHeight: "280px", paddingRight: "4px" }}>
            {changelog.map((item, index) => (
              <div key={index} className={style.routerPageContent}>
                <div style={{ display: "flex", justifyContent: "between", alignItems: "center", width: "100%" }}>
                  <span className={style.badgeLabel} style={{ margin: 0 }}>
                    {item.badge}
                  </span>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "11px", color: "#8A8A8A", marginLeft: "auto" }}>
                    {item.date}
                  </span>
                </div>
                
                <div className={style.routeCardHeader}>
                  <h2>{item.title}</h2>
                  {item.method && <code>{item.method}</code>}
                </div>
                <p className={style.routeDescription}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className={style.actionFooter}>
          <div /> {/* Spacing placeholder */}
          <button type="button" onClick={handleClose} className={style.primaryActionBtn}>
            Got It, Thanks!
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdatesModal;

UpdatesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};