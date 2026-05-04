import { useEffect, useState } from "react";
import Button from "../../components/common/Buttom/Buttom";
import { UserDatas, userService } from "../../services/User.service";
import type { UserRole } from "../../types/entities";
import "./Profile.css";
import { storage } from "../../utils/storage";
import Swal from "sweetalert2";
import { authService } from "../../services/auth.service";
import InputPass from "../../components/common/input_pass/input_pass";
import { formatThaiDate } from "../../utils/fomat";


export default function Profile() {
  const [userData, setUserData] = useState<UserDatas | null>(null);
  const [ChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newUser, setNewUser] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = storage.get<object>("userInfo") || {};
        const userId = (userInfo as any).id || "";
        const data = await userService.getUserById(userId);
        console.log("Fetched user data:", data); // ตรวจสอบข้อมูลที่ได้รับจาก API
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleChangePassword = async () => {
    try {
      const userInfo = storage.get<object>("userInfo") || {};
      const userId = (userInfo as any).id || "";
      await authService.changeWithOldPass(userId, {
        oldPass: newUser.currentPassword,
        newPass: newUser.newPassword,
      });
      Swal.fire({
        icon: 'success',
        title: 'Password Changed',
        text: 'Your password has been successfully changed.',
      });
      setShowChangePasswordModal(false);
      setNewUser({ currentPassword: "", newPassword: "" }); // รีเซ็ตฟิลด์หลังเปลี่ยนรหัสผ่าน
    } catch (error) {
      console.error("Error changing password:", error);
      const err = error as any;
      Swal.fire({
        icon: 'error',
        title: 'Unable to Change Password',
        text: err?.response?.data?.message || 'Failed to change password. Please try again.',
      });
    }
  }

  return (
    <div className="Pro-container">
      <div className="header">
        <div className="h-l">
          <h1 className="TP">Profile</h1>
          <p className="STP">Your profile information</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-info">
          <h2 className="modal-title">Profile Information</h2>
          <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Username : </label>
                <span className="value" translate="no">
                  {userData?.username || "N/A"}
                </span>
              </div>
        

              <div className="modal-field">
                <label className="modal-label">Email : </label>
                <span className="value" translate="no">
                  {userData?.email || "N/A"}
                </span>
              </div>
              
              <div className="modal-field">
                <label className="modal-label">Phone Number : </label>
                <span className="value" translate="no">
                  {userData?.phoneNumber || "N/A"}
                </span>
              </div>
              
              <div className="modal-field">
                <label className="modal-label">Role : </label>
                <span className="value" >
                  {userData?.role || "N/A"}
                </span>
              </div>

              <div className="modal-field">
                <label className="modal-label">Status : </label>
                <span className="value" >
                  {userData?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="modal-field">
                <label className="modal-label">Created At : </label>
                <span className="value">{userData?.createdAt ? formatThaiDate(userData.createdAt) : "N/A"}</span>
              </div>
              <div className="modal-field">
                <label className="modal-label">Updated At : </label>
                <span className="value">{userData?.updatedAt ? formatThaiDate(userData.updatedAt) : "N/A"}</span>
              </div>
            </div>
        </div>
      </div>  
      
      {ChangePasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Change Password</h2>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Current Password</label>
                <InputPass
                  type="password"
                  value={newUser.currentPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser , currentPassword: e.target.value })
                  }
                  className="modal-input"
                  placeholder="Current Password"
                />
              </div>

        

              <div className="modal-field">
                <label className="modal-label">New Password</label>
                <InputPass
                  type="password"
                  value={newUser.newPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser, newPassword: e.target.value })
                  }
                  className="modal-input"
                  placeholder="New Password"
                />
              </div>



            <div className="modal-footer">
              <Button
                label="Change Password"
                variant="add"
                onClick={handleChangePassword}
                className="flex-1"
              />
              <Button
                label="Cancel"
                variant="cancel"
                onClick={() => setShowChangePasswordModal(false)}
                className="flex-1"
              />
            </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="button-group">
        <Button
          label="Change Password"
          variant="cancel"
          onClick={() => setShowChangePasswordModal(true)}
        />
      </div>
    </div>
  );
}
