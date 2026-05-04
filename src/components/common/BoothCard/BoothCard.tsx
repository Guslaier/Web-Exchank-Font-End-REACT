import { ReactSVG } from "react-svg";
import deleteIcon from "../../../assets/svg/delete.svg";
import "./BoothCard.css";
import type { BoothData } from "../../../types/entities";
import React from "react";
import { userService, type UserDatas } from "../../../services/User.service";
import { ShiftService } from "../../../services/shift.service";
import ChangeIcon from "../../../assets/svg/basic-change.svg";
import SwitchButton from "../../../assets/svg/swicth-BT/switch.svg.svg";
import SwitchOffButton from "../../../assets/svg/swicth-BT/switchoff.svg";
import { BoothService } from "../../../services/booth.service";
import Swal from "sweetalert2";
import SelectUserModal from "../SelectUserModal/SelectUserModal";

const BoothCard: React.FC<{
  booth: BoothData;
  listCurrentShift: string[]; // รับ listCurrentShift เป็น propss
  onDelete: (id: string) => void;
  onEdit: (booth: BoothData) => void;
  onRefresh: () => void; // เพิ่ม props เพื่อสั่งรีเฟรชข้อมูลทั้งชุด
}> = ({ booth, listCurrentShift, onDelete, onEdit, onRefresh }) => {
  const [BoothStatus, setBoothStatus] = React.useState(booth.isActive);
  const [DataUserShift, setDataUserShift] = React.useState<UserDatas | null>(null);
  const [IsStatus, setIsStatus] = React.useState<string | null>(null);
  const [modalSeleteUser, setModalSeleteUser] = React.useState(false);
  const fetchDatacurrentShiftId = async () => {
    if (booth.currentShiftId != null) {
      setDataUserShift(
        await userService.getUserById(booth.currentShiftId ?? ""),
      );
    }else {
      setDataUserShift(null);
    }
  };

 const fetchBoothStatus = async () => {
  try {
    const shiftData = await ShiftService.getByBooth(booth.id);
    console.log(`Fetched shifts for booth ${booth.name}:`, shiftData);

    if (shiftData?.startTime) {
      const now = new Date();
      const startTime = new Date(shiftData.startTime);

      // สร้าง Date Object ที่เซ็ตเวลาเป็น 00:00:00 เพื่อเช็คแค่วันที่
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const shiftDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());

      // คำนวณหาความต่างของวัน
      const diffTime = shiftDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // เป็นของวันนี้ -> เช็คเวลาว่าเริ่มหรือยัง
        setIsStatus(shiftData.status);
      } else if (diffDays === 1) {
        // เป็นของพรุ่งนี้
        setIsStatus("ReadyForTomorrow");
      } else if (diffDays < 0) {
        // เป็นกะในอดีต (ถ้ามี)
        setIsStatus("Expired");
      } else {
        setIsStatus("FutureShift");
      }
    } else {
      setIsStatus("NoShift");
    }
  } catch (error) {
    console.error(`Failed to fetch booth status for ${booth.name}:`, error);
    setIsStatus("Unknown");
  }
};


  React.useEffect(() => {
    fetchDatacurrentShiftId();
    fetchBoothStatus();
  },[booth] );

  return (
    <article className="booth-card">
      <div className="booth-card-top">
        <h3 className="booth-card-title" translate="no">
          {booth.name}
        </h3>
        <span className={`booth-chip is-${IsStatus? IsStatus.toLowerCase() : "unknown"}`} translate="no">
          {IsStatus ?? "Unknown"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.2rem",
        }}
      >
        <div className="booth-location">
          <span className="booth-location-pin" aria-hidden="true" />
          <span translate="no">
            {booth.location ? booth.location : "No location"}
          </span>
        </div>
        <div
          className={`booth-Act ${BoothStatus ? "is-active" : "is-inactive"}`}
          translate="no"
          onClick={async () => {
            try {
              if (BoothStatus) {
                await BoothService.toggleBoothDeActive(booth.id);
              } else {
                await BoothService.toggleBoothActive(booth.id);
              }
              setBoothStatus(!BoothStatus);
            } catch (error: any) {
              await Swal.fire({
                icon: "error",
                title: "Status Change Failed",
                text: `${error.response?.data?.message || "An error occurred while changing the booth status."}`,
              });
            }
          }}
        >
          {BoothStatus ? "Active" : "Inactive"}
          <ReactSVG
            src={BoothStatus ? SwitchButton : SwitchOffButton}
            className="booth-change-status-icon"
            aria-label={`Toggle active status for ${booth.name}`}
          />
        </div>
      </div>

      <div className="booth-shift-box">
        <div>
          <p className="booth-shift-label">Current Shift</p>
          <p className="booth-shift-id" translate="no">
            {DataUserShift?.username ?? "No user assigned"}
          </p>
        </div>
        {booth.isActive && (
          <button
            type="button"
            className="booth-change-btn"
            onClick={() => {
              setModalSeleteUser(true);
            }}
            aria-label={`Change shift for ${booth.name}`}
          >
            <ReactSVG src={ChangeIcon} className="booth-change-icon" />
          </button>
        )}
      </div>

      <div className="booth-actions">
        <button
          type="button"
          className={`booth-edit-btn`}
          onClick={() => onEdit(booth)}
        >
          Edit
        </button>
        <button
          type="button"
          className="booth-delete-btn"
          onClick={() => onDelete(booth.id)}
          aria-label={`Delete ${booth.name}`}
        >
          <ReactSVG src={deleteIcon} className="booth-delete-icon" />
        </button>
      </div>
      {modalSeleteUser && (
        <SelectUserModal
          booth={booth}
          listCurrentShift={listCurrentShift}
          setModalSeleteUser={setModalSeleteUser}
          onSuccess={async () => {
            await onRefresh();
            await fetchDatacurrentShiftId();
          }} // ส่ง callback เพื่อรีเฟรชข้อมูลหลังมอบหมายพนักงาน
        />
      )}
    </article>
  );
};

export default BoothCard;
