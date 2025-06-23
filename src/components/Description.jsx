
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { MdCancel } from "react-icons/md";
import axios from "../helper/axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const Descriptions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [descriptionModal, setDescriptionModal] = useState(false);
  const [descriptions, setDescriptions] = useState([]);
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        const response = await axios.get("/api/descriptions/");
        setDescriptions(response.data);
        setLoading(false);
      } catch (error) {
        //console.error("Error fetching descriptions:", error);
        setError("Failed to fetch descriptions.");
        setLoading(false);
      }
    };

    fetchDescriptions();
  }, []);

  const handleAddDescription = async () => {
    if (!newDescription.trim()) {
      setError("Description cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("/api/description/", {
        description: newDescription,
      });

      setDescriptions([...descriptions, response.data]);
      setNewDescription("");
      setDescriptionModal(false);
      setError("");

      Swal.fire({
        icon: "success",
        title: "Description Added!",
        text: "New description has been successfully saved.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      setError("Failed to add description. Please try again.");

      Swal.fire({
        icon: "error",
        title: "Failed to Add Description",
        text: error.response?.data?.detail || "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="my-8 ">
      <div className="p-6 mt-8 rounded-lg shadow-md">
      <div className="flex items-center justify-between p-5">
        <h3 className="mb-2 text-lg font-semibold text-gray-700">Description Details</h3>
        <button
          onClick={() => setDescriptionModal(true)}
          className="px-6 py-3 text-white transition bg-blue-800 rounded-md shadow-md hover:bg-blue-900"
        >
          Add Description
        </button>
        </div>
        {loading ? (
          <p className="text-gray-600">Loading descriptions...</p>
        ) : descriptions.length > 0 ? (
          <div className="max-w-3xl text-center">
            <table className="w-full text-center bg-white border-collapse rounded-lg shadow-md">
              <thead>
                <tr className="text-white bg-blue-800">
                  <th className="p-3">ID</th>
                  <th className="p-3">Description</th>
                  
                </tr>
              </thead>
              <tbody>
                {descriptions.map((desc) => (
                  <tr key={desc.des_id} className="border hover:bg-gray-100">
                    <td className="p-3 border">{desc.des_id}</td>
                    <td className="p-3 border text-wrap">{desc.description}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-red-500">No descriptions available.</p>
        )}
      </div>

      <Modal
        isOpen={descriptionModal}
        onRequestClose={() => setDescriptionModal(false)}
        className="fixed inset-0 flex items-center justify-center backdrop-blur-[3px]"
      >
        <div className="relative p-6 bg-white rounded-lg shadow-lg w-96">
          <button
            onClick={() => setDescriptionModal(false)}
            className="absolute text-gray-500 top-2 right-2 hover:text-red-800"
          >
            <MdCancel size={20} />
          </button>
          <h2 className="py-2 mt-3 font-semibold text-md">Add New Description</h2>
          <input
            className="w-full px-4 py-2 mt-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            
            placeholder="Enter new description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          {/* {error && <p className="mt-2 text-red-500">{error}</p>} */}
          <div className="flex justify-end ">
            <button
              onClick={handleAddDescription}
              className="w-24 px-4 py-3 mx-auto mt-4 text-white transition bg-blue-800 rounded-md hover:bg-blue-900"
            >
              Add
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Descriptions;