import React, { useState, useEffect } from "react";
import axios from "../helper/axios";
import { MdCancel, MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-[500px] bg-white rounded-lg shadow-lg p-6 z-10">
        {children}
        <button onClick={onClose}>
          <MdCancel className="absolute top-3 right-3 size-5 hover:text-red-800" />
        </button>
      </div>
    </div>
  );
};

const Client = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [formData, setFormData] = useState({
    Name: "",
    Emial: "", // Updated to match API field name
    Conatct_Number: "", // Updated to match API field name
    Location: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    axios
      .get("/api/clients/")
      .then((response) => {
        setClients(response.data);
        setFilteredClients(response.data);
      })
      //.catch((error) => console.error("Error fetching clients:", error));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = clients.filter(
      (client) =>
        client.Name.toLowerCase().includes(value) ||
        client.Emial.toLowerCase().includes(value) || // Updated field name
        client.Conatct_Number.toLowerCase().includes(value) || // Updated field name
        client.Location.toLowerCase().includes(value)
    );
    setFilteredClients(filtered);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      axios
        .put(`/api/clients/${selectedClientId}`, formData)
        .then(() => {
          Swal.fire(
            "Updated!",
            "Client details updated successfully",
            "success"
          );
          fetchClients();
          closeModal();
        })
        .catch(() => {
          Swal.fire("Error!", "Failed to update client", "error");
        });
    } else {
      axios
        .post("/api/clients/", formData)
        .then((response) => {
          setClients([...clients, response.data]);
          setFilteredClients([...clients, response.data]);
          Swal.fire("Added!", "Client added successfully", "success");
          closeModal();
        })
        .catch(() => {
          Swal.fire("Error!", "Failed to add client", "error");
        });
    }
  };

  const handleDelete = (clientId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`/api/clients/${clientId}`)
          .then(() => {
            Swal.fire("Deleted!", "Client deleted successfully", "success");
            const updatedClients = clients.filter(
              (client) => client.client_id !== clientId
            );
            setClients(updatedClients);
            setFilteredClients(updatedClients);
          })
          .catch(() => {
            Swal.fire("Error!", "Failed to delete client", "error");
          });
      }
    });
  };

  const handleEdit = (client) => {
    setEditMode(true);
    setSelectedClientId(client.client_id);
    setFormData(client);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditMode(false);
    setSelectedClientId(null);
    setFormData({ Name: "", Emial: "", Conatct_Number: "", Location: "" }); // Updated field names
  };

  return (
    <div className="pb-20 pl-20 mx-10 my-24 ">
      <div className="flex justify-between">
        <div className="flex gap-4 items-center border border-gray-300 rounded-md w-[33%] px-4 py-2">
          <img
            className="object-none"
            src="./LeftColumn/search-normal.png"
            alt=""
          />
          <input
            className="w-full outline-none"
            type="text"
            placeholder="Search by Name, Email, Contact, or Location"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button
          type="button"
          className="px-10 py-2 text-xl text-white bg-blue-900 rounded-md"
          onClick={() => setIsOpen(true)}
        >
          Add
        </button>
      </div>

      <CustomModal isOpen={isOpen} onClose={closeModal}>
        <h2 className="mt-5 mb-4 text-xl font-bold text-center">
          {editMode ? "Edit Client Details" : "Add New Client"}
        </h2>
        <form onSubmit={handleSubmit}>
          {["Name", "Emial", "Conatct_Number", "Location"].map((field) => {
            const inputType =
              field === "Emial"
                ? "email"
                : field === "Conatct_Number"
                ? "tel"
                : "text";

            // Create placeholders based on field names
            const getPlaceholder = (fieldName) => {
              switch (fieldName) {
                case "Name":
                  return "Enter name";
                case "Emial":
                  return "Enter email address";
                case "Conatct_Number":
                  return "Enter contact number";
                case "Location":
                  return "Enter location";
                default:
                  return `Enter ${fieldName.toLowerCase()}`;
              }
            };

            return (
              <div key={field} className="mb-3">
                <label className="block pb-1">
                  {field === "Emial"
                    ? "Email"
                    : field === "Conatct_Number"
                    ? "Contact Number"
                    : field.replace("_", " ")}
                </label>
                <input
                  className="w-full p-2 border rounded-md"
                  type={inputType}
                  name={field}
                  value={formData[field]}
                  placeholder={getPlaceholder(field)}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (field === "Conatct_Number") {
                      // Allow only numbers and limit to 10 digits
                      value = value.replace(/\D/g, "").slice(0, 10);
                    }
                    handleChange({ target: { name: field, value } });
                  }}
                  required
                  {...(field === "Conatct_Number" && {
                    maxLength: 10,
                    pattern: "\\d{10}",
                    title: "Phone number must be exactly 10 digits",
                  })}
                />
              </div>
            );
          })}
          <div className="text-center">
            <button
              type="submit"
              className="px-5 py-2 text-white bg-blue-900 rounded-md "
            >
              {editMode ? "Update Client" : "Add Client"}
            </button>
          </div>
        </form>
      </CustomModal>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-center border border-gray-300">
          <thead className="w-full h-12 text-white bg-blue-800">
            <tr>
              <th className="w-1/5 px-4 py-2 border">Name</th>
              <th className="w-1/5 px-4 py-2 border">Email</th>
              <th className="w-1/5 px-4 py-2 border">Contact Number</th>
              <th className="w-1/5 px-4 py-2 border">Location</th>
              <th className="w-1/5 px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody className="mb-12">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr key={client.client_id} className="border">
                  <td className="px-4 py-2 border">{client.Name}</td>
                  <td className="px-4 py-2 border text-wrap">{client.Emial}</td>
                  <td className="px-4 py-2 border">{client.Conatct_Number}</td>
                  <td className="px-4 py-2 border">{client.Location}</td>
                  <td className="flex justify-center gap-4 px-4 py-2">
                    <FaEdit
                      className="text-blue-600 cursor-pointer"
                      onClick={() => handleEdit(client)}
                    />
                    <MdDelete
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleDelete(client.client_id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-gray-500">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Client;
