import React, { useEffect, useState, type FC } from "react";
import "./SelectUserModal.css";
import { userService, type UserDatas } from "../../../services/User.service";
import Search from "../Search/Search";
import { BoothService } from "../../../services/booth.service";
import Swal from "sweetalert2";
import Button from "../Buttom/Buttom";
import type { BoothData } from "../../../types/entities";

export interface SelectUserModalProps {
  booth: BoothData ;
  listCurrentShift: string[]; // รับ listCurrentShift เป็น propss
  setModalSeleteUser: React.Dispatch<React.SetStateAction<boolean>>;

  onSuccess?: () => void; // เพิ่มเพื่อแจ้งหน้าหลักให้ Refresh ข้อมูล
}

const SelectUserModal: FC<SelectUserModalProps> = ({
  booth,
  listCurrentShift,
  setModalSeleteUser,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<UserDatas[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDatas | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  const ClearUserInbooth = async () => {
    setLoading(true);
    try {
      const result = await BoothService.assignUserToBooth(null, booth.id);
      if (result) {
        await Swal.fire({
          icon: "success",
          title: "User Removed",
          text: result?.message || "ยกเลิกมอบหมายพนักงานเรียบร้อยแล้ว",
          confirmButtonColor: "var(--btn-submit)",
        });
        if (onSuccess) 
        await onSuccess();
        setModalSeleteUser(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      console.error("Failed to remove user from booth:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Could not remove user from booth. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUserSelect = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const result = await BoothService.assignUserToBooth(
        selectedUser.id,
        booth.id
      );
      if (result) {
        await Swal.fire({
          icon: "success",
          title: "User Assigned",
          text: result?.message || "มอบหมายพนักงานเรียบร้อยแล้ว",
          confirmButtonColor: "var(--btn-submit)",
        });
        
        if (onSuccess) 
        await onSuccess(); // เรียก callback เพื่อรีเฟรชข้อมูลหน้า Booth
        setModalSeleteUser(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      console.error("Failed to assign user to booth:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Could not assign user to booth. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (u.username.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        u.phoneNumber?.toLowerCase().includes(searchTerm)) &&
      u.role.toLowerCase().includes("employee") &&
      !listCurrentShift.includes(u.id) // กรองเอาเฉพาะผู้ใช้ที่ไม่อยู่ใน listCurrentShift
    );
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title text-[var(--booth-title)]">Select User</h2>
        <Search
          onSearch={(query) => setSearchQuery(query)}
          placeholder="Search users..."
          id="user-search"
        />
        
        <div className="modal-body select-user-table-container">
          <table className="table">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm text-gray-700">Username</th>
                <th className="text-left py-4 px-6 text-sm text-gray-700">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers
                  .sort((a, b) => a.username.localeCompare(b.username))
                  .map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        className={`border-t border-gray-100 cursor-pointer transition-all ${
                          isSelected ? "selected-row" : "none-selected hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedUser(isSelected ? null : u)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2 h-2 rounded-full transition-colors ${
                                isSelected ? "bg-[var(--btn-edit)]" : "bg-transparent"
                              }`}
                            ></span>
                            <span className="font-bold text-gray-800 notranslate" translate="no">
                              {u.username}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 notranslate" translate="no">
                          {u.email}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={2} className="py-10 text-center text-gray-400">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ส่วน Preview - จะอัปเดตตาม State selectedUser ทันที */}
        <div className="modal-Preview">
          <h3 className="preview-title">Selected User Preview</h3>
          {selectedUser ? (
            <div className="preview-content animate-fade-in">
              <p><strong>Username:</strong> <span className="notranslate" translate="no">{selectedUser.username}</span></p>
              <p><strong>Email:</strong> <span className="notranslate" translate="no">{selectedUser.email}</span></p>
            </div>
          ) : (
            <p className="text-gray-400 italic">No user selected. Please click on a row.</p>
          )}
        </div>

        <div className="modal-actions select-user-modal-actions">
          {
            booth.currentShiftId && <Button
              label="Remove User from Booth"
              variant="close"
              className="modal-button submit-button"
              onClick={ClearUserInbooth} // สำคัญ: ต้องผูกฟังก์ชันที่นี่
            />
          }
          <div>
            <Button
              label={loading ? "Assigning..." : "Assign User"}
              variant="submit"
              className="modal-button submit-button"
              disabled={!selectedUser || loading}
              onClick={handleUserSelect} // สำคัญ: ต้องผูกฟังก์ชันที่นี่
            />
            <Button
              label="Cancel"
              variant="cancel"
              className="modal-button cancel-button"
              onClick={() => {
                setModalSeleteUser(false);
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectUserModal;