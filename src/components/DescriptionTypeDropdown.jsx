import { useEffect, useState, useRef } from "react";
import CommercialPropertyModal from "./CommercialPropertyModal";
import axios from "../helper/axios";

const DescriptionTypeDropdown = ({ onChange, setFurnishedId, desc, value, furnished_details , editProperty}) => {
  const [selectedType, setSelectedType] = useState({}); // Store selected object
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [DesId, setDesId] = useState("");
  const [showDesc, setShowDesc] = useState(true);
  const [selectedDescription, setSelectedDescription] = useState(""); // Displayed description text
  const [selectedDescId, setSelectedDescId] = useState(""); // Stored des_id value
  const [desCategories, setDesCategories] = useState([]);

  const dropdownRef = useRef(null);

  const fetchPropertyTypes = async () => {
    try {
      const response = await axios.get("/api/descriptions/");
      setDesCategories(response.data);
    } catch (error) {
      //console.error("Error fetching descripntions:", error);
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!desCategories.length || !value) return;

    // Find matching description by des_id
    const matchedType = desCategories.find(
      (type) => type.des_id === value
    );

    if (matchedType) {
      // If we find a match, set both the display text and the ID
      setSelectedDescription(matchedType.description.trim());
      setSelectedDescId(matchedType.des_id);
    } else {
      // If no match is found but we have a description from props
      // This handles cases where we only have the description text
      if (desc) {
        setSelectedDescription(desc);
        
        // Try to find matching des_id based on description
        const descMatch = desCategories.find(
          (type) => type.description.trim().toLowerCase() === desc.toLowerCase()
        );
        
        if (descMatch) {
          setSelectedDescId(descMatch.des_id);
          // Update parent with the matched des_id
          if (onChange) {
            onChange(descMatch.des_id);
          }
        }
      }
    }
  }, [value, desCategories, desc, onChange]);


  const handleTypeSelect = (type) => {
    // console.log(type.des_id);
    setDesId(type.des_id);
    setSelectedType(type);
    setShowDropdown(false);
    setSelectedDescription(type.description.trim());
    setSelectedDescId(type.des_id);

    if (onChange) {
      onChange(type.des_id);
    }

    if (type.description.toLowerCase() === "furnished") {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold">Description</label>
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex"
      >
        <input
          type="text"
          value={selectedType.description || (showDesc && desc)} // Show description name
          readOnly
          className="h-10 w-full mt-2 p-3 border border-[#D3DAEE] rounded-lg shadow-sm cursor-pointer"
        />
        <img
          className={`object-none absolute bottom-4 right-[8px] ${
            showDropdown && "rotate-180"
          }`}
          src="./LeftColumn/Closed.png"
          alt="dropdown indicator"
        />
      </div>
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {desCategories.map((type) => (
            <div
              key={type.des_id} // Use des_code as key
              className="p-3 cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={() => {
                handleTypeSelect(type);
                setShowDesc(false);
              }}
              //value={selectedType.description || ""}
            >
              {type.description}
            </div>
          ))}
        </div>
      )}
      <CommercialPropertyModal
        isOpen={isModalOpen}
        DesId={DesId}
        onClose={() => setIsModalOpen(false)}
        setFurnishedId={setFurnishedId}
        furnished_details={furnished_details}
        editProperty={editProperty}
      />
    </div>
  );
};

export default DescriptionTypeDropdown;
