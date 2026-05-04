import { useEffect, useState } from "react";
import Button from "../../components/common/Buttom/Buttom";
import { UserDatas, userService } from "../../services/User.service";
import type { UserData, UserRole } from "../../types/entities";
import SwitchButton_User from "../../components/common/swicth-BT-User/swicth-BT-User";
import "./UserManagement.css";
import { storage } from "../../utils/storage";
import Swal from "sweetalert2";
import { ReactSVG } from "react-svg";
import editIcon from "../../assets/svg/edit.svg";
import deleteIcon from "../../assets/svg/delete.svg";
import Search from "../../components/common/Search/Search";
import viewIcon from "../../assets/svg/view-list-svgrepo-com.svg";
import { formatThaiDate } from "../../utils/fomat";

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]); // สมมติว่าเรามีข้อมูลผู้ใช้ในรูปแบบนี้
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        console.log("Fetched users:", data); // ตรวจสอบข้อมูลที่ได้รับจาก API
        setUsers(data as UserData[]);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewUserModal, setViewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    phoneNumber: "",
    role: "EMPLOYEE",
  });
  const [editingUserId, setEditingUserId] = useState({
    id: "",
    email: "",
    username: "",
    phoneNumber: "",
    role: "EMPLOYEE",
  });
  const [selectedUser, setSelectedUser] = useState<UserDatas | null>(null);

  const viewUser = (user: UserDatas) => {
    setSelectedUser(user);
    setViewUserModal(true);
  }
  const handleAdd = async () => {
    // 1. ตรวจสอบข้อมูล (Validation) ด้วย Toast หรือ Alert ของ SWAL
    if (!newUser.email || !newUser.username || !newUser.phoneNumber) {
      Swal.fire({
        title: "data is incomplete",
        text: "Please fill in all fields",
        icon: "warning",
        confirmButtonColor: "var(--btn-submit)", // ใช้สีเดียวกับ Navbar
      });
      return;
    }

    try {
      // แสดง Loading ระหว่างรอ API (เผื่อเน็ตช้า)
      Swal.showLoading();

      let response = await userService.createUser({
        email: newUser.email,
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role as UserRole,
      } as UserData);

      await Swal.fire({
        title:
          '<strong style="color: var(--primary-color);">User Created Successfully!</strong>',
        icon: "success",
        html: `
    <div style="text-align: left; background: #f8fafc; padding: 1.5rem; border-radius: 10px; border: 1px solid #e2e8f0; font-family: sans-serif;">
      <div style="margin-bottom: 10px;"><strong>Email:</strong> <span style="color: #475569;" translate="no">${response.user.email}</span></div>
      <div style="margin-bottom: 10px;"><strong>Username:</strong> <span style="color: #475569;" translate="no">${response.user.username}</span></div>
      <div style="margin-bottom: 10px;"><strong>Phone:</strong> <span style="color: #475569;" translate="no">${response.user.phoneNumber}</span></div>
      <div style="margin-bottom: 15px;"><strong>Role:</strong> <span style="badge; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 0.85em;" translate="no">${response.user.role}</span></div>
      
      <div style="background: #fff; border: 2px dashed var(--primary-color); padding: 1rem; border-radius: 8px; text-align: center;">
        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">Initial Password (Please copy)</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #1e293b; letter-spacing: 2px;" translate="no">${response.generatedPassword}</div>
      </div>
    </div>
    <p style="margin-top: 15px; font-size: 0.85rem; color: #ef4444;">* Please provide this password to the user for their initial login</p>
  `,
        confirmButtonColor: "var(--primary-color)",
        confirmButtonText: "Close",
        showConfirmButton: true,
        width: "500px", // ปรับขนาดความกว้างตามความเหมาะสม
      }); // ปิด Loading หลังจากแสดง Success แล้ว
      // รีเฟรชรายชื่อผู้ใช้
      const data = await userService.getAllUsers();
      setUsers(data as UserData[]); // อัปเดต State รายชื่อผู้ใช้
      setShowAddModal(false); // ปิด Modal หลังจากสำเร็จ

      // Reset ฟอร์ม New User ให้ว่างเปล่า
      setNewUser({
        email: "",
        username: "",
        phoneNumber: "",
        role: "EMPLOYEE",
      });
    } catch (error: any) {
      // 3. แจ้งเตือนเมื่อเกิดข้อผิดพลาด (Error)
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Unable to add user. Please try again.",
        icon: "error",
        confirmButtonColor: "var(--btn-submit)",
      });
    }
  };

  const handleEdit = async () => {
    try {
      // 1. ตรวจสอบข้อมูล (Validation) ด้วย Toast หรือ Alert ของ SWAL
      if (
        !editingUserId.email ||
        !editingUserId.username ||
        !editingUserId.phoneNumber
      ) {
        Swal.fire({
          title: "Data is incomplete",
          text: "Please fill in all fields",
          icon: "warning",
          confirmButtonColor: "var(--btn-submit)", // ใช้สีเดียวกับ Navbar
        });
        return;
      }

      // 2. เรียก API เพื่อบันทึกการแก้ไข (สมมติว่าเรามีฟังก์ชัน updateUser ใน userService)
      // await userService.updateUser(editingUserId.id, editingUserId);

      const response = await userService.updateUser(editingUserId.id, {
        email: editingUserId.email,
        username: editingUserId.username,
        phoneNumber: editingUserId.phoneNumber,
        role: editingUserId.role as UserRole,
      }); // สมมติว่า email เป็น unique identifier
      if (response) {
        // 3. แจ้งเตือนเมื่อแก้ไขสำเร็จ
        Swal.fire({
          title: "User Updated Successfully!",
          icon: "success",
          confirmButtonColor: "var(--primary-color)",
        });
        // รีเฟรชรายชื่อผู้ใช้
        const data = await userService.getAllUsers();
        setUsers(data as UserData[]); // อัปเดต State รายชื่อผู้ใช้
        setShowEditModal(false); // ปิด Modal หลังจากสำเร็จ
      } else {
        throw new Error("User not found");
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Unable to update user. Please try again.",
        icon: "error",
        confirmButtonColor: "var(--btn-submit)",
      });
    }
  };
  const handleToggleActive = async (id: string) => {
    try {
      const data = await userService.getUserById(id);
      console.log("Fetched user for toggle:", data); // ตรวจสอบข้อมูลที่ได้รับจาก API
      if (data) {
        if (data.isActive) {
          // Deactivate user
          await userService.deactivateUser(id);
        } else {
          // Activate user
          await userService.activateUser(id);
        }
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === id ? { ...u, isActive: !data.isActive } : u,
          ),
        );
      } else {
        await Swal.fire({
          title: "User not found",
          text: "The user you are trying to update does not exist.",
          icon: "error",
          confirmButtonColor: "var(--btn-submit)",
        });
      }
    } catch (error) {
      const err = error as any;
      await Swal.fire({
        title: "Error",
        text:
          err.response?.data?.message ||
          "An error occurred while updating the user's status. Please try again.",
        icon: "error",
        confirmButtonColor: "var(--btn-submit)",
      });
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--btn-submit)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await userService.deleteUser(id);
          if (!response) {
            await Swal.fire({
              title: "User not found",
              text: "The user you are trying to delete does not exist.",
              icon: "error",
              confirmButtonColor: "var(--btn-submit)",
            });
            return;
          }
          setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
          Swal.fire("Deleted!", "The user has been deleted.", "success");
        } catch (error) {
          const err = error as any;
          Swal.fire({
            title: "Error",
            text:
              err.response?.data?.message ||
              "An error occurred while deleting the user. Please try again.",
            icon: "error",
            confirmButtonColor: "var(--btn-submit)",
          });
        }
      } else {
        Swal.fire("Cancelled", "The user is safe.", "info");
      }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "ADMIN";
      case "MANAGER":
        return "MANAGER";
      case "EMPLOYEE":
        return "EMPLOYEE";
      default:
        return "UNKNOWN";
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm) ||
      u.phoneNumber.toLowerCase().includes(searchTerm) ||
      u.role.toLowerCase().includes(searchTerm)
    );
  });
  return (
    <div className="container">
      <div className="header">
        <div className="h-l">
          <h1 className="TP">User Management</h1>
          <p className="STP">Manage system users and permissions</p>
        </div>
        <Button
          label="Add User"
          variant="add"
          className="main-add"
          onClick={() => setShowAddModal(true)}
        />
      </div>

      <Search
        onSearch={(query) => setSearchQuery(query)}
        placeholder="Search users..."
        id="user-management"
      />
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="text-left py-4 px-6 text-sm text-gray-700">
                Username
              </th>
              <th className="text-left py-4 px-6 text-sm text-gray-700">
                Email
              </th>
              <th className="text-left py-4 px-6 text-sm text-gray-700">
                Phone
              </th>
              <th className="text-center py-4 px-6 text-sm text-gray-700">
                Role
              </th>
              <th className="text-center py-4 px-6 text-sm text-gray-700">
                Status
              </th>
              <th className="text-center py-4 px-6 text-sm text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers
              .sort((a, b) => a.username.localeCompare(b.username))
              .map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6 text-gray-900" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span translate="no">{u.username}</span>
                    <span>
                      <button
                        className="actions-btn view"
                        onClick={() => viewUser(u)}
                      >
                        <ReactSVG src={viewIcon} className="nav-icon-svg" />
                      </button>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600" translate="no">{u.email}</td>
                  <td className="py-4 px-6 text-gray-600" translate="no">{u.phoneNumber}</td>
                  <td className="py-4 px-6 text-center">
                    <div className={`role r-${getRoleBadgeColor(u.role)}`}>
                      {u.role}
                    </div>
                  </td>
                  <td className="py-4 px-6 items-center">
                    <SwitchButton_User
                      isActive={u.isActive}
                      fun={() => handleToggleActive(u.id)}
                    />
                  </td>
                  <td className="py-4 px-6 ">
                    <div className="actions-group">
                      <button
                        className="actions-btn edit"
                        onClick={() => {
                          setEditingUserId({
                            id: u.id,
                            email: u.email,
                            username: u.username,
                            phoneNumber: u.phoneNumber,
                            role: u.role,
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <ReactSVG src={editIcon} className="nav-icon-svg" />
                      </button>
                      <button
                        className="actions-btn delete"
                        onClick={() => handleDelete(u.id)}
                      >
                        <ReactSVG src={deleteIcon} className="nav-icon-svg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Add New User</h2>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label" 
                        translate="no">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="modal-input"
                  placeholder="user@example.com"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label" 
                        translate="no">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="modal-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label" 
                        translate="no">Phone Number</label>
                <input
                  type="text"
                  value={newUser.phoneNumber}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phoneNumber: e.target.value })
                  }
                  className="modal-input"
                  placeholder="0123456789"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="modal-select"
                >
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                label="Add User"
                variant="add"
                onClick={handleAdd}
                className="flex-1"
              />
              <Button
                label="Cancel"
                variant="cancel"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Edit User</h2>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Email</label>
                <input
                  type="email"
                  value={editingUserId.email}
                  onChange={(e) =>
                    setEditingUserId({
                      ...editingUserId,
                      email: e.target.value,
                    })
                  }
                  className="modal-input"
                  placeholder="user@example.com"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Username</label>
                <input
                  type="text"
                  value={editingUserId.username}
                  onChange={(e) =>
                    setEditingUserId({
                      ...editingUserId,
                      username: e.target.value,
                    })
                  }
                  className="modal-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Phone Number</label>
                <input
                  type="text"
                  value={editingUserId.phoneNumber}
                  onChange={(e) =>
                    setEditingUserId({
                      ...editingUserId,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="modal-input"
                  placeholder="0123456789"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Role</label>
                <select
                  value={editingUserId.role}
                  onChange={(e) =>
                    setEditingUserId({ ...editingUserId, role: e.target.value })
                  }
                  className="modal-select"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  {(storage.get<UserRole>("userRole") || "EMPLOYEE") ===
                    "ADMIN" && <option value="ADMIN">Admin</option>}
                </select>
              </div>
              <div className="modal-field">
                <Button
                  label="Reset Password"
                  variant="cancel"
                  onClick={() => {
                    Swal.fire({
                      title: "Are you sure?",
                      text: "This will reset the user's password to the default. The user will need to change it upon next login.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "var(--btn-submit)",
                      cancelButtonColor: "#d33",
                      confirmButtonText: "Yes, reset it!",
                    }).then(async (result) => {
                      if (result.isConfirmed) {
                        try {
                          const response = await userService.resetPassword(
                            editingUserId.id,
                          );
                          Swal.fire({
                            title: "Token for Password Reset Successfully!",
                            icon: "success",
                            html: `
                              <div style="text-align: left; background: #f8fafc; padding: 1.5rem; border-radius: 10px; border: 1px solid #e2e8f0; font-family: sans-serif;">
                                <div style="margin-bottom: 10px;"><strong>Token:</strong> <span style="font-size: 1.5rem; font-weight: 800; color: #1e293b; letter-spacing: 2px;">${response}</span></div>
                              </div>
                              <p style="margin-top: 15px; font-size: 0.85rem; color: #ef4444;">* Please provide this token to the user for their next login</p>
                            `,
                            confirmButtonColor: "var(--primary-color)",
                            confirmButtonText: "Close",
                            showConfirmButton: true,
                            width: "500px", // ปรับขนาดความกว้างตามความเหมาะสม
                          });
                        } catch (error) {
                          const err = error as any;
                          await Swal.fire({
                            title: "Error",
                            text:
                              err.response?.data?.message ||
                              "An error occurred while resetting the user's password. Please try again.",
                            icon: "error",
                            confirmButtonColor: "var(--btn-submit)",
                          });
                        }
                      }
                    });
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button
                label="Save Changes"
                variant="add"
                onClick={handleEdit}
                className="flex-1"
              />
              <Button
                label="Cancel"
                variant="cancel"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
      {viewUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">View User</h2>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Username : </label>
                <span className="value">
                  {selectedUser?.username || "N/A"}
                </span>
              </div>
        

              <div className="modal-field">
                <label className="modal-label">Email : </label>
                <span className="value">
                  {selectedUser?.email || "N/A"}
                </span>
              </div>
              
              <div className="modal-field">
                <label className="modal-label">Phone Number : </label>
                <span className="value">
                  {selectedUser?.phoneNumber || "N/A"}
                </span>
              </div>
              
              <div className="modal-field">
                <label className="modal-label">Role : </label>
                <span className="value">
                  {selectedUser?.role || "N/A"}
                </span>
              </div>

              <div className="modal-field">
                <label className="modal-label">Status : </label>
                <span className="value">
                  {selectedUser?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="modal-field">
                <label className="modal-label">Created At : </label>
                <span className="value">{selectedUser?.createdAt ? formatThaiDate(selectedUser.createdAt) : "N/A"}</span>
              </div>
              <div className="modal-field">
                <label className="modal-label">Updated At : </label>
                <span className="value">{selectedUser?.updatedAt ? formatThaiDate(selectedUser.updatedAt) : "N/A"}</span>
              </div>
            </div>




            <div className="modal-footer">
              <Button
                label="Close"
                variant="cancel"
                onClick={() => setViewUserModal(false)}
                className="flex-1"
              />
            </div>
          </div>
        </div>)}
    </div>
  );
}
