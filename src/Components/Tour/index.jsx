import React, { useState } from "react";
import style from "./index.module.css";
import PropTypes from "prop-types";
import { 
  MdArrowBack, 
  MdArrowForward, 
  MdClose,
  MdSpeed,
  MdOutlineExplore,
  MdDashboard,
  MdMenuOpen,
  MdPeopleOutline,
  MdReceiptLong,
  MdRouter,
  MdWifiTethering,
  MdSms,
  MdBarChart,
  MdSearch,
  MdNotificationsActive,
  MdSettings,
  MdCelebration
} from "react-icons/md";
import steps from "../../utils/tour-steps.js";

const TourModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = steps;
  const activeStepData = tourSteps[currentStep];
  const totalSteps = tourSteps.length;

  const getStepIcon = (title) => {
    switch (title) {
      case "Real-Time Dashboard":
        return <MdDashboard />;
      case "Navigation Sidebar":
        return <MdMenuOpen />;
      case "Client Management":
        return <MdPeopleOutline />;
      case "Packages & Plans":
        return <MdSpeed />;
      case "Billing & Payments":
        return <MdReceiptLong />;
      case "Network Monitoring":
        return <MdRouter />;
      case "Hotspot Management":
        return <MdWifiTethering />;
      case "Messaging Center":
        return <MdSms />;
      case "Reports & Analytics":
        return <MdBarChart />;
      case "Quick Search":
        return <MdSearch />;
      case "Notifications":
        return <MdNotificationsActive />;
      case "System Configuration":
        return <MdSettings />;
      case "You're All Set! 🚀":
        return <MdCelebration style={{ color: "#FFD700" }} />;
      default:
        return <MdOutlineExplore />;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <div className={style.overlay} onClick={handleClose}>
      <div className={style.container} onClick={(e) => e.stopPropagation()}>

        {/* Upper Meta Row: Progress Bar & Exit Control */}
        <div className={style.topMetaRow}>
          <div className={style.progressContainer}>
            <span className={style.progressText}>Step {currentStep + 1} of {totalSteps}</span>
            <div className={style.progressBarWrapper}>
              <div
                className={style.progressBarIndicator}
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <button onClick={handleClose} className={style.closeIconButton}>
            <MdClose />
          </button>
        </div>

        {/* Dynamic Card Body Content Frame */}
        <div className={style.tourBody}>
          {activeStepData.type === "welcome" ? (
            <div className={style.welcomeContent}>
              <img src={activeStepData.logo} alt="ISP Manager Logo" className={style.welcomeLogo} />
              <h1>{activeStepData.title}</h1>
              <h2>{activeStepData.subtitle}</h2>
              <p>{activeStepData.desc}</p>
            </div>
          ) : (
            <div className={style.highlightContent}>
              <div className={style.iconBadge}>
                {getStepIcon(activeStepData.title)}
              </div>
              <h1>{activeStepData.title}</h1>
              <p>{activeStepData.desc}</p>
            </div>
          )}
        </div>

        {/* Dynamic Action Buttons Interface */}
        <div className={style.actionFooter}>
          {/* Skip Tour stays anchored on the left throughout the steps */}
          {currentStep < totalSteps - 1 ? (
            <button type="button" onClick={handleClose} className={style.skipTextBtn}>
              Skip Tour
            </button>
          ) : (
            <div /> // Keeps the spacing clean on the last step
          )}

          {/* Navigation group anchored on the right */}
          <div className={style.rightNavGroup}>
            {currentStep > 0 && (
              <button type="button" onClick={handleBack} className={style.secondaryActionBtn}>
                <MdArrowBack /> Back
              </button>
            )}
            
            <button type="button" onClick={handleNext} className={style.primaryActionBtn}>
              {currentStep === 0 ? "Get Started" : currentStep === totalSteps - 1 ? "Finish" : "Next Step"}{" "}
              <MdArrowForward />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TourModal;

TourModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};