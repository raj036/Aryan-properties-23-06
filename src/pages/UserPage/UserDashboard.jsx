import { useState, useEffect } from "react";
import PropertyForm from "../../components/PropertyForm";
import axios from "../../helper/axios";
import Swal from "sweetalert2";
import UserSidebar from "./UserSidebar.jsx";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { BsDownload } from "react-icons/bs";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { useRef } from "react";

const UserDashboard = () => {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const [filteredPropertiesSidebar, setFilteredPropertiesSidebar] = useState(
    []
  );
  const [filter, setFilter] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [filters, setFilters] = useState({
    propertyType: [],
    city: "",
    priceRange: [1000, 1000000],
    anyPrice: true,
    areaSize: [0, 100000],
  });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isEast, setIsEast] = useState(false);
  const [isWest, setIsWest] = useState(false);
  const MIN_SQFT = 0;
  const MAX_SQFT = 100000;
  const [squareSize, setSquareSize] = useState(["", ""]);
  const [funUnfurn, setFunUnfurn] = useState("");
  const [FilterArea, setFilterArea] = useState([]);
  const [showfilterdata, setshowfilterData] = useState(false);
  const [selectedLLOutright, setSelectedLLOutright] = useState(""); // State for LL/Outright
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [shouldRefreshFilters, setShouldRefreshFilters] = useState(false);
  const [editProperty, setEditProperty] = useState(false);
  const [property, setProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const dropdownRef = useRef(null);
    const [expandedRemarks, setExpandedRemarks] = useState({});
  
    // Toggle function for showing/hiding remarks
    const toggleRemarks = (propertyCode) => {
      setExpandedRemarks((prev) => ({
        ...prev,
        [propertyCode]: !prev[propertyCode],
      }));
    };
  
  useEffect(() => {
    if (selectedProperties.length > 5) {
      setSelectedProperties([]);
    }
  }, [selectedProperties]);

  const fetchPropertyTypes = async () => {
    try {
      const response = await axios.get("/api/descriptions/");
      setPropertyTypes(response.data);
    } catch (error) {
      //console.error("Error fetching descriptions:", error);
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
    // console.log(propertyTypes, "property Types");
  }, []);

  const applyFilter = () => {
    fetchProperties();
    // showFilter();
  };

  const FetchfilterArea = async () => {
    try {
      const response = await axios.get("/api/filter_area/");
      // console.log(response.data, "filterdata");
      const sortedData = response.data.sort((a, b) =>
        a.area_name.trim().localeCompare(b.area_name.trim())
      );
      setFilterArea(sortedData);
    } catch (e) {
      //console.log("error", e);
    }
  };

  useEffect(() => {
    fetchProperties();
    FetchfilterArea();
  }, []);

  useEffect(() => {
    if (shouldRefreshFilters) {
      // No need to fetch from API again, just update filtered properties
      const filtered = getFilteredProperties();
      setFilteredPropertiesSidebar(filtered);
      setShouldRefreshFilters(false);
    }
  }, [filters, shouldRefreshFilters]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(
        `/api/get_all_properties/?from_area=${from}&to_area=${to}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data);

      if (!response.data) throw new Error("No data received");

      // Transform the API response to match the expected structure
      const transformedProperties = response.data.map((property) => ({
        furnished_details: property.furnished_details,
        created_by: property.user_name || "-",
        building: property.building_name || "-",
        property_code: property.property_code || "-",
        address: property.full_address || "-",
        city_name: property.city || "-",
        location: property.areas[0].area_name || "-",
        area_name: property.sublocation || "-",
        property_type: property.property_type || "-",
        lease_type: property.LL_outright || "-",
        c_status: property.poss_status || "-",
        outright_rate_psf: property.areas[0]?.outright_rate_psf || "-",
        terrace_area: property.areas[0]?.terrace_area || "-",
        remarks: property.areas[0]?.remarks || "-",
        rental_psf: property.areas[0]?.rental_psf || "-",
        company: property.contacts[0]?.company_builder_name || "-",
        description: property.description || "-",
        outright: property.LL_outright || "-",
        poss_status: property.poss_status || "-",
        pin_code: "-",
        east_west: property.east_west || "-",
        reopen: property.reopen_data || "-",
        created_date: property.created_date || "-",
        floor: property.areas[0]?.floor_wing_unit_number || "-",
        car_parking: property.areas[0]?.car_parking || "-",
        efficiency: property.areas[0]?.efficiency || "-",
        areas_name: property.areas[0]?.area_name || "-",
        built_up_area: property.areas[0]?.built_up_area || "-",
        carpet_up_area: property.areas[0]?.carpet_up_area || "-",
        // remarks: property.description || "-",
        contact_person1: property.contacts[0]?.conatact_person_1 || "-",
        contact_person2: property.contacts[0]?.conatact_person_2 || "-",
        company_builder_name: property.contacts[0]?.company_builder_name || "-",
        conatact_person_number_1:
          property.contacts[0]?.conatact_person_number_1 || "-",
        conatact_person_number_2:
          property.contacts[0]?.conatact_person_number_2 || "-",
        builderaddress: property.contacts[0]?.address || "-",
        email: property.contacts[0]?.email || "-",
        reffered_by: property.contacts[0]?.reffered_by || "-",
        contact_person_address: property.contacts[0]?.address || "-",
      }));
      // console.log(transformedProperties);
      setProperties(transformedProperties);
      setFilteredPropertiesSidebar(transformedProperties);
      setLoading(false);
    } catch (err) {
      //console.error("Error fetching properties:", err);
      setError(err.message || "Failed to fetch properties");
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilter(false);
      }
    };

    if (filter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filter]);

  const handleCheckboxChange = (property) => {
    if (
      selectedProperties.some((p) => p.property_code === property.property_code)
    ) {
      setSelectedProperties(
        selectedProperties.filter(
          (p) => p.property_code !== property.property_code
        )
      );
    } else {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const getFilteredProperties = () => {
    return properties.filter((property) => {
      const rateBuyNumeric =
        typeof property.outright_rate_psf === "string" && property.rate_buy !== "-"
          ? parseFloat(property.outright_rate_psf.replace(/[^0-9.-]+/g, ""))
          : property.outright_rate_psf;

      const matchesSearch = Object.values(property).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDropdownPropertyType =
        !selectedPropertyType ||
        property.property_type === selectedPropertyType;

      const matchesLLOutright =
        !selectedLLOutright || property.outright === selectedLLOutright;

      const matchesFunUnfurn = !funUnfurn || property.description === funUnfurn;

      const matchesSidebarPropertyType =
        !filters.propertyType ||
        filters.propertyType.length === 0 ||
        filters.propertyType.includes(property.property_type);

      const matchesCity = !filters.city || property.city_name === filters.city;

      const matchesPrice =
        filters.anyPrice ||
        (typeof rateBuyNumeric === "number" &&
          rateBuyNumeric >= filters.priceRange[0] &&
          rateBuyNumeric <= filters.priceRange[1]);

      const matchesAreaSize =
        !filters.areaSize ||
        (property.carpet_up_area >= filters.areaSize[0] &&
          property.carpet_up_area <= filters.areaSize[1]);

      let matchesDirection = true;

      //(!isEast && !isWest) || (isEast && property.east_west == "east") || (isWest &&  property.east_west === "west");

      if ((isEast && isWest) || (!isEast && !isWest)) {
        matchesDirection = true;
      }
      // If only East is checked, show only East properties
      else if (isEast) {
        matchesDirection = property.east_west === "east";
      }
      // If only West is checked, show only West properties
      else if (isWest) {
        matchesDirection = property.east_west === "west";
      }

      return (
        matchesSearch &&
        matchesDropdownPropertyType &&
        matchesSidebarPropertyType &&
        matchesCity &&
        matchesPrice &&
        matchesAreaSize &&
        matchesFunUnfurn &&
        matchesLLOutright &&
        matchesDirection
      );
    });
  };

  // filter data on basis of Carpet Area
  const handleCarpetSizeChange = (index, value) => {
    const updatedSize = [...squareSize];
    updatedSize[index] = value; // Ensure it's a number
    setSquareSize(updatedSize);

    setFilters((prev) => ({
      ...prev,
      areaSize: updatedSize,
    }));
  };

  const showFilter = () => {
    setFilter(!filter);
  };
  useEffect(() => {
    if (to) {
      applyFilter();
    }
  }, [to]);

  useEffect(() => {
    // console.log("Filters updated:", filters);
  }, [filters]);

  // Handler for filter updates from sidebar
  const handleFilterUpdate = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));

    // Reset dropdown property type if sidebar property type is set
    if (newFilters.propertyType && newFilters.propertyType.length > 0) {
      setSelectedPropertyType("");
    }

    // Trigger re-filtering
    setShouldRefreshFilters(true);
  };

  const handlePropertyTypeChange = (e) => {
    const newValue = e.target.value;
    setSelectedPropertyType(newValue);

    // Reset sidebar property type filter
    setFilters((prev) => ({ ...prev, propertyType: "" }));

    // Trigger re-filtering
    setShouldRefreshFilters(true);
  };
  // console.log(handleFilterUpdate);

  const filteredProperties = getFilteredProperties();
  // Add this function to handle "Select All" and "Select None"
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties([...filteredProperties]);
    }
    setSelectAll(!selectAll);
  };

 const downloadAsExcel = (selectedProperties) => {
    // console.log("Selected Properties:", selectedProperties);
    if (selectedProperties.length === 0) {
      Swal.fire("Error", "Please select at least one property", "error");
      return;
    }
  
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
  
    // Check if any selected property has furnished_details
    const hasFurnishedDetails = selectedProperties.some(
      (property) =>
        property.furnished_details !== null &&
        property.furnished_details !== undefined
    );
  
    // Define headers based on whether furnished_details exists
    const headers = hasFurnishedDetails
      ? [
          "Building Name",
          "Location",
          "Sublocation",
          "Built-up Area (sq.ft.)",
          "Carpet Area (sq.ft.)",
          "Terrace ",
          "Floor/Unit/Wing",
          "License Fees",
          "Rate",
          "Contact Person Name 1",
          "Contact Person Number 1",
          "Contact Person Name 2",
          "Contact Person Number 2",
          "Referred By",
          "Executive Name",
          "Date",
          "Work Station",
          "Meeting Rooms",
          "Cubicle Type",
          "Linear Type",
          "Both Type",
          "Cabins",
          "Conference Rooms",
          "Cafeteria Seats",
          "Washrooms",
          "Pantry Area",
          "Backup UPS Room",
          "Server Electrical Room",
          "Reception Waiting Area",
        ]
      : [
          "Building Name",
          "Location",
          "Sublocation",
          "Built-up Area (sq.ft.)",
          "Carpet Area (sq.ft.)",
          "Terrace ",
          "Floor/Unit/Wing",
          "License Fees",
          "Rate",
          "Contact Person Name 1",
          "Contact Person Number 1",
          "Contact Person Name 2",
          "Contact Person Number 2",
          "Referred By",
          "Executive Name",
          "Date",
        ];
  
    // Convert selected properties into a row-wise format
    const data = [headers]; // First row = headers
  
    selectedProperties.forEach((property) => {
      const floorDetails =
        property.floor
          ?.map(
            (ele) =>
              `Floor: ${ele.floor} | Unit: ${ele.unit_number} | Wing: ${ele.wing}`
          )
          .join("\n") || "-";
  
      const rowData = [
        property.building || "-",                  // "Building Name"
        property.areas_name || "-",                // "Location" (mapped from areas[0].area_name)
        property.area_name || "-",                 // "Sublocation" (mapped from sublocation)
        property.built_up_area || "-",             // "Built-up Area (sq.ft.)"
        property.carpet_up_area || "-",            // "Carpet Area (sq.ft.)"
        property.terrace_area || "-",              // "Terrace "
        floorDetails,                              // "Floor/Unit/Wing"
        property.rental_psf || "-",                // "License Fees"
        property.outright_rate_psf || "-",         // "Rate"
        property.contact_person1 || "-",           // "Contact Person Name 1"
        property.conatact_person_number_1 || "-",  // "Contact Person Number 1"
        property.contact_person2 || "-",           // "Contact Person Name 2"
        property.conatact_person_number_2 || "-",  // "Contact Person Number 2"
        property.reffered_by || "-",               // "Referred By"
        property.created_by || "-",                // "Executive Name"
        property.created_date?.split("T")[0] || "-", // "Date"
      ];
  
      // Add furnished_details columns at the end if present
      if (hasFurnishedDetails) {
        rowData.push(
          property.furnished_details?.workstations || "-",           // "Work Station"
          property.furnished_details?.meeting_rooms || "-",          // "Meeting Rooms"
          property.furnished_details?.workstation_type_cubicle ? "Yes" : "No", // "Cubicle Type"
          property.furnished_details?.workstation_type_linear ? "Yes" : "No",  // "Linear Type"
          property.furnished_details?.workstation_type_both ? "Yes" : "No",    // "Both Type"
          property.furnished_details?.cabins || "-",                 // "Cabins"
          property.furnished_details?.conference_rooms || "-",       // "Conference Rooms"
          property.furnished_details?.cafeteria_seats || "-",        // "Cafeteria Seats"
          property.furnished_details?.washrooms || "-",              // "Washrooms"
          property.furnished_details?.pantry_area ? "Yes" : "No",    // "Pantry Area"
          property.furnished_details?.backup_ups_room ? "Yes" : "No",// "Backup UPS Room"
          property.furnished_details?.server_electrical_room ? "Yes" : "No", // "Server Electrical Room"
          property.furnished_details?.reception_waiting_area ? "Yes" : "No"  // "Reception Waiting Area"
        );
      }
  
      data.push(rowData);
    });
  
    // Add data to worksheet
    XLSX.utils.sheet_add_aoa(ws, data, { origin: "A1" });
  
    // Auto-adjust column widths
    ws["!cols"] = headers.map(() => ({ wch: 25 }));
  
    // Add sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Property Details");
  
    // Save the Excel file
    XLSX.writeFile(
      wb,
      `Properties_Export_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`
    );
  };

   const showContactDetails = (property) => {
     // Log the property to debug
    //  console.log("Property in showContactDetails:", property);
 
     // Check if furnished_details exists (not null or undefined)
     if (!property.furnished_details) {
      //  console.log("No furnished_details found, exiting.");
       return; // Exit if furnished_details is missing
     }
 
     Swal.fire({
       title: `<h2 style="color: #2c3e50; font-weight: 700; margin-bottom: 10px;">Furnished Details</h2>`,
       html: `
       <div style="text-align: left; font-size: 16px; color: #2c3e50; line-height: 1.6; width: auto; max-width: 450px; overflow: hidden;">
         <div class="furnished-details-section">
           <div class="furnished-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
             <div>
               <p><strong>Workstations:</strong> ${
                 property.furnished_details.workstations || "-"
               }</p>
               <p><strong>Cubicle Type:</strong> ${
                 property.furnished_details.workstation_type_cubicle
                   ? "Yes"
                   : "No"
               }</p>
               <p><strong>Linear Type:</strong> ${
                 property.furnished_details.workstation_type_linear
                   ? "Yes"
                   : "No"
               }</p>
               <p><strong>Both Types:</strong> ${
                 property.furnished_details.workstation_type_both ? "Yes" : "No"
               }</p>
               <p><strong>Cabins:</strong> ${
                 property.furnished_details.cabins || "-"
               }</p>
             </div>
             <div>
               <p><strong>Meeting Rooms:</strong> ${
                 property.furnished_details.meeting_rooms || "-"
               }</p>
               <p><strong>Conference Rooms:</strong> ${
                 property.furnished_details.conference_rooms || "-"
               }</p>
               <p><strong>Cafeteria Seats:</strong> ${
                 property.furnished_details.cafeteria_seats || "-"
               }</p>
               <p><strong>Washrooms:</strong> ${
                 property.furnished_details.washrooms || "-"
               }</p>
             </div>
           </div>
 
           <div className="additional-amenities" style="margin-top: 10px;">
             ${
               property.furnished_details.pantry_area ||
               property.furnished_details.backup_ups_room ||
               property.furnished_details.server_electrical_room ||
               property.furnished_details.reception_waiting_area
                 ? `
               <p><strong>Additional Amenities:</strong></p>
               <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                 ${
                   property.furnished_details.pantry_area
                     ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Pantry Area</span>'
                     : ""
                 }
                 ${
                   property.furnished_details.backup_ups_room
                     ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Backup UPS Room</span>'
                     : ""
                 }
                 ${
                   property.furnished_details.server_electrical_room
                     ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Server Electrical Room</span>'
                     : ""
                 }
                 ${
                   property.furnished_details.reception_waiting_area
                     ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Reception & Waiting Area</span>'
                     : ""
                 }
               </div>
               `
                 : ""
             }
           </div>
         </div>
       </div>`,
       confirmButtonText: "Close",
       width: "500px",
       background: "#ffffff",
       showClass: {
         popup: "animate__animated animate__fadeInDown",
       },
       hideClass: {
         popup: "animate__animated animate__fadeOutUp",
       },
     });
   };

  const handleDelete = async (id) => {
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
          .delete(`/api/delete_property/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            Swal.fire("Deleted!", "Property deleted successfully", "success");
            fetchProperties();
          })
          .catch(() => {
            Swal.fire("Error!", "Failed to delete property", "error");
          });
      }
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <UserSidebar
        properties={properties}
        onFilterChange={handleFilterUpdate}
        currentFilters={filters}
      />

      <div className="w-[100%] overflow-y-scroll">
        <div className="pb-20 pl-20 mx-2 my-24 ">
          <div className="flex gap-8 -mt-14 mb-7">
            <button className="text-xl text-gray-400 border-blue-900 hover:text-blue-900 hover:border-b-2">
              Properties
            </button>
            <button className="text-xl text-gray-400 hover:text-blue-900 hover:border-blue-900 hover:border-b-2 ">
              Clients
            </button>
          </div>
          <div className="flex justify-between h-10 ">
            <div className="w-[100%] flex gap-2">
              <select
                className="border border-gray-300 rounded p-1 w-[50%]"
                value={selectedPropertyType}
                onChange={handlePropertyTypeChange}
              >
                <option value="">All Properties</option>
                {[...new Set(properties.map((p) => p.property_type))].map(
                  (type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  )
                )}
              </select>
              <label className=" border border-gray-300 text-gray-400 rounded p-2 ml-6 w-[50%]">
                <option>Location</option>
              </label>
              <div className="relative w-full cursor-pointer right-[44px] top-[2px]">
                <div ref={dropdownRef}>
                  <div onClick={showFilter}>
                    <img
                      src="./LeftColumn/Filter.png"
                      alt=""
                      className="h-[35px]"
                    />
                  </div>
                  {filter && (
                    <div className="absolute z-20 p-4 bg-white border border-gray-300 rounded-md shadow-xl right-[95%] top-[140%]">
                      <h1 className="mb-3 text-lg font-semibold">
                        Locality range
                      </h1>
                      <div className="flex items-center gap-2 mb-3">
                        <select
                          onChange={(e) => setFrom(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>From</option>
                          {FilterArea.map((area) => (
                            <option key={area.property_code}>
                              {area.area_name}
                            </option>
                          ))}
                        </select>
                        <button className="p-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">
                          →
                        </button>
                        <select
                          onChange={(e) => setTo(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>To</option>
                          {FilterArea.map((area) => (
                            <option key={area.property_code}>
                              {area.area_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={isEast}
                            onChange={() => setIsEast(!isEast)}
                            className="w-4 h-4 border border-gray-300 rounded focus:ring-blue-500"
                          />
                          East
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={isWest}
                            onChange={() => setIsWest(!isWest)}
                            className="w-4 h-4 border border-gray-300 rounded focus:ring-blue-500"
                          />
                          West
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-[50%] mt-4">
                          <h2 className="text-gray-600">Area Range</h2>
                          <div className="flex gap-2 mt-2 mb-3">
                            <input
                              type="number"
                              placeholder="Min"
                              min={MIN_SQFT}
                              max={MAX_SQFT}
                              value={squareSize[0]}
                              onChange={(e) =>
                                handleCarpetSizeChange(0, e.target.value)
                              }
                              className="w-1/2 p-2 border rounded"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              min={MIN_SQFT}
                              max={MAX_SQFT}
                              value={squareSize[1]}
                              onChange={(e) =>
                                handleCarpetSizeChange(1, e.target.value)
                              }
                              className="w-1/2 p-2 border rounded"
                            />
                            <span className=" flex items-center text-gray-500 w-[20%] ">
                              sq ft
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col w-[50%] mt-4">
                          <label
                            htmlFor="propertyType"
                            className="text-gray-600"
                          >
                            Property Type
                          </label>
                          <select
                            id="propertyType"
                            className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedPropertyType}
                            onChange={handlePropertyTypeChange}
                          >
                            <option value="">All Properties</option>
                            {[
                              ...new Set(
                                properties.map((p) => p.property_type)
                              ),
                            ].map((type) => (
                              <option key={type} value={type}>
                               {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col w-[50%] mt-4">
                          <label htmlFor="funUnfurn" className="text-gray-600">
                            Description
                          </label>
                          <select
                            id="funUnfurn"
                            value={funUnfurn}
                            onChange={(e) => setFunUnfurn(e.target.value)}
                            className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select an option</option>
                            {propertyTypes.map((desc) => (
                              <option key={desc.des_id}>
                                {desc.description}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col w-[50%] mt-4">
                          <label htmlFor="llOutright" className="text-gray-600">
                            LL/Outright
                          </label>
                          <select
                            id="llOutright"
                            className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedLLOutright}
                            onChange={(e) =>
                              setSelectedLLOutright(e.target.value)
                            }
                          >
                            <option value="">Select an option</option>
                            {[
                              ...new Set(properties.map((p) => p.outright)),
                            ].map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-10 mt-8 mb-6">
                        <button
                          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                          onClick={showFilter}
                        >
                          Cancel
                        </button>
                        {/* <button
                        className="px-4 py-2 text-white transition-colors bg-blue-800 rounded-md hover:bg-blue-900"
                        onClick={applyFilter}
                      >
                        Apply filters
                      </button> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <button
                type="button"
                className="px-10 py-2 text-xl text-white bg-blue-900 rounded-md hover:bg-blue-800"
                onClick={() => setShowPropertyForm(true)}
              >
                Add
              </button>
            </div>
          </div>
          <div className="flex gap-4 items-center border border-gray-300 rounded-md w-[22%] px-4 py-2 mt-5">
            <img
              className="object-none"
              src="./LeftColumn/search-normal.png"
              alt="search"
            />
            <input
              className="w-full outline-none"
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {!showPropertyForm &&
            !editProperty &&
            !loading &&
            filteredProperties.length !== 0 && (
              <div className="flex items-center justify-between px-4 pt-6">
                {/* Left Section - Selected Count & Clear Button */}
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">
                    Selected:{" "}
                    <span className="font-semibold text-blue-600">
                      {selectedProperties.length}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedProperties([]);
                      setSelectAll(false);
                    }}
                    disabled={selectedProperties.length === 0}
                    className={`px-3 py-2 font-medium rounded-md transition-all duration-200 
          ${
            selectedProperties.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
                  >
                    Clear Selection
                  </button>
                </div>

                {/* Right Section - Export Button */}
                <button
              onClick={() => downloadAsExcel(selectedProperties)} // Updated to remove unnecessary event param
              disabled={selectedProperties.length === 0}
                  className={`px-5 flex items-center gap-2 py-2 font-medium rounded-md shadow-md transition-all duration-200 
        ${
          selectedProperties.length === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
                >
                  <BsDownload className="text-lg" />
                  <span>Export to Excel</span>
                </button>
              </div>
            )}

          {showPropertyForm || editProperty ? (
            <PropertyForm
              setShowPropertyForm={setShowPropertyForm}
              onSubmit={fetchProperties}
              setEditProperty={setEditProperty}
              editProperty={editProperty}
              property={property}
              fetchProperties={fetchProperties}

            />
          ) : (
            <div className="w-full overflow-x-auto">
              {loading ? (
                <div className="mt-8 text-center">Loading properties...</div>
              ) : filteredProperties.length === 0 && !showfilterdata ? (
                <div className="mt-8 text-center">No properties found</div>
              ) : (
                <table className="w-full mt-12 border border-collapse border-gray-300 min-w-max">
                  <thead>
                    <tr className="h-12 text-white bg-blue-800">
                      <th className="border max-w-24"></th>

                      <th className="px-4 border">Building Name</th>
                      {/* <th className="px-4 border">City</th> */}
                      <th className="px-4 border">Location</th>
                      <th className="px-4 border">Sublocation</th>
                      <th className="px-4 border text-wrap">
                        Built-up Area sq.ft.
                      </th>
                      <th className="px-4 border text-wrap">
                        Carpet Area sq.ft.
                      </th>
                      <th className="px-4 border text-wrap">Terrace</th>
                      <th className="px-4 border text-wrap">Floor/Wing</th>
                      <th className="px-4 border text-wrap">License Fees</th>
                      <th className="px-4 border text-wrap">Rate</th>
                      <th className="px-4 border text-wrap">
                        Contact Person Name 1
                      </th>
                      <th className="px-4 border text-wrap">
                        Contact Person Number 1
                      </th>
                      <th className="px-4 border text-wrap">
                        Contact Person Name 2
                      </th>
                      <th className="px-4 border text-wrap">
                        Contact Person Number 2{" "}
                      </th>
                      {/* <th className="px-4 border text-wrap">Email</th> */}

                      <th className="px-4 border text-wrap">Referred By</th>
                      <th className="px-4 border text-wrap ">
                        Executive Name{" "}
                      </th>
                      {/* <th className="px-4 border text-wrap ">
                      Remarks
                      </th> */}
                      <th className="px-4 border text-wrap">Date </th>
                      <th className="px-4 border text-wrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.length === 0 ? (
                      <tr>
                        <td colSpan="18" className="py-4 text-center">
                          <h3>No properties found</h3>
                        </td>
                      </tr>
                    ) : (
                      filteredProperties
                        .map((property, index) => (
                          <tr
                            key={index}
                            className="cursor-pointer hover:bg-gray-50"
                            // onClick={() => showContactDetails(property)}
                            onClick={(e) => {
                              showContactDetails(property); // First function
                              if (!e.target.closest('input[type="checkbox"]')) {
                                showContactDetails(property); // Second function
                              }
                            }}
                          >
                            <td
                              className="px-4 py-2 text-center break-all border"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedProperties.some(
                                  (p) =>
                                    p.property_code === property.property_code
                                )}
                                onChange={() => handleCheckboxChange(property)}
                                className="w-4 h-4 accent-blue-800"
                              />
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.building}
                            </td>
                            {/* <td className="px-4 py-2 border text-wrap">
                              {property.city_name}
                            </td> */}
                            {/* <td className="px-4 py-2 border text-wrap">
                              {property.east_west}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.address}
                            </td> */}
                            <td className="px-4 py-2 border text-wrap">
                              {property.areas_name}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.area_name}
                            </td>
                            {/* <td className="px-4 py-2 border text-wrap">
                              {property.description}
                            </td> */}
                            <td className="px-4 py-2 border text-wrap">
                              {property.built_up_area}{" "}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.carpet_up_area}{" "}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.terrace_area}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                }}
                              >
                                <tbody>
                                  {property.floor &&
                                  property.floor.length > 0 ? (
                                    property.floor.map((ele, index) => (
                                      <tr key={index}>
                                        <td
                                          style={{
                                            padding: "3px",
                                            border: "1px solid #ccc",
                                            textAlign: "center",
                                          }}
                                        >
                                          {ele.floor}
                                        </td>
                                        {/* <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center' }}>{ele.unit_number}</td> */}
                                        <td
                                          style={{
                                            padding: "3px",
                                            border: "1px solid #ccc",
                                            textAlign: "center",
                                          }}
                                        >
                                          {ele.wing}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="3"
                                        style={{
                                          padding: "3px",
                                          border: "1px solid #ccc",
                                          textAlign: "center",
                                        }}
                                      >
                                        -
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.rental_psf}
                            </td>

                            <td className="px-4 py-2 border text-wrap">
                              {property.outright_rate_psf}
                            </td>
                            {/* <td className="px-4 py-2 border text-wrap">
                              {property.poss_status}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.company_builder_name}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.builderaddress}
                            </td> */}
                            <td className="px-4 py-2 border text-wrap">
                              {property.contact_person1}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.conatact_person_number_1}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.contact_person2}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.conatact_person_number_2}
                            </td>
                            {/* <td className="px-4 py-2 border text-wrap">
                              {property.email}
                            </td> */}

                            <td className="px-4 py-2 border text-wrap">
                              {property.reffered_by}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              {property.created_by}
                            </td>
                            {/* <td className="px-4 py-2 break-words whitespace-normal border">
                          {property.remarks && property.remarks.length > 50 ? (
                            <div>
                              {expandedRemarks[property.property_code] ? (
                                <>
                                  {property.remarks}
                                  <button
                                    className="ml-2 text-blue-600 underline"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent row click
                                      toggleRemarks(property.property_code);
                                    }}
                                  >
                                    See Less
                                  </button>
                                </>
                              ) : (
                                <>
                                  {property.remarks.substring(0, 50)}...
                                  <button
                                    className="ml-2 text-blue-600 underline"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent row click
                                      toggleRemarks(property.property_code);
                                    }}
                                  >
                                    See More
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            property.remarks || "-"
                          )}
                        </td> */}
                            <td className="px-4 py-2 border text-wrap">
                              {property.created_date.split("T")[0]}
                            </td>
                            <td className="px-4 py-2 border text-wrap">
                              <div className="flex justify-center gap-4">
                                <FaEdit
                                  className="text-blue-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditProperty(true);
                                    setProperty(property);
                                  }}
                                />
                                <MdDelete
                                  className="text-red-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(property?.property_code);
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                        .reverse()
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
