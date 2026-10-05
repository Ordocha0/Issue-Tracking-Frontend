import style from "./index.module.css";
import { NavLink } from "react-router-dom";
const pages = [
  "Dashboard",
  "Summary",
  "Sales by Day",
  "Revenue Trend",
  "Packages",
  "Stations",
  "Top customers",
];
import {useScreenWidth} from "./titan.js";
const Header = () => {
  const screenWidth = useScreenWidth();
  console.log(screenWidth);
  const isCollapsed = screenWidth > 1500;
  const lettercount = screenWidth > 1300;
  console.log(isCollapsed);

  return (
    <div className={style.container} >
      <div className={style.header} >
        <img src="/Images/crayLogo.png" alt="Logo" className={style.logo} />
        {isCollapsed && <h1 className={style.title}>CRAY GROUP LTD</h1>}
      </div>

      <div className={style.sidebar} >
        <h1>OVERVIEW</h1>
        <NavLink to="/dashboard"><img src="/Icons/Dashboard.png" alt="Dashboard" title="Dashboard" className={style.icon} />{lettercount && "Dashboard"}</NavLink>

        <h1>CLIENTS</h1>
        <NavLink to="/accounts"> <img src="/Icons/Ppoe.png" alt="Accounts" title="Accounts" className={style.icon} />{lettercount && " PPoE Subscribers"}</NavLink>
         <NavLink to="/orders" > <img src="/Icons/Orders.png" alt="Orders" title="Orders" className={style.icon} /> {lettercount && "Orders"}</NavLink>
          <NavLink to="/packages" > <img src="/Icons/Packages.png" alt="Packages" title="Packages" className={style.icon} />{lettercount && "Packages"}</NavLink>

        <h1>BILLINGS</h1>
        <NavLink to="/billings" > <img src="/Icons/Invoices.png" alt="Billings" title="Billings" className={style.icon} /> {lettercount && "Invoices"}</NavLink>
         <NavLink to="/payments"> <img src="/Icons/Payment.png" alt="Payments" title="Payments" className={style.icon} /> {lettercount && "Payments"}</NavLink>
          <NavLink to="/vouchers"> <img src="/Icons/Vouchers.png" alt="Vouchers" title="Vouchers" className={style.icon} /> {lettercount && "Vouchers"}</NavLink>


        <h1>Network</h1>
        <NavLink to="/hotspot" > <img src="/Icons/Hotspot.png" alt="" className={style.icon} /> {lettercount && "Hotspot"}</NavLink>
         <NavLink to="/sessions" > <img src="/Icons/Accounts.png" alt="Sessions" title="Sessions" className={style.icon} /> {lettercount && "Accounts"}</NavLink>
          <NavLink to="/networkdevices"> <img src="/Icons/Devices.png" alt="Devices" title="Devices" className={style.icon} />{lettercount && "Devices"}</NavLink>
           <NavLink to="/monitoring" > <img src="/Icons/Monitoring.png" alt="Monitoring" title="Monitoring" className={style.icon} /> {lettercount && "Monitoring"}</NavLink>

        <h1>COMMUNICATION & SUPPORT</h1>
        <NavLink to="/messaging"> <img src="/Icons/Message.png" alt="Messaging" title="Messaging" className={style.icon} /> {lettercount && "Messaging"}</NavLink>
         <NavLink> <img src="/Icons/Tickets.png" alt="Tickets" title="Tickets" className={style.icon} /> {lettercount && "Ticketing"}</NavLink>

                 <h1>Reports</h1>
        <NavLink to="/auditlog"> <img src="/Icons/Audit.png" alt="Audit" title="Audit" className={style.icon} /> {lettercount && "Audit Log"}</NavLink>
         <NavLink to="/reports" > <img src="/Icons/Report.png" alt="Reports" title="Reports" className={style.icon} /> {lettercount && "Reports"}</NavLink>

                 <h1>SYSTEM ADMINISTRATION</h1>
        <NavLink to="/configuration" > <img src="/Icons/Configuration.png" alt="Configuration" title="Configuration" className={style.icon} /> {lettercount && "Configuration"}</NavLink>
         <NavLink> <img src="/Icons/Settings.png" alt="Settings" title="Settings" className={style.icon} /> {lettercount && "Settings"}</NavLink>
      </div>
    </div>

  )
};

export default Header;
