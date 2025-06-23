import { useState } from "react";
import Model from "react-modal";
import { MdCancel } from "react-icons/md";
import { useEffect } from "react";
import axios from "../helper/axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2
import Descriptions from "./Description";

const InputField = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [newPropertyType, setNewPropertyType] = useState("");
  const [type, setType] = useState("Property");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await axios.get("/api/property_types/");
        setPropertyTypes(
          Array.isArray(response.data) ? response.data : [response.data]
        );
      } catch (error) {
        setError("Failed to fetch property types.");
      }
    };
    fetchPropertyTypes();
  }, []);
  // Handle adding new property type
  const handleSave = async () => {
    if (!newPropertyType.trim()) {
      setError("Property type cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("api/property_types/", {
        category: newPropertyType,
      });

      setPropertyTypes([...propertyTypes, response.data]);
      setNewPropertyType("");
      setIsOpen(false);
      setError("");

      // Show success alert
      Swal.fire({
        icon: "success",
        title: "Property Type Added!",
        text: "The property type has been successfully added.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      setError("Failed to add property type. Please try again.");

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Failed to Add Property Type",
        text:
          error.response?.data?.detail ||
          "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="pb-20 pl-20 mx-10 my-24 ">
      <div className="mt-7 ">
        <div className="flex items-center w-full gap-10">
          <div
            className={` shadow-xl rounded-md py-5 text-center w-1/4 hover:cursor-pointer ${
              type === "Property" ? "bg-blue-900 text-white" : "bg-white"
            }`}
            onClick={() => setType("Property")}
          >
            Property type
          </div>

          <div
            className={`py-5 rounded-md shadow-xl text-center w-1/4 hover:cursor-pointer ${
              type === "Description" ? "bg-blue-900 text-white" : "bg-white"
            }`}
            onClick={() => setType("Description")}
          >
            Description
          </div>
        </div>

        <div className="w-full">
          <Model
            isOpen={isOpen}
            style={{
              overlay: {
                backdropFilter: "blur(3px)",
                zIndex: 10,
              },
              content: {
                width: "350px",
                height: "225px",
                margin: "auto",
                borderRadius: "10px",
                boxShadow: "1px 1px 10px gray",
                backgroundColor: "white",
                overflow: "visible",
              },
            }}
          >
            <div className="px-4 my-3">
              <h1>Name</h1>

              <input
                className="w-full px-4 py-2 mt-4 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Enter new property type"
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value)}
              />
              {/* {error && <p className="mt-2 text-sm text-red-500">{error}</p>} */}
              <div className="flex justify-center">
                <button
                  onClick={handleSave}
                  className="flex w-24 px-8 py-3 text-white transition bg-blue-800 rounded-md mt-7 hover:bg-blue-900"
                >
                  Add
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(close);
              }}
            >
              <MdCancel className="absolute top-3 right-3 size-5 hover:text-red-800" />{" "}
            </button>
          </Model>
        </div>

        {type === "Property" ? (
          <div className="mt-8">
            <div className="p-6 mt-8 rounded-lg shadow-md">
              <div className="flex items-center justify-between p-5">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">
                  Property Details
                </h3>
                <button
                  onClick={() => {
                    setIsOpen(true);
                  }}
                  className="px-6 py-3 text-white transition bg-blue-800 rounded-md shadow-md hover:bg-blue-900"
                >
                  Add Property
                </button>
              </div>

              <table className="max-w-3xl text-center border border-gray-300 rounded-lg shadow-md ">
                <thead>
                  <tr className="h-12 text-white bg-blue-800">
                    <th className="px-4 py-3 border">ID</th>
                    <th className="px-4 py-3 border">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyTypes.length > 0 ? (
                    propertyTypes.map((item, index) => (
                      <tr
                        key={index}
                        className="text-gray-700 transition border hover:bg-gray-100"
                      >
                        <td className="p-4 border">{item.type_id || "N/A"}</td>
                        <td className="p-4 border">{item.category || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="p-4 text-gray-500 border">
                        No property types available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Descriptions />
        )}
      </div>
    </div>
  );
};

export default InputField;
