import { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import { Box } from "@mui/material";
import { useLogin } from "../../hooks/LoginContext";
import axios from "../../helper/axios";
const UserSidebar = ({ properties = [], currentFilters, onFilterChange }) => {
  const MIN_PRICE = 1000;
  const MAX_PRICE = 1000000;
  const MIN_SQFT = 0;
  const MAX_SQFT = 100000;
  const [squareSize, setSquareSize] = useState(["", ""]);
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [anyPrice, setAnyPrice] = useState(false);
  const { logout } = useLogin();
  const [currentDate, setCurrentDate] = useState("");

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

  const handleLogOut = () => {
    logout();
  };

  const uniquePropertyTypes = propertyTypes.map((type) => type.category);

  const filteredPropertyTypes = currentFilters.city
    ? uniquePropertyTypes.filter((category) =>
        properties.some(
          (p) =>
            p.city_name === currentFilters.city && p.property_type === category
        )
      )
    : uniquePropertyTypes;

  useEffect(() => {
    // Sync priceRange with currentFilters from parent
    setPriceRange(currentFilters.priceRange);
    setAnyPrice(currentFilters.anyPrice);
    // console.log(currentFilters, "data filtered");
    setSquareSize(currentFilters.areaSize || [MIN_SQFT, MAX_SQFT]);
  }, [currentFilters]);

  const handleAnyPriceChange = (event) => {
    const checked = event.target.checked;
    setAnyPrice(checked);
    if (checked) {
      setPriceRange([MIN_PRICE, MAX_PRICE]);
      onFilterChange({ priceRange: [MIN_PRICE, MAX_PRICE], anyPrice: true });
    } else {
      onFilterChange({ priceRange, anyPrice: false });
    }
  };

  // Handle price range slider change
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    onFilterChange({ priceRange: newValue, anyPrice: false }); // Propagate the change to the parent component
  };

  //Handle carpet size update
  const handleCarpetSizeChange = (index, value) => {
    const updatedSize = [...squareSize];
    updatedSize[index] = value; // Ensure it's a number
    setSquareSize(updatedSize);
    onFilterChange({ areaSize: updatedSize }); // Send update to parent
  };

  // Handle city selection
  const handleCityChange = (event) => {
    onFilterChange({
      city: event.target.value,
      propertyType: "", // Reset property type when city changes
    });
  };

  // Handle property type selection
  const handlePropertyTypeChange = (propertyType) => {
    // Get current selected property types (or initialize empty array)
    const currentTypes = Array.isArray(currentFilters.propertyType)
      ? [...currentFilters.propertyType]
      : [];

    let updatedTypes;
    if (currentTypes.includes(propertyType)) {
      // If already selected, remove it
      updatedTypes = currentTypes.filter((type) => type !== propertyType);
    } else {
      // If not selected, add it
      updatedTypes = [...currentTypes, propertyType];
    }

    onFilterChange({ propertyType: updatedTypes });
  };

  const handleSelectAll = () => {
    const allSelected =
      Array.isArray(currentFilters.propertyType) &&
      currentFilters.propertyType.length === filteredPropertyTypes.length;
  
    onFilterChange({ propertyType: allSelected ? [] : filteredPropertyTypes });
  };

  // Get unique cities from properties
  const availableCities = [...new Set(properties.map((p) => p.city_name))];

  // // Get property types based on selected city
  // const filteredPropertyTypes = currentFilters.city
  //   ? [
  //       ...new Set(
  //         properties
  //           .filter((p) => p.city_name === currentFilters.city)
  //           .map((p) => p.property_type)
  //       ),
  //     ]
  //   : [...new Set(properties.map((p) => p.property_type))];

  // Update current date every second
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(now);
      setCurrentDate(formattedDate);
    };

    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex transition-all duration-300 w-[20%] overflow-y-auto border-r-gray-300 border-[1px]">
      <aside className="w-full p-[15px]">
        <div className="flex items-center gap-4">
          <img
            src="./LeftColumn/Logo.png"
            alt="logo"
            className="object-contain w-18 h-18"
          />
          <div className="mt-3">
            <h1 className="text-lg font-bold">Welcome, ARYANS</h1>
            <p className="text-sm text-gray-500 mt">{currentDate}</p>
          </div>
        </div>

        {/* City Filter */}
        <div className="p-3 mt-6">
          <label className="block mb-2 font-medium text-gray-500">City</label>
          <select
            className="border rounded p-2 w-[100%]"
            onChange={handleCityChange}
            value={currentFilters.city}
          >
            <option value="">All Cities</option>
            {availableCities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type Filter */}
        <div className="p-3">
          <h2 className="mb-3 font-medium text-gray-500">Property Type</h2>
          <div className={` gap-3`}>
            {/* "All" Checkbox */}
            <label className="flex items-center break-words">
              <input
                type="checkbox"
                value="all"
                onChange={handleSelectAll}
                checked={
                  Array.isArray(currentFilters.propertyType) &&
                  currentFilters.propertyType.length ===
                    filteredPropertyTypes.length
                }
              />
              <span className="mx-2 break-words whitespace-normal">
                All Properties
              </span>
            </label>

            {/* Individual Property Type Checkboxes */}
            {filteredPropertyTypes.map((category, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={category}
                  onChange={() => {
                    const updatedSelection =
                      currentFilters.propertyType.includes(category)
                        ? currentFilters.propertyType.filter(
                            (type) => type !== category
                          ) // ✅ Remove if already selected
                        : [...currentFilters.propertyType, category]; // ✅ Add if not selected

                    onFilterChange({ propertyType: updatedSelection });
                  }}
                  checked={currentFilters.propertyType.includes(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range filter  */}
        <div className="w-full max-w-sm p-3">
          <label className="block mb-2 font-medium text-gray-500">
            Price Range
          </label>
          <Box sx={{ width: "100%", paddingBottom: "1rem" }}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value.toLocaleString()}`}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1000}
              disabled={anyPrice}
              sx={{
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                  backgroundColor: "blue",
                  borderRadius: "50%",
                },
                "& .MuiSlider-rail": {
                  opacity: 0.2,
                },
                "& .MuiSlider-track": {
                  backgroundColor: "blue",
                },
              }}
            />
          </Box>
          <div className="flex items-center justify-between -mt-4 text-sm text-gray-500">
            <div>₹{priceRange[0].toLocaleString()}</div>
            <div>₹{priceRange[1].toLocaleString()}</div>
          </div>
        </div>

        {/* Any Price Checkbox */}
        <label className="flex items-center gap-2 p-3">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-500"
            checked={anyPrice}
            onChange={handleAnyPriceChange}
          />
          <span>Any Price</span>
        </label>

        {/* Size Filter */}
        <div className="mt-4">
          <label className="block mb-2 font-medium text-gray-500">Size</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              min={MIN_SQFT}
              max={MAX_SQFT}
              value={squareSize[0]}
              onChange={(e) => handleCarpetSizeChange(0, e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              min={MIN_SQFT}
              max={MAX_SQFT}
              value={squareSize[1]}
              onChange={(e) => handleCarpetSizeChange(1, e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="w-[20%] items-center flex text-gray-500">
              sq ft
            </span>
          </div>
          {/* <div className="flex items-center justify-between -mt-4 text-sm text-gray-500">
            <div>₹{squareSize[0].toLocaleString()}</div>
            <div>₹{squareSize[1].toLocaleString()}</div>
          </div> */}
        </div>

        {/* Logout Button */}
        <div className="flex items-center justify-center mt-8 pb-8 space-x-3">
          <button
            onClick={handleLogOut}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
};

export default UserSidebar;
