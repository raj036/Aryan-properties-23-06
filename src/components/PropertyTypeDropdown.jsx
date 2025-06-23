import React, { useEffect, useState, useRef } from "react";
import axios from "../helper/axios";

const PropertyTypeDropdown = ({ onChange, value, propertyType , setIsPropertyChanged}) => {
  const [selectedType, setSelectedType] = useState(""); // Stores category name for UI
  const [selectedTypeId, setSelectedTypeId] = useState(""); // Stores type_id internally
  const [showDropdown, setShowDropdown] = useState(false);
  const [ProCategories, setProCategories] = useState([]); // Stores fetched property types
  const dropdownRef = useRef(null);
  const [showProperty, setShowProperty] = useState(true);

  // Fetch Property Types from API
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await axios.get("/api/property_types/");
        // console.log("📌 Fetched Property Types:", response.data);
        setProCategories(response.data);
      } catch (error) {
        //console.error("❌ Error fetching property types:", error);
      }
    };

    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    if (!ProCategories.length) return; // Prevent running before data loads

    // console.log("🔄 Running useEffect | value:", value, "| ProCategories:", ProCategories);

    // Case-insensitive matching based on category
    const matchedType = ProCategories.find(
      (type) => type.type_id === value || type.category.toLowerCase() === (value || '').toLowerCase()
    );

    // console.log("✅ Matched Type:", matchedType);

    if (matchedType) {
      setSelectedType(matchedType.category); // Display category name
      setSelectedTypeId(matchedType.type_id); // Ensure type_id is stored

      // Ensure that `onChange` always receives `type_id`
      if (onChange) {
        onChange(matchedType.type_id);
        // console.log("📤 Sent type_id to parent (useEffect):", matchedType.type_id);
      }
    } else {
      // Reset if no match found
      setSelectedType('');
      setSelectedTypeId('');
      
      // Optionally notify parent that no valid type was found
      if (onChange) {
        onChange(null);
      }
    }
  }, [value, ProCategories]);

  const handleTypeSelect = (type) => {
    // console.log("🖱 Selected Type:", type);
    setSelectedType(type.category.trim());
    setSelectedTypeId(type.type_id); // Ensure correct type_id is stored
    setShowDropdown(false);
    setIsPropertyChanged(true);

    if (onChange) {
      onChange(type.type_id); // Pass type_id to parent
      // console.log("📤 Sent type_id to parent:", type.type_id);
    }
  };
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
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold">Property Type</label>
      <div onClick={() => setShowDropdown(!showDropdown)} className="relative flex mt-[8px]">
        <input
          type="text"
          value={selectedType || showProperty && propertyType}
          readOnly
          className="h-10 w-full p-[12px] border border-[#D3DAEE] rounded-lg shadow-sm cursor-pointer"
        />
        <img
          className={`object-none absolute bottom-4 right-[8px] transition-transform duration-300 ${
            showDropdown ? "rotate-180" : "rotate-0"
          }`}
          src="./LeftColumn/Closed.png"
          alt="dropdown indicator"
        />
      </div>
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {ProCategories.map((item) => (
            <div
              key={item.type_id}
              className="p-3 cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={() => {handleTypeSelect(item); setShowProperty(false);}}
            >
              {item.category.trim()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyTypeDropdown;
