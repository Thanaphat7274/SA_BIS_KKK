import React from "react";

const Evaluation = ({ userRole, userName }) => {
    const [sel_emp, setSelectedEmployee] = React.useState("");
        const [warn_msg, setWarningMessage] = React.useState("");
    
        const handleSubmit = (e) => {
            e.preventDefault();
            if (!sel_emp) {
                setWarningMessage("กรุณาเลือกพนักงาน");
            } else {
                setWarningMessage("");
                // ทำการส่งข้อมูลหรือเปลี่ยนหน้า
            }
        };
  return (
            <div className="p-4">
                <h1 
                className="text-2xl font-bold">กรุณาเลือกข้อมูลพนักงานจากเมนูด้านขล่าง</h1>
                <form onSubmit={handleSubmit} 
                className="mt-4 flex flex-col gap-3 max-w-sm " aria-label="ฟอร์มเลือกพนักงาน">
                <select className="mt-2 p-2 border border-gray-300 rounded " 
                   value={sel_emp} onChange={(e) => setSelectedEmployee(e.target.value)}
                     aria-label="เลือกพนักงาน"
                     aria-invalid={!!warn_msg}
                >
                    <option value="" disabled>-- เลือกพนักงาน --</option>
                    <option value="employee1">พนักงาน 1</option>
                    <option value="employee2">พนักงาน 2</option>
                    <option value="employee3">พนักงาน 3</option>
                    </select>

                <select className="mt-2 p-2 border border-gray-300 rounded " 
                   value={sel_emp} onChange={(e) => setSelectedEmployee(e.target.value)}
                     aria-label="เลือกพนักงาน"
                     aria-invalid={!!warn_msg}
                >
                    <option value="" disabled>-- ตำเเหน่งงาน --</option>
                    <option value="employee1">พนักงาน 1</option>
                    <option value="employee2">พนักงาน 2</option>
                    <option value="employee3">พนักงาน 3</option>
                    </select>
                    {warn_msg && <p className="text-red-500">{warn_msg}</p>}

                    <div className="flex justify-center ">

                    <button type="submit" className="self-start mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer w-autoself-start mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer w-auto " aria-label="ยืนยันการเลือกพนักงาน ">
                        ยืนยัน
                    </button>
                    </div>
                </form>
               
            </div>
        );
    };

export default Evaluation;
