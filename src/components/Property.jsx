import { useState, useEffect, useRef } from "react";
import PropertyForm from "./PropertyForm";
import axios from "../helper/axios";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { BsDownload } from "react-icons/bs";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const Property = () => {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProperty, setEditProperty] = useState(false);
  const [property, setProperty] = useState(null);
  const token = localStorage.getItem("token");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchProperties();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add this function to handle checkbox changes
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

  // Add this function to handle "Select All" and "Select None"
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties([...filteredProperties]);
    }
    setSelectAll(!selectAll);
  };

  const handleUpdate = async (id) => {
    // console.log("hi");
    try {
      await axios.put(`/api/update_property/${id}`, updatedProperty, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire("Updated!", "Property updated successfully", "success");
      fetchProperties(); // Refresh the data
      setShowPropertyForm(false);
      setSelectedProperty(null);
    } catch (error) {
      Swal.fire("Error!", "Failed to update property", "error");
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get("/api/get_all_properties/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      //console.log("Response", response.data[0]);
      // console.log("Raw API Response:", response.data);
      if (!response.data) throw new Error("No data received");

      // Transform the API response to match the expected structure
      const transformedProperties = response.data.map((property) => ({
        furnished_details: property.furnished_details,
        created_by: property.user_name || "-",
        building: property.building_name || "-",
        address: property.full_address || "-",
        city_name: property.city || "-",
        location: property.areas[0].area_name || "-",
        property_code: property.property_code || "-",
        area_name: property.sublocation || "-",
        property_type: property.property_type || "-",
        lease_type: property.LL_outright || "-",
        c_status: property.poss_status || "-",
        outright_rate_psf: property.areas[0]?.outright_rate_psf || "-",
        rental_psf: property.areas[0]?.rental_psf || "-",
        company: property.contacts[0]?.company_builder_name || "-",
        description: property.description || "-",
        outright: property.LL_outright || "-",
        poss_status: property.poss_status || "-",
        pin_code: "-", // Not provided in the API
        east_west: property.east_west || "-",
        reopen: property.reopen_data || "-",
        created_date: property.created_date || "-",
        floor: property.areas[0]?.floor_wing_unit_number || "-",
        car_parking: property.areas[0]?.car_parking || "-",
        terrace_area: property.areas[0]?.terrace_area || "-",
        remarks: property.areas[0]?.remarks || "-",
        efficiency: property.areas[0]?.efficiency || "-",
        areas_name: property.areas[0]?.area_name || "-",
        built_up_area: property.areas[0]?.built_up_area || "-",
        carpet_up_area: property.areas[0]?.carpet_up_area || "-",
        // description: property.description || "-",
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
      setLoading(false);
    } catch (err) {
      //console.error("Error fetching properties:", err);
      setError(err.message || "Failed to fetch properties");
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) =>
    Object.values(property).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  // const toggleDropdown = (e, id) => {
  //   e.stopPropagation();
  //   setOpenDropdownId(openDropdownId === id ? null : id);
  // };

  // const downloadAsPDF = (e, property) => {
  //   e.stopPropagation();
  //   setOpenDropdownId(null);

  //   const doc = new jsPDF();
  //   let yPosition = 20;
  //   const leftMargin = 20;
  //   const lineHeight = 10;

  //   // Helper function to add text with overflow handling
  //   const addText = (text, x, y, options = {}) => {
  //     const maxWidth = options.maxWidth || 170;
  //     if (y > 270) {
  //       doc.addPage();
  //       yPosition = 20;
  //       return yPosition;
  //     }
  //     doc.text(text, x, y, { maxWidth });
  //     return y + lineHeight;
  //   };

  //   // Add section title with horizontal line
  //   const addSectionTitle = (title) => {
  //     if (yPosition > 260) {
  //       doc.addPage();
  //       yPosition = 20;
  //     }

  //     doc.setFontSize(16);
  //     doc.setTextColor(0, 51, 153); // Dark blue color
  //     doc.setFont(undefined, "bold");
  //     yPosition = addText(title, leftMargin, yPosition);
  //     doc.setLineWidth(0.5);
  //     doc.setDrawColor(0, 51, 153); // Dark blue color
  //     doc.line(leftMargin, yPosition, 190, yPosition);
  //     yPosition += 5;
  //     doc.setFontSize(12);
  //     doc.setTextColor(0, 0, 0); // Reset to black
  //     doc.setFont(undefined, "normal");
  //     return yPosition;
  //   };

  //   // Function to add a table in PDF for floor wing unit data
  //   const addFloorWingUnitTable = (doc, property, startY) => {
  //     let yPosition = startY;

  //     // Check if we need a new page
  //     if (yPosition > 240) {
  //       doc.addPage();
  //       yPosition = 20;
  //     }

  //     // Table header
  //     doc.setFillColor(240, 240, 240); // Light gray background
  //     doc.rect(leftMargin, yPosition, 150, 10, "F");

  //     doc.setFontSize(12);
  //     doc.setTextColor(0, 0, 0);
  //     doc.setFont(undefined, "bold");
  //     doc.text("Floor", leftMargin + 5, yPosition + 7);
  //     doc.text("Wing", leftMargin + 55, yPosition + 7);
  //     doc.text("Unit Number", leftMargin + 105, yPosition + 7);
  //     yPosition += 10;

  //     // Check if floor_wing_unit_number exists and is an array
  //     if (
  //       property.floor_wing_unit_number &&
  //       Array.isArray(property.floor_wing_unit_number)
  //     ) {
  //       // Table rows - map through the array
  //       property.floor_wing_unit_number.forEach((item, index) => {
  //         // Check if we need a new page
  //         if (yPosition > 270) {
  //           doc.addPage();
  //           yPosition = 20;

  //           // Redraw header on new page
  //           doc.setFillColor(240, 240, 240);
  //           doc.rect(leftMargin, yPosition, 150, 10, "F");
  //           doc.setFont(undefined, "bold");
  //           doc.text("Floor", leftMargin + 5, yPosition + 7);
  //           doc.text("Wing", leftMargin + 55, yPosition + 7);
  //           doc.text("Unit Number", leftMargin + 105, yPosition + 7);
  //           yPosition += 10;
  //         }

  //         // Alternate row background
  //         if (index % 2 === 0) {
  //           doc.setFillColor(250, 250, 250);
  //           doc.rect(leftMargin, yPosition, 150, 10, "F");
  //         }

  //         doc.setFont(undefined, "normal");
  //         doc.text(item.floor || "-", leftMargin + 5, yPosition + 7);
  //         doc.text(item.wing || "-", leftMargin + 55, yPosition + 7);
  //         doc.text(item.unit_number || "-", leftMargin + 105, yPosition + 7);

  //         yPosition += 10;
  //       });
  //     } else {
  //       // If no data or not an array
  //       doc.setFont(undefined, "normal");
  //       doc.text(
  //         "No floor/wing/unit data available",
  //         leftMargin + 5,
  //         yPosition + 7
  //       );
  //       yPosition += 10;
  //     }

  //     // Draw table border
  //     const tableHeight =
  //       property.floor_wing_unit_number &&
  //       Array.isArray(property.floor_wing_unit_number)
  //         ? 10 + Math.min(property.floor_wing_unit_number.length, 25) * 10 // Limit height calculation for page breaks
  //         : 20;
  //     doc.setDrawColor(0, 51, 153); // Dark blue color
  //     doc.setLineWidth(0.5);

  //     // Draw table borders for current page
  //     const currentPageStartY = Math.max(
  //       startY,
  //       doc.internal.pageSize.height - yPosition + 10
  //     );
  //     const currentPageEndY = Math.min(
  //       startY + tableHeight,
  //       doc.internal.pageSize.height - 20
  //     );
  //     const currentPageHeight = currentPageEndY - currentPageStartY;

  //     if (currentPageHeight > 0) {
  //       doc.rect(leftMargin, currentPageStartY, 150, currentPageHeight);

  //       // Draw vertical lines for columns
  //       doc.line(
  //         leftMargin + 50,
  //         currentPageStartY,
  //         leftMargin + 50,
  //         currentPageEndY
  //       );
  //       doc.line(
  //         leftMargin + 100,
  //         currentPageStartY,
  //         leftMargin + 100,
  //         currentPageEndY
  //       );
  //     }

  //     return yPosition + 5;
  //   };

  //   // Title
  //   doc.setFontSize(22);
  //   doc.setTextColor(0, 51, 153); // Dark blue color
  //   doc.setFont(undefined, "bold");
  //   doc.text(`Property Details Report`, leftMargin, yPosition);
  //   yPosition += 15;
  //   doc.setFontSize(12);
  //   doc.setTextColor(0, 0, 0); // Reset to black
  //   doc.setFont(undefined, "normal");

  //   // Property Basic Information
  //   yPosition = addSectionTitle("Basic Information");
  //   yPosition = addText(
  //     `Building Name: ${property.building}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Property Code: ${property.property_code}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(`City: ${property.city_name}`, leftMargin, yPosition);
  //   yPosition = addText(
  //     `Location: ${property.location}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Sublocation: ${property.area_name}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(`Address: ${property.address}`, leftMargin, yPosition);
  //   yPosition = addText(
  //     `East/West: ${property.east_west}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Property Type: ${property.property_type}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Lease Type: ${property.lease_type}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `LL/Outright: ${property.outright}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Status: ${property.poss_status}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Description: ${property.description}`,
  //     leftMargin,
  //     yPosition,
  //     { maxWidth: 170 }
  //   );
  //   yPosition = addText(
  //     `Reopen Date: ${property.reopen}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Created By: ${property.created_by}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition += 5;

  //   // Area Information
  //   yPosition = addSectionTitle("Area Information");
  //   yPosition = addText(
  //     `Built-up Area: ${property.builtup} sqft`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Carpet Area: ${property.carpet} sqft`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Efficiency: ${property.efficiency}%`,
  //     leftMargin,
  //     yPosition
  //   );

  //   // Floor Wing Unit Table Section
  //   yPosition = addSectionTitle("Floor Wing Unit Details");
  //   yPosition = addFloorWingUnitTable(doc, property, yPosition);

  //   yPosition = addText(
  //     `Car Parking: ${property.car_parking}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Areas Name: ${property.areas_name}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition += 5;

  //   // Rate Information
  //   yPosition = addSectionTitle("Rate Information");
  //   yPosition = addText(
  //     `Buy Rate: ${property.rate_buy}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Lease Rate: ${property.rate_lease}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition += 5;

  //   // Contact Information
  //   yPosition = addSectionTitle("Contact Details");
  //   yPosition = addText(
  //     `Company/Builder Name: ${property.company_builder_name}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Builder Address: ${property.builderaddress}`,
  //     leftMargin,
  //     yPosition,
  //     { maxWidth: 170 }
  //   );
  //   yPosition = addText(
  //     `Contact Person 1: ${property.contact_person1}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Contact Number 1: ${property.conatact_person_number_1}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Contact Person 2: ${property.contact_person2}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Contact Number 2: ${property.conatact_person_number_2}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(`Email: ${property.email}`, leftMargin, yPosition);
  //   yPosition = addText(
  //     `Referred By: ${property.reffered_by}`,
  //     leftMargin,
  //     yPosition
  //   );
  //   yPosition = addText(
  //     `Contact Person Address: ${property.contact_person_address}`,
  //     leftMargin,
  //     yPosition,
  //     { maxWidth: 170 }
  //   );
  //   yPosition += 5;

  //   // Remarks
  //   yPosition = addSectionTitle("Additional Information");
  //   yPosition = addText(`Remarks: ${property.remarks}`, leftMargin, yPosition, {
  //     maxWidth: 170,
  //   });

  //   // Furnished Details (if available)
  //   if (property.furnished_details) {
  //     doc.addPage();
  //     yPosition = 20;

  //     // Add title to the new page
  //     doc.setFontSize(18);
  //     doc.setTextColor(0, 51, 153); // Dark blue color
  //     doc.setFont(undefined, "bold");
  //     doc.text(
  //       `Furnished Details - ${property.building}`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition += 15;
  //     doc.setFontSize(12);
  //     doc.setTextColor(0, 0, 0); // Reset to black
  //     doc.setFont(undefined, "normal");

  //     yPosition = addSectionTitle("Furnished Details");
  //     yPosition = addText(
  //       `Workstations: ${property.furnished_details.workstations}`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Cabins: ${property.furnished_details.cabins}`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Meeting Rooms: ${property.furnished_details.meeting_rooms}`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Conference Rooms: ${property.furnished_details.conference_rooms}`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Cafeteria Seats: ${property.furnished_details.cafeteria_seats}`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Washrooms: ${property.furnished_details.washrooms}`,
  //       leftMargin,
  //       yPosition
  //     );

  //     yPosition = addSectionTitle("Workstation Types");
  //     yPosition = addText(
  //       `Cubicle: ${
  //         property.furnished_details.workstation_type_cubicle ? "Yes" : "No"
  //       }`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Linear: ${
  //         property.furnished_details.workstation_type_linear ? "Yes" : "No"
  //       }`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Both: ${
  //         property.furnished_details.workstation_type_both ? "Yes" : "No"
  //       }`,
  //       leftMargin,
  //       yPosition
  //     );

  //     yPosition = addSectionTitle("Additional Amenities");
  //     yPosition = addText(
  //       `Pantry Area: ${property.furnished_details.pantry_area ? "Yes" : "No"}`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Backup UPS Room: ${
  //         property.furnished_details.backup_ups_room ? "Yes" : "No"
  //       }`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Server Electrical Room: ${
  //         property.furnished_details.server_electrical_room ? "Yes" : "No"
  //       }`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Reception & Waiting Area: ${
  //         property.furnished_details.reception_waiting_area ? "Yes" : "No"
  //       }`,
  //       leftMargin,
  //       yPosition
  //     );
  //     yPosition = addText(
  //       `Last Updated: ${property.furnished_details.edit_date || "-"}`,
  //       leftMargin,
  //       yPosition
  //     );
  //   }

  //   // Add footer with date and page numbers
  //   const totalPages = doc.internal.getNumberOfPages();
  //   for (let i = 1; i <= totalPages; i++) {
  //     doc.setPage(i);
  //     doc.setFontSize(10);
  //     doc.setTextColor(100);
  //     doc.text(
  //       `Generated on: ${new Date().toLocaleDateString()}`,
  //       leftMargin,
  //       285
  //     );
  //     doc.text(`Page ${i} of ${totalPages}`, 180, 285);
  //   }

  //   // Save the PDF
  //   doc.save(`${property.building}_${property.property_code}.pdf`);
  // };

  // const downloadAsExcel = () => {
  //   if (selectedProperties.length === 0) {
  //     Swal.fire("Error", "Please select at least one property", "error");
  //     return;
  //   }

  //   // Create workbook and worksheet
  //   const wb = XLSX.utils.book_new();
  //   const ws = XLSX.utils.aoa_to_sheet([]);

  //   // Set current row
  //   let currentRow = 0;

  //   // Style definitions
  //   const headerStyle = {
  //     font: { bold: true, color: { rgb: "FFFFFF" } },
  //     fill: { fgColor: { rgb: "003399" } },
  //   };
  //   const sectionStyle = {
  //     font: { bold: true },
  //     fill: { fgColor: { rgb: "E0E6F8" } },
  //   };

  //   // Add report header
  //   const reportTitle = ["PROPERTY DETAILS REPORT"];
  //   XLSX.utils.sheet_add_aoa(
  //     ws,
  //     [reportTitle.map((v) => ({ v, s: headerStyle }))],
  //     { origin: { r: currentRow, c: 0 } }
  //   );
  //   currentRow++;

  //   const generatedDate = [`Generated on: ${new Date().toLocaleDateString()}`];
  //   XLSX.utils.sheet_add_aoa(ws, [generatedDate], {
  //     origin: { r: currentRow, c: 0 },
  //   });
  //   currentRow += 2; // Add empty row after date

  //   // Process each selected property
  //   selectedProperties.forEach((property, index) => {
  //     // Add property separator if not the first property
  //     if (index > 0) {
  //       const separator = ["----------------------------------------"];
  //       XLSX.utils.sheet_add_aoa(ws, [separator], {
  //         origin: { r: currentRow, c: 0 },
  //       });
  //       currentRow += 2;
  //     }

  //     // Property title
  //     const propertyTitle = [
  //       `Property ${index + 1}: ${property.building} (${
  //         property.property_code
  //       })`,
  //     ];
  //     XLSX.utils.sheet_add_aoa(
  //       ws,
  //       [propertyTitle.map((v) => ({ v, s: sectionStyle }))],
  //       { origin: { r: currentRow, c: 0 } }
  //     );
  //     currentRow += 2;

  //     // Basic Information
  //     XLSX.utils.sheet_add_aoa(
  //       ws,
  //       [[{ v: "BASIC INFORMATION", s: sectionStyle }]],
  //       { origin: { r: currentRow, c: 0 } }
  //     );
  //     currentRow++;

  //     // Property data in horizontal layout (key-value pairs in columns)
  //     const basicInfo = [
  //       [
  //         "Building Name",
  //         property.building,
  //         "Property Code",
  //         property.property_code,
  //         "City",
  //         property.city_name,
  //       ],
  //       [
  //         "Location",
  //         property.location,
  //         "Sublocation",
  //         property.area_name,
  //         "Address",
  //         property.address,
  //       ],
  //       [
  //         "East/West",
  //         property.east_west,
  //         "Property Type",
  //         property.property_type,
  //         "Lease Type",
  //         property.lease_type,
  //       ],
  //       [
  //         "LL/Outright",
  //         property.outright,
  //         "Status",
  //         property.poss_status,
  //         "Description",
  //         property.description,
  //       ],
  //       [
  //         "Reopen Date",
  //         property.reopen,
  //         "Created By",
  //         property.created_by,
  //         "Date",
  //         property.created_date.split("T")[0],
  //       ],
  //     ];

  //     XLSX.utils.sheet_add_aoa(ws, basicInfo, {
  //       origin: { r: currentRow, c: 0 },
  //     });
  //     currentRow += basicInfo.length + 1;

  //     // Area Information
  //     XLSX.utils.sheet_add_aoa(
  //       ws,
  //       [[{ v: "AREA INFORMATION", s: sectionStyle }]],
  //       { origin: { r: currentRow, c: 0 } }
  //     );
  //     currentRow++;

  //     const areaInfo = [
  //       [
  //         "Built-up Area (sqft)",
  //         property.builtup,
  //         "Carpet Area (sqft)",
  //         property.carpet,
  //         "Efficiency (%)",
  //         property.efficiency,
  //       ],
  //       [
  //         "Floor/Wing/Unit",
  //         property.floor,
  //         "Car Parking",
  //         property.car_parking,
  //         "Areas Name",
  //         property.areas_name,
  //       ],
  //     ];

  //     XLSX.utils.sheet_add_aoa(ws, areaInfo, {
  //       origin: { r: currentRow, c: 0 },
  //     });
  //     currentRow += areaInfo.length + 1;

  //     // Rate Information
  //     XLSX.utils.sheet_add_aoa(
  //       ws,
  //       [[{ v: "RATE INFORMATION", s: sectionStyle }]],
  //       { origin: { r: currentRow, c: 0 } }
  //     );
  //     currentRow++;

  //     const rateInfo = [
  //       [
  //         "Buy Rate",
  //         property.rate_buy,
  //         "Lease Rate",
  //         property.rate_lease,
  //         "",
  //         "",
  //       ],
  //     ];

  //     XLSX.utils.sheet_add_aoa(ws, rateInfo, {
  //       origin: { r: currentRow, c: 0 },
  //     });
  //     currentRow += rateInfo.length + 1;

  //     // Contact Details
  //     XLSX.utils.sheet_add_aoa(
  //       ws,
  //       [[{ v: "CONTACT DETAILS", s: sectionStyle }]],
  //       { origin: { r: currentRow, c: 0 } }
  //     );
  //     currentRow++;

  //     const contactInfo = [
  //       [
  //         "Company/Builder Name",
  //         property.company_builder_name,
  //         "Builder Address",
  //         property.builderaddress,
  //         "",
  //         "",
  //       ],
  //       [
  //         "Contact Person 1",
  //         property.contact_person1,
  //         "Contact Number 1",
  //         property.conatact_person_number_1,
  //         "",
  //         "",
  //       ],
  //       [
  //         "Contact Person 2",
  //         property.contact_person2,
  //         "Contact Number 2",
  //         property.conatact_person_number_2,
  //         "",
  //         "",
  //       ],
  //       [
  //         "Email",
  //         property.email,
  //         "Referred By",
  //         property.reffered_by,
  //         "Contact Address",
  //         property.contact_person_address,
  //       ],
  //     ];

  //     XLSX.utils.sheet_add_aoa(ws, contactInfo, {
  //       origin: { r: currentRow, c: 0 },
  //     });
  //     currentRow += contactInfo.length + 1;

  //     // Additional Information
  //     XLSX.utils.sheet_add_aoa(
  //       ws,
  //       [[{ v: "ADDITIONAL INFORMATION", s: sectionStyle }]],
  //       { origin: { r: currentRow, c: 0 } }
  //     );
  //     currentRow++;

  //     const additionalInfo = [["Remarks", property.remarks, "", "", "", ""]];

  //     XLSX.utils.sheet_add_aoa(ws, additionalInfo, {
  //       origin: { r: currentRow, c: 0 },
  //     });
  //     currentRow += additionalInfo.length + 2; // Add extra space between properties
  //   });

  //   // Set column widths
  //   const wscols = [
  //     { wch: 18 },
  //     { wch: 22 },
  //     { wch: 18 },
  //     { wch: 22 },
  //     { wch: 18 },
  //     { wch: 22 },
  //   ];
  //   ws["!cols"] = wscols;

  //   // Add sheet to workbook
  //   XLSX.utils.book_append_sheet(wb, ws, "Property Details");

  //   // Save the Excel file
  //   XLSX.writeFile(
  //     wb,
  //     `Properties_Export_${new Date()
  //       .toLocaleDateString()
  //       .replace(/\//g, "-")}.xlsx`
  //   );
  // };

  // const downloadAsExcel = () => {
  //   if (selectedProperties.length === 0) {
  //     Swal.fire("Error", "Please select at least one property", "error");
  //     return;
  //   }

  //   // Create workbook and worksheet
  //   const wb = XLSX.utils.book_new();
  //   const ws = XLSX.utils.aoa_to_sheet([]);

  //   // Define headers (Column Titles)
  //   const headers = [
  //     "Building Name",
  //     "Location",
  //     "Sublocation",
  //     "Built-up Area (sq.ft.)",
  //     "Carpet Area (sq.ft.)",
  //     "Floor/Unit/Wing",
  //     "License Fees",
  //     "Rate",
  //     "Contact Person Name 1",
  //     "Contact Person Number 1",
  //     "Contact Person Name 2",
  //     "Contact Person Number 2",
  //     "Referred By",
  //     "Executive Name",
  //     "Date",
  //   ];

  //   // Convert selected properties into a row-wise format
  //   const data = [headers]; // First row = headers

  //   selectedProperties.forEach((property) => {
  //     // 🏢 Format floor details (Each floor data as "Floor | Unit | Wing")
  //     const floorDetails =
  //       property.floor
  //         ?.map(
  //           (ele) =>
  //             `Floor: ${ele.floor} | Unit: ${ele.unit_number} | Wing: ${ele.wing}`
  //         )
  //         .join("\n") || "-"; // Join multiple entries with line breaks

  //         data.push([
  //           property.building || "-",
  //           property.areas_name || "-",
  //           property.area_name || "-",
  //           property.builtup || "-",
  //           property.carpet || "-",
  //           floorDetails,
  //           property.rate_lease || "-",
  //           property.rate_buy || "-",
  //           property.contact_person1 || "-",
  //           property.conatact_person_number_1 || "-",
  //           property.contact_person2 || "-",
  //           property.conatact_person_number_2 || "-",
  //           property.reffered_by || "-",
  //           property.created_by || "-",
  //           property.created_date.split("T")[0] || "-",
  //         ]).reverse();
  //   });

  //   // Add data to worksheet
  //   XLSX.utils.sheet_add_aoa(ws, data, { origin: "A1" });

  //   // Auto-adjust column widths
  //   ws["!cols"] = headers.map(() => ({ wch: 25 }));

  //   // Add sheet to workbook
  //   XLSX.utils.book_append_sheet(wb, ws, "Property Details");

  //   // Save the Excel file
  //   XLSX.writeFile(
  //     wb,
  //     `Properties_Export_${new Date()
  //       .toLocaleDateString()
  //       .replace(/\//g, "-")}.xlsx`
  //   );
  // };
  const [expandedRemarks, setExpandedRemarks] = useState({});

  // Toggle function for showing/hiding remarks
  const toggleRemarks = (propertyCode) => {
    setExpandedRemarks((prev) => ({
      ...prev,
      [propertyCode]: !prev[propertyCode],
    }));
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
  //   const showContactDetails = (property) => {
  //     Swal.fire({
  //       title: `<h2 style="color: #2c3e50; font-weight: 700; margin-bottom: 10px;">Property Details</h2>`,
  //       html: `
  //         <div style="text-align: left; font-size: 16px; color: #2c3e50; line-height: 1.6; width: auto; max-width: 450px; overflow: hidden;">
  //           <p><strong>Efficiency:</strong> ${property.efficiency}%</p>
  //           <p><strong>Buy Rate:</strong> ${property.outright_rate_psf}</p>
  //           <p><strong>Lease Rate:</strong> ${property.rental_psf}</p>

  //           <div style="margin-top: 10px; padding: 4px; border-radius: 6px; overflow: hidden;">
  //             <strong style="font-size: 17px;">Floor Details:</strong>
  //             <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 12px;">
  //               <tr style="background: #dcdcdc; font-weight: bold;">
  //                 <th style="padding: 3px; border: 1px solid #ccc; width: 33%;">Floor</th>
  //                 <th style="padding: 3px; border: 1px solid #ccc; width: 33%;">Unit No.</th>
  //                 <th style="padding: 3px; border: 1px solid #ccc; width: 33%;">Wing</th>
  //               </tr>
  //                ${property.floor
  //                  .map(
  //                    (ele) => `
  //                   <tr>
  //                     <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${ele.floor}</td>
  //                     <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${ele.unit_number}</td>
  //                     <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${ele.wing}</td>
  //                   </tr>
  //                 `
  //                  )
  //                  .join("")}
  //             </table>
  //           </div>

  //           <p><strong>Car Parking:</strong> ${property.car_parking}</p>
  //           <p><strong>Builtup Area:</strong> ${property.built_up_area} sqft</p>
  //           <p><strong>Carpet Area:</strong> ${property.carpet_up_area} sqft</p>
  //           <p><strong>Reopen Date:</strong> ${property.reopen}</p>

  //           ${
  //             property.furnished_details
  //               ? `
  //           <div class="furnished-details-section">

  //             <div style="width: 100%; text-align: center;  display: flex; justify-content: center; align-items: center; padding: 10px;">
  //                <button id="seeMoreBtn" style="margin-top: 10px; padding: 6px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
  //               See Furnished Details
  //             </button>
  //             </div>

  //             <div id="furnishedDetails" style="display: none; margin-top: 10px;">
  //               <hr style="border-top: 1px solid #dcdcdc; margin: 10px 0;"/>
  //               <div class="furnished-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
  //                 <div>
  //                   <p><strong>Workstations:</strong> ${
  //                     property.furnished_details.workstations
  //                   }</p>
  //                   <p><strong>Cubicle Type:</strong> ${
  //                     property.furnished_details.workstation_type_cubicle
  //                       ? "Yes"
  //                       : "No"
  //                   }</p>
  //                   <p><strong>Linear Type:</strong> ${
  //                     property.furnished_details.workstation_type_linear
  //                       ? "Yes"
  //                       : "No"
  //                   }</p>
  //                   <p><strong>Both Types:</strong> ${
  //                     property.furnished_details.workstation_type_both
  //                       ? "Yes"
  //                       : "No"
  //                   }</p>
  //                   <p><strong>Cabins:</strong> ${
  //                     property.furnished_details.cabins
  //                   }</p>
  //                 </div>
  //                 <div>
  //                   <p><strong>Meeting Rooms:</strong> ${
  //                     property.furnished_details.meeting_rooms
  //                   }</p>
  //                   <p><strong>Conference Rooms:</strong> ${
  //                     property.furnished_details.conference_rooms
  //                   }</p>
  //                   <p><strong>Cafeteria Seats:</strong> ${
  //                     property.furnished_details.cafeteria_seats
  //                   }</p>
  //                   <p><strong>Washrooms:</strong> ${
  //                     property.furnished_details.washrooms
  //                   }</p>
  //                 </div>
  //               </div>

  //               <div className="additional-amenities" style="margin-top: 10px;">
  //   ${
  //     property.furnished_details.pantry_area ||
  //     property.furnished_details.backup_ups_room ||
  //     property.furnished_details.server_electrical_room ||
  //     property.furnished_details.reception_waiting_area
  //       ? `
  //     <p><strong>Additional Amenities:</strong></p>
  //     <div style="display: flex; flex-wrap: wrap; gap: 10px;">
  //       ${
  //         property.furnished_details.pantry_area
  //           ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Pantry Area</span>'
  //           : ""
  //       }
  //       ${
  //         property.furnished_details.backup_ups_room
  //           ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Backup UPS Room</span>'
  //           : ""
  //       }
  //       ${
  //         property.furnished_details.server_electrical_room
  //           ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Server Electrical Room</span>'
  //           : ""
  //       }
  //       ${
  //         property.furnished_details.reception_waiting_area
  //           ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Reception & Waiting Area</span>'
  //           : ""
  //       }
  //     </div>
  //     `
  //       : ""
  //   }
  // </div>

  //               <div style="width: 100%; text-align: center;  display: flex; justify-content: center; align-items: center; padding: 10px;">
  //     <button id="seeLessBtn" style="padding: 6px 10px; color: white; border: none; border-radius: 4px; cursor: pointer; background-color: #dc3545;">
  //         Hide Furnished Details
  //     </button>
  // </div>
  //             </div>
  //           </div>
  //           `
  //               : ""
  //           }
  //         </div>`,
  //       confirmButtonText: "Close",
  //       width: "500px",
  //       background: "#ffffff",
  //       showClass: {
  //         popup: "animate__animated animate__fadeInDown",
  //       },
  //       hideClass: {
  //         popup: "animate__animated animate__fadeOutUp",
  //       },
  //       didOpen: () => {
  //         const seeMoreBtn = document.getElementById("seeMoreBtn");
  //         const seeLessBtn = document.getElementById("seeLessBtn");
  //         const furnishedDetails = document.getElementById("furnishedDetails");

  //         if (seeMoreBtn && seeLessBtn && furnishedDetails) {
  //           seeMoreBtn.addEventListener("click", () => {
  //             furnishedDetails.style.display = "block";
  //             seeMoreBtn.style.display = "none";
  //           });

  //           seeLessBtn.addEventListener("click", () => {
  //             furnishedDetails.style.display = "none";
  //             seeMoreBtn.style.display = "inline-block";
  //           });
  //         }
  //       },
  //     });
  //   };
  const showContactDetails = (property) => {
    // Log the property to debug
    // console.log("Property in showContactDetails:", property);

    // Check if furnished_details exists (not null or undefined)
    if (!property.furnished_details) {
      // console.log("No furnished_details found, exiting.");
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
  return (
    <div className="pb-20 pl-20 mx-10 my-24 ">
      <div className="flex justify-between h-10 ">
        <div className="flex gap-4 items-center border border-gray-300 rounded-md w-[30%] px-4 py-2">
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
          onSubmit={selectedProperty ? handleUpdate : fetchProperties}
          propertyData={selectedProperty}
          setEditProperty={setEditProperty}
          editProperty={editProperty}
          property={property}
          fetchProperties={fetchProperties}
        />
      ) : (
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="mt-8 text-center">Loading properties...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="mt-8 text-center">No properties found</div>
          ) : (
            <table className="w-full border border-collapse border-gray-300 mt-7 min-w-max">
              <thead>
                <tr className="h-12 text-white bg-blue-800">
                  {/* <tr className="h-12 text-white bg-blue-800"> */}
                  <th className="border max-w-24">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      className="w-4 h-4"
                    />
                  </th>

                  <th className="px-4 border">Building Name</th>
                  {/* <th className="px-4 border">City</th> */}
                  <th className="px-4 border">Location</th>
                  <th className="px-4 border">Sublocation</th>
                  <th className="px-4 border text-wrap">
                    Built-up Area sq.ft.
                  </th>
                  <th className="px-4 border text-wrap">Carpet Area sq.ft.</th>
                  <th className="px-4 border text-wrap">Terrace</th>
                  <th className="px-4 border text-wrap">Floor/Wing</th>
                  <th className="px-4 border text-wrap">License Fees</th>
                  <th className="px-4 border text-wrap">Rate</th>

                  {/* <th className="px-4 border">East/West</th>
                        <th className="px-4 border">Address</th>
                        
                        <th className="px-4 border">Description</th>
                        <th className="px-4 border">LL/Outright</th>
                        <th className="px-4 border">Property Type</th>
                        <th className="px-4 border">Status</th>
                        <th className="px-4 border">Builder Name</th>
                        <th className="px-4 border">Address</th> */}
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
                  <th className="px-4 border text-wrap ">Executive Name </th>
                  {/* <th className="px-4 border text-wrap "> Remarks </th> */}
                  <th className="px-4 border text-wrap">Date </th>
                  <th className="px-4 border text-wrap">Actions</th>
                  {/* <th className="px-4 border text-wrap">Download</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-4 text-center">
                      <h3>No properties are there</h3>
                    </td>
                  </tr>
                ) : (
                  filteredProperties
                    .map((property, index) => (
                      <tr
                        key={index}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={(e) => {
                          showContactDetails(property); // First function
                          if (!e.target.closest('input[type="checkbox"]')) {
                            showContactDetails(property); // Second function
                          }
                        }}
                      >
                        {/* <td
                        className="px-4 py-2 text-center break-all border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProperties.some(
                            (p) => p.property_code === property.property_code
                          )}
                          onChange={() => handleCheckboxChange(property)}
                          className="w-4 h-4"
                        />
                      </td> */}
                        <td
                          className="px-4 py-2 text-center break-all border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProperties.some(
                              (p) => p.property_code === property.property_code
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
                          {property.terrace_area}{" "}
                        </td>
                        <td className="px-4 py-2 border text-wrap">
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <tbody>
                              {property.floor && property.floor.length > 0 ? (
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
                        <td className="px-4 py-2 break-all border text-wrap">
                          <div className="flex justify-center gap-4">
                            <FaEdit
                              className="text-blue-600 cursor-pointer"
                              onClick={(e) => {
                                // try {
                                e.stopPropagation();
                                setEditProperty(true);
                                setProperty(property);
                                // console.log(property, "edit prop")
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

                        {/* <td className="px-4 py-2 break-all border text-wrap">
                        <div className="relative">
                          <button
                            className="flex items-center gap-2 px-3 py-2 text-blue-700 transition duration-200 border border-blue-200 rounded-md shadow-sm bg-blue-50 hover:bg-blue-100"
                            onClick={(e) =>
                              toggleDropdown(e, property.property_code)
                            }
                          >
                            <BsDownload className="text-blue-600" />
                            <span>Download</span>
                          </button>

                          {openDropdownId === property.property_code && (
                            <div
                              ref={dropdownRef}
                              className="absolute left-0 z-10 w-32 mt-1 overflow-hidden bg-white border border-gray-200 rounded-md shadow-lg"
                            >
                              <button
                                className="flex items-center w-full gap-2 px-4 py-3 text-sm text-left transition duration-150 border-b border-gray-100 hover:bg-gray-50"
                                onClick={(e) => downloadAsPDF(e, property)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 text-red-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                PDF
                              </button>
                              <button
                                className="flex items-center w-full gap-2 px-4 py-3 text-sm text-left transition duration-150 hover:bg-gray-50"
                                onClick={(e) => downloadAsExcel(e, property)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 text-green-600"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 1v10h10V6H5z"
                                    clipRule="evenodd"
                                  />
                                  <path d="M6 8h8v1H6V8zm0 3h8v1H6v-1z" />
                                </svg>
                                Excel
                              </button>
                            </div>
                          )}
                        </div>
                      </td> */}
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
  );
};

export default Property;
