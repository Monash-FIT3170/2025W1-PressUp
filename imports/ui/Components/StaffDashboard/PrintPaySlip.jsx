import React from "react";

export const PrintPaySlip = ({
  employee,
  roleData,
  departmentName,
  startDate,
  endDate,
  totalHours
}) => {
  if (!employee) return null;

  const payRate = roleData?.hourly_rate || 0;
  const subTotal = payRate * totalHours;
  const payPeriod =
    startDate && endDate
      ? `${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString("en-GB")}`
      : "N/A";

  // Create text content
  let str = `Pay Slip for ${employee.first_name} ${employee.last_name}\n\n`;
  str += `Role: ${roleData?.name || "N/A"}\n`;
  str += `Department: ${departmentName || "N/A"}\n`;
  str += `Pay Period: ${payPeriod}\n`;
  str += `Total Hours Worked: ${totalHours.toFixed(2)}h\n`;
  str += `Pay Rate: $${payRate.toFixed(2)}/hour\n`;
  str += `Sub-total: $${subTotal.toFixed(2)}\n`;
  str += `Total: $${subTotal.toFixed(2)}\n`;

  const file = new Blob([str], { type: "text/plain" });

  const downloadPaySlip = () => {
    console.log(str); // optional: logs for debugging
  };

  return (
    <a
      href={URL.createObjectURL(file)}
      className="link"
      download={`Payslip_${employee.first_name}_${employee.last_name}.txt`}
    >
      <div className="button-div">
        <button className="button" onClick={downloadPaySlip}>
          Download Pay Slip
        </button>
      </div>
    </a>
  );
};
