import { useEffect, useMemo, useState } from "react";
import Button from "../../components/common/Buttom/Buttom";
import BoothCard from "../../components/common/BoothCard/BoothCard";
import "./BoothManagement.css";
import Search from "../../components/common/Search/Search";
import type { BoothData } from "../../types/entities";
import { BoothService } from "../../services/booth.service";
import Swal from "sweetalert2";

export default function BoothManagement() {
  const [booths, setBooths] = useState<BoothData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBooth, setNewBooth] = useState<Partial<BoothData>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooth, setEditingBooth] = useState<BoothData | null>(null);
  const [listCurrentShift, setListCurrentShift] = useState<string[]>([]);

  const fetchBooths = async () => {
    try {
      const data = await BoothService.getAllBooths();
      console.log("Fetched booths:", data);
      setBooths(data);
        const shifts = data.map((booth) => booth.currentShiftId).filter((id): id is string => id !== null);
        setListCurrentShift(shifts);
    } catch (error) {
      console.error("Failed to fetch booths:", error);
    }
  };

  useEffect(() => {
    fetchBooths();
  }, []);



  const filteredBooths = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) {
      return booths;
    }

    return booths.filter((booth) => {
      const shift = booth.currentShiftId ?? "";
      return (
        booth.name.toLowerCase().includes(keyword) ||
        booth.location.toLowerCase().includes(keyword) ||
        shift.toLowerCase().includes(keyword)
      );
    });
  }, [booths, searchQuery]);


  const deleteBooth = async (id: string) => {
    try {
      await BoothService.deleteBooth(id);
      await Swal.fire({
        icon: 'success',
        title: 'Booth Deleted',
        text: 'The booth has been successfully deleted.',
      });
      // Refresh booth list after deletion
      setBooths((prevBooths) => prevBooths.filter((booth) => booth.id !== id));
    } catch (error:any) {
      await Swal.fire({
        icon: 'error',
        title: 'Deletion Failed',
        text: `${error.response?.data?.message || 'An error occurred while deleting the booth.'}`,
      });
    }
    
  };

  const handleEditBooth = async (booth: BoothData) => {
    try {
      await BoothService.updateBooth(booth.id, {
        name: booth.name,
        location: booth.location,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Booth Updated',
        text: 'The booth has been successfully updated.',
      });
      // Refresh booth list after update
      setBooths((prevBooths) =>
        prevBooths.map((b) => (b.id === booth.id ? { ...b, ...booth } : b))
      );
      setShowEditModal(false);
      setEditingBooth(null);
    } catch (error:any) {
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: `${error.response?.data?.message || 'An error occurred while updating the booth.'}`,
      });
    }
  };


  const handleCreateBooth = async () => {
    try{
      
      const response = await BoothService.createBooth({
        name: newBooth.name ?? "New Booth",
        location: newBooth.location ?? "New Location",
      });
      await Swal.fire({
        icon: 'success',
        title: 'Booth Created',
        text: 'The new booth has been successfully created.',
      });
      // Refresh booth list after creation
      setBooths((prevBooths) => [...prevBooths, response]);
      setShowAddModal(false);
      setNewBooth({});   
    } catch (error:any) {
      await Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: `${error.response?.data?.message || 'An error occurred while creating the booth.'}`,
      });
    }
  };
  
  return (
    <div className="booth-page container">
      <div className="booth-header header">
        <div className="h-l">
          <h1 className="TP">Booth Management</h1>
          <p className="STP">Manage exchange booths and locations</p>
        </div>
        <Button
          label="Add Booth"
          variant="add"
          className="main-add booth-main-add"
          onClick={() => setShowAddModal(true)}
        />
      </div>

      <Search
        onSearch={(query) => setSearchQuery(query)}
        placeholder="Search booths..."
        id="booth-management"
      />

      <div className="booth-grid">
          {filteredBooths.sort((a, b) => a.name.localeCompare(b.name))
          .map((booth) => (
            <BoothCard 
              key={booth.id} 
              booth={booth} 
              listCurrentShift={listCurrentShift}
              onEdit={() => {
                setEditingBooth(booth);
                setShowEditModal(true);
              }}
              onDelete={deleteBooth}
              onRefresh={async () => await fetchBooths()}
            />
          ))}
          
          <button className="booth-create-card" onClick={() => setShowAddModal(true)}>
            <div className="booth-create-icon">
              <span className="booth-create-plus">+</span>
            </div>
            <span className="booth-create-text">Create New Booth</span>
          </button>
      </div>

      {showAddModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content booth-modal-content">
            <h2 className="modal-title">Create New Booth</h2>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Name</label>
                <input
                  type="text"
                  value={newBooth.name ?? ""}
                  onChange={(e) => setNewBooth({ ...newBooth, name: e.target.value })}
                  className="modal-input"
                  placeholder="Enter booth name"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Location</label>
                <input
                  type="text"
                  value={newBooth.location ?? ""}
                  onChange={(e) => setNewBooth({ ...newBooth, location: e.target.value })}
                  className="modal-input"
                  placeholder="Enter location"
                />
              </div>

              
            </div>
            <div className="booth-modal-actions">
              <Button
                label="Create Booth"
                variant="add"
                onClick={handleCreateBooth}
              />
              <Button
                label="Close"
                variant="cancel"
                onClick={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content booth-modal-content">
            <h2 className="modal-title">Edit Booth</h2>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Name</label>
                <input
                  type="text"
                  value={editingBooth?.name ?? ""}
                  onChange={(e) => setEditingBooth({ ...editingBooth, name: e.target.value } as BoothData)}
                  className="modal-input"
                  placeholder="Enter booth name"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Location</label>
                <input
                  type="text"
                  value={editingBooth?.location ?? ""}
                  onChange={(e) => setEditingBooth({ ...editingBooth, location: e.target.value } as BoothData)}
                  className="modal-input"
                  placeholder="Enter location"
                />
              </div>

              
            </div>
            <div className="booth-modal-actions">
              <Button
                label="Save Changes"
                variant="add"
                onClick={() => handleEditBooth(editingBooth as BoothData)}
              />
              <Button
                label="Close"
                variant="cancel"
                onClick={() => {  setShowEditModal(false); setEditingBooth(null);}

                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
