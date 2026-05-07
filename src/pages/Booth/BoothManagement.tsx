import { useEffect, useMemo, useState } from "react";
import Button from "../../components/common/Buttom/Buttom";
import BoothCard from "../../components/common/BoothCard/BoothCard";
import "./BoothManagement.css";
import Search from "../../components/common/Search/Search";
import type { BoothData } from "../../types/entities";
import { BoothService } from "../../services/booth.service";
import Swal from "sweetalert2";

type ViewMode = "grid" | "list";

export default function BoothManagement() {
  const [booths, setBooths] = useState<BoothData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBooth, setNewBooth] = useState<Partial<BoothData>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooth, setEditingBooth] = useState<BoothData | null>(null);
  const [listCurrentShift, setListCurrentShift] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
        <div className="booth-header-right">
          <div className="booth-view-toggle">
            <button
              className={`booth-view-btn${viewMode === "grid" ? " active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
              aria-label="Grid view"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
                <rect x="11" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
                <rect x="1" y="11" width="6" height="6" rx="1.5" fill="currentColor"/>
                <rect x="11" y="11" width="6" height="6" rx="1.5" fill="currentColor"/>
              </svg>
            </button>
            <button
              className={`booth-view-btn${viewMode === "list" ? " active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
              aria-label="List view"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="2" width="16" height="2.5" rx="1.25" fill="currentColor"/>
                <rect x="1" y="7.75" width="16" height="2.5" rx="1.25" fill="currentColor"/>
                <rect x="1" y="13.5" width="16" height="2.5" rx="1.25" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <Button
            label="Add Booth"
            variant="add"
            className="main-add booth-main-add"
            onClick={() => setShowAddModal(true)}
          />
        </div>
      </div>

      <Search
        onSearch={(query) => setSearchQuery(query)}
        placeholder="Search booths..."
        id="booth-management"
      />

      {viewMode === "grid" ? (
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
      ) : (
        <div className="booth-list-wrapper">
          {filteredBooths.sort((a, b) => a.name.localeCompare(b.name)).map((booth) => (
            <div key={booth.id} className="booth-row-item">
              <BoothCard
                booth={booth}
                listCurrentShift={listCurrentShift}
                onEdit={() => {
                  setEditingBooth(booth);
                  setShowEditModal(true);
                }}
                onDelete={deleteBooth}
                onRefresh={async () => await fetchBooths()}
              />
            </div>
          ))}
          {filteredBooths.length === 0 && (
            <p className="booth-list-empty">No booths found</p>
          )}
        </div>
      )}

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
