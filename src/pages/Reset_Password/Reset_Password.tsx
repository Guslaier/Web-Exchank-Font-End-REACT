import { useState } from "react";
import Button from "../../components/common/Buttom/Buttom";
import { authService } from "../../services/auth.service.ts"; // สมมติว่ามี authService
import Swal from "sweetalert2";
import "./Reset_Password.css"; // ใช้สไตล์เดียวกับ UserManagement
import InputPass from "../../components/common/input_pass/input_pass.tsx";

export default function ResetPassword() {
  const [tab, setTab] = useState<"token" | "oldPass">("token");

  // State สำหรับ Reset ด้วย Token
  const [tokenData, setTokenData] = useState({
    email: "",
    token: "",
    newPassword: "",
  });

  // ฟังก์ชันรีเซ็ตด้วย Token
  const handleResetWithToken = async () => {
    if (!tokenData.email || !tokenData.token || !tokenData.newPassword) {
      return Swal.fire("Error", "Please fill in all fields", "warning");
    }

    try {
      Swal.showLoading();
      // เรียก API: { email, token, newPassword }
      await authService.resetWithToken(tokenData);

      Swal.fire("Success", "Password reset successfully!", "success");
      setTokenData({ email: "", token: "", newPassword: "" });
      window.location.href = "/login"; // เปลี่ยนเส้นทางไปหน้า Login
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Invalid Token",
        "error",
      );
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-logo" translate="no">
        <h1>
          <span className="m-yellow">M</span>
          <br />
          Exchange
        </h1>
      </div>

      <div className="modal-content">
        <h2 className="modal-title text-center">Reset Password</h2>

        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Email</label>
            <input
              type="email"
              value={tokenData.email}
              onChange={(e) =>
                setTokenData({ ...tokenData, email: e.target.value })
              }
              className="modal-input"
              placeholder="user@example.com"
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Token</label>
            <input
              type="text"
              value={tokenData.token}
              onChange={(e) =>
                setTokenData({ ...tokenData, token: e.target.value })
              }
              className="modal-input"
              placeholder="Enter your token"
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">New Password</label>
            <InputPass
              type="password"
              value={tokenData.newPassword}
              onChange={(e) =>
                setTokenData({ ...tokenData, newPassword: e.target.value })
              }
              className="modal-input"
              placeholder="Enter new password"
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button
            label="Reset Password"
            variant="submit"
            className="flex-1"
            onClick={handleResetWithToken}
          />
          <Button
            label="Cancel"
            variant="cancel"
            className="flex-1"
            onClick={() => window.location.href = "/login"}
          />
        </div>
      </div>
    </div>
  );
}
