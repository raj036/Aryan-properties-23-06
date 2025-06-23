import { useState, useEffect } from "react";
import Modal from "react-modal";
import { MdCancel } from "react-icons/md";
import axios from "../helper/axios";
import Swal from "sweetalert2";

const CommercialPropertyModal = ({ isOpen, onClose, DesId ,setFurnishedId , furnished_details, editProperty}) => {
  const [DescId, setDescId] = useState(DesId || "");

  const [formData, setFormData] = useState({
    des_code: DescId,
     workstations: furnished_details?.workstations || 0,
    workstation_type_cubicle: furnished_details?.workstation_type_cubicle || false,
    workstation_type_linear: furnished_details?.workstation_type_linear || false,
    workstation_type_both: furnished_details?.workstation_type_both || false,
    cabins: furnished_details?.cabins || 0,
    meeting_rooms: furnished_details?.meeting_rooms || 0,
    conference_rooms: furnished_details?.conference_rooms || 0,
    cafeteria_seats: furnished_details?.cafeteria_seats || 0,
    washrooms: furnished_details?.washrooms || 0,
    pantry_area: furnished_details?.pantry_area || false,
    backup_ups_room: furnished_details?.backup_ups_room || false,
    server_electrical_room: furnished_details?.server_electrical_room || false,
    reception_waiting_area: furnished_details?.reception_waiting_area || false,
  });

  useEffect(() => {
    if (editProperty && furnished_details) {
      setFormData({
        des_code: DescId,
        workstations: furnished_details?.workstations || 0,
        workstation_type_cubicle:
          furnished_details?.workstation_type_cubicle || false,
        workstation_type_linear:
          furnished_details?.workstation_type_linear || false,
        workstation_type_both:
          furnished_details?.workstation_type_both || false,
        cabins: furnished_details?.cabins || 0,
        meeting_rooms: furnished_details?.meeting_rooms || 0,
        conference_rooms: furnished_details?.conference_rooms || 0,
        cafeteria_seats: furnished_details?.cafeteria_seats || 0,
        washrooms: furnished_details?.washrooms || 0,
        pantry_area: furnished_details?.pantry_area || false,
        backup_ups_room: furnished_details?.backup_ups_room || false,
        server_electrical_room:
          furnished_details?.server_electrical_room || false,
        reception_waiting_area:
          furnished_details?.reception_waiting_area || false,
      });
    }
  }, [editProperty, furnished_details, DescId]);

  useEffect(() => {
    // console.log("DesId:", DesId); // Debugging
    setDescId(DesId);
    setFormData((prevState) => ({
      ...prevState,
      des_code: DesId || "",
    }));
  }, [DesId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "workstationType") {
      setFormData((prevState) => ({
        ...prevState,
        workstation_type_cubicle: value === "Cubicle",
        workstation_type_linear: value === "Linear",
        workstation_type_both: value === "Both",
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await furnishedProperty();
  };

  const handleCancel = () => {
    onClose();
  };

  const token = localStorage.getItem("token");

  const furnishedProperty = async () => {
    if (!token) {
      //console.error("No authentication token found");
      return;
    }

    const formattedData = {
      ...formData,
      des_code: DescId, // Ensure des_code is included
      workstations: Number(formData.workstations) || 0,
      cabins: Number(formData.cabins) || 0,
      meeting_rooms: Number(formData.meeting_rooms) || 0,
      conference_rooms: Number(formData.conference_rooms) || 0,
      cafeteria_seats: Number(formData.cafeteria_seats) || 0,
      washrooms: Number(formData.washrooms) || 0,
      pantry_area: Boolean(formData.pantry_area),
      backup_ups_room: Boolean(formData.backup_ups_room),
      server_electrical_room: Boolean(formData.server_electrical_room),
      reception_waiting_area: Boolean(formData.reception_waiting_area),
    };

    try {
      // console.log("Sending request with data:", formattedData);

      const response = await axios.post(
        "/api/furnished_properties/",
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data) {
        Swal.fire({
          icon: "success",
          title: "Commercial Property added successfully",
          text: "Redirecting...",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        onClose();
      }

      if (response?.data) {
        // Use the returned ID directly
        const newFurnishedId = response.data.id;
        
        // Update the state
        setFurnishedId(newFurnishedId);
  
        // Log after setting to verify
        // console.log("New Furnished ID:", newFurnishedId);
        // console.log("Furnished ID", furnishedId);
      }
      
    } catch (error) {
      //console.error("API Error Details:", error.response?.data); // Debugging
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backdropFilter: "blur(3px)",
          zIndex: 10,
        },
        content: {
          width: "70%",
          height: "fit-content",
          margin: "auto",
          borderRadius: "10px",
          boxShadow: "1px 1px 10px gray",
          backgroundColor: "white",
          overflow: "visible",
        },
      }}
    >
      <div className="relative p-6">
        <button onClick={onClose} className="absolute top-2 right-2">
          <MdCancel className="text-xl text-gray-500 hover:text-red-600" />
        </button>

        <div className="grid grid-cols-2 gap-5 mt-3">
          <div>
            <h2 className="mb-2 text-lg font-semibold">1. Workstation</h2>

            <input
              type="number"
              name="workstations"
              value={formData.workstations}
              onChange={handleInputChange}
              placeholder="Number of Workstations"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none"
            />
            <div className="flex gap-4 mt-4">
              {["Cubicle", "Linear", "Both"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="workstationType"
                    value={option}
                    checked={
                      (option === "Cubicle" &&
                        formData.workstation_type_cubicle) ||
                      (option === "Linear" &&
                        formData.workstation_type_linear) ||
                      (option === "Both" && formData.workstation_type_both)
                    }
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-500 hover:cursor-pointer accent-blue-700"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {[
            { label: "Cabin", key: "cabins" },
            { label: "Meeting Room", key: "meeting_rooms" },
            { label: "Conference Room", key: "conference_rooms" },
            { label: "Cafeteria Seats", key: "cafeteria_seats" },
            { label: "Washrooms", key: "washrooms" },
          ].map(({ label, key }, index) => (
            <div key={index}>
              <h2 className="mb-2 text-lg font-semibold">
                {index + 2}. {label}
              </h2>
              <input
                type="number"
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
                placeholder={`Number of ${label}`}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              />
            </div>
          ))}

          {[
            { label: "Pantry Area", key: "pantry_area" },
            { label: "Backup Room", key: "backup_ups_room" },
            { label: "Server Room", key: "server_electrical_room" },
            { label: "Reception Area", key: "reception_waiting_area" },
          ].map(({ label, key }, index) => (
            <div key={index + 6}>
              <h2 className="mb-2 text-lg font-semibold">
                {index + 7}. {label}
              </h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={key}
                  checked={formData[key]}
                  onChange={handleInputChange}
                  className="w-4 h-4 hover:cursor-pointer accent-blue-800"
                />
                Yes
              </label>
            </div>
          ))}

          <div className="flex justify-end col-span-2 gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-white bg-red-500 rounded shadow hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-blue-500 rounded shadow hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CommercialPropertyModal;
