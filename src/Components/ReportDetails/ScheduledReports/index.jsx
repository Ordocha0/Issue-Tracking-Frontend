import { useState } from "react";
import style from "./index.module.css";
import { MdArrowBackIosNew, MdArrowForwardIos, MdAdd } from "react-icons/md";


const Header = () => {


  return (
    <div className={style.container} >
              <div className={style.filters} >
                <input type="search" placeholder="Search" className={style.search} />
                <select>
                  <option selected>Today</option>
                </select>
                <select>
                  <option selected>Today</option>
                </select>
                <select>
                  <option selected>Today</option>
                </select>
              </div>
             <div className={style.tableDiv} >
               <h1>Recent Reports</h1>
     
               <table className={style.table} >
                 <thead className={style.thead} >
                   <tr>
                     <th>Report Name</th>
                     <th>Frequency</th>
                     <th>Next Run</th>
                     <th>Format</th>
                     <th>Recipients</th>
                     <th></th>
                   </tr>
                 </thead>
                 <tbody className={style.tbody} >
                    <tr>
                     <td>Monthly Revenue Report</td>
                     <td><p className={style.type}>Revenue</p></td>
                     <td>	2025-12-02 </td>
                     <td><p className={style.format}>PDF</p></td>
                     <td>admin@ispos.com</td>              
                    <td>
                    <img src="/Icons/pencil.png" alt="Edit" className={style.moreIcon} />
                    <img src="/Icons/delete.png" alt="Delete" className={style.moreIcon} />
                    </td>
                   </tr>
                    <tr>
                     <td>Monthly Revenue Report</td>
                     <td><p className={style.type}>Revenue</p></td>
                     <td>	2025-12-02 </td>
                     <td><p className={style.format}>PDF</p></td>
                     <td>admin@ispos.com</td>              
                    <td>
                    <img src="/Icons/pencil.png" alt="Edit" className={style.moreIcon} />
                    <img src="/Icons/delete.png" alt="Delete" className={style.moreIcon} />
                    </td>
                   </tr>
                    <tr>
                     <td>Monthly Revenue Report</td>
                     <td><p className={style.type}>Revenue</p></td>
                     <td>	2025-12-02 </td>
                     <td><p className={style.format}>PDF</p></td>
                     <td>admin@ispos.com</td>              
                    <td>
                    <img src="/Icons/pencil.png" alt="Edit" className={style.moreIcon} />
                    <img src="/Icons/delete.png" alt="Delete" className={style.moreIcon} />
                    </td>
                   </tr>
                    <tr>
                     <td>Monthly Revenue Report</td>
                     <td><p className={style.type}>Revenue</p></td>
                     <td>	2025-12-02 </td>
                     <td><p className={style.format}>PDF</p></td>
                     <td>admin@ispos.com</td>              
                    <td>
                    <img src="/Icons/pencil.png" alt="Edit" className={style.moreIcon} />
                    <img src="/Icons/delete.png" alt="Delete" className={style.moreIcon} />
                    </td>
                   </tr>
                 </tbody>
               </table>
     
               <div className={style.pagination} >
                 <div>
                   <button>First</button>
                   <button>Previous</button>
                 </div>
                 <p>Showing 1 to 6 of 50 </p>
                 <div>
                   <button>Next</button>
                   <button>Last</button>
                 </div>
               </div>
     
             </div>
    </div>

  )
};

export default Header;
