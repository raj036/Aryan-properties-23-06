import { useEffect, useState } from "react";
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
      <div className="relative min-w-[600px] bg-white rounded-lg shadow-lg p-6 z-10">
        {children}
        <button onClick={onClose}>
          <MdCancel className="absolute top-3 right-3 size-5 hover:text-red-800" />
        </button>
      </div>
    </div>
  );
};

const User = () => {
  const closeModal = () => {
    setIsEditOpen(false);
    setIsAddOpen(false);
  };

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputData, setInputData] = useState({
    user_name: "",
    user_email: "",
    phone_no: "",
    user_password: "",
  });
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/get_all_users");
      setUsers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      //console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch users. Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const CreatenewUser = async () => {
    try {
      const response = await axios.post(
        `/api/insert/AriyanspropertiesUser_register/`,
        inputData
      );

      if (response?.data) {
        Swal.fire({
          icon: "success",
          title: "User registered successfully",
          text: "Redirecting...",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.response?.data?.detail ||
          "An error occurred. Please try again.",
      });
    }
  };

  const handleAddUser = async () => {
    if (
      !inputData.user_name ||
      !inputData.user_email ||
      !inputData.phone_no ||
      !inputData.user_password
    ) {
      // console.log(inputData.user_name);
      Swal.fire({
        icon: "error",
        title: "Invalid Data",
        text: "Please fill all required fields",
      });
      return;
    }

    try {
      const response = await axios.post(
        `/api/insert/AriyanspropertiesUser_register/`,
        inputData
      );
      if (response?.data) {
        Swal.fire({
          icon: "success",
          title: "User registered successfully",
          text: "Redirecting...",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          setInputData({
            user_name: "",
            user_email: "",
            phone_no: "",
            user_type: "",
          });
          setIsAddOpen(false);
          window.location.reload();
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.response?.data?.detail ||
          "An error occurred. Please try again.",
      });
    }
  };

  const handleDelete = async (userId) => {
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
          .delete(`/api/delete/AriyanspropertiesUser/${userId}`)
          .then(() => {
            Swal.fire(
              "Deleted!",
              "User details deleted successfully",
              "success"
            );
            const updatedUser = users.filter((user) => user.user_id !== userId);
            setUsers(updatedUser);
          })
          .catch(() => {
            Swal.fire("Error!", "Failed to delete user details", "error");
          });
      }
    });
  };

  const handleEdit = (user) => {
    setIsEditOpen(true);
    setSelectedUser(user);
  };
  
  const handleUpdateUser = async () => {
    if (!selectedUser?.user_id || !selectedUser?.user_type) {
      Swal.fire({
        icon: "error",
        title: "Invalid Data",
        text: "User ID and type are required",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login again",
        });
        return;
      }
      // `/api/update_user_type/?user_id=${selectedUser.user_id}&user_type=${selectedUser.user_type}`,
    
      const response = await axios.put(
       `/api/update_user_type/?user_id=${selectedUser.user_id}&user_type=${selectedUser.user_type}&new_password=${selectedUser.user_password}&phone_no=${selectedUser.phone_no}` ,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data) {
        await Swal.fire(
          "Updated!",
          "Client details updated successfully",
          "success"
        );
        await fetchUsers();
        closeModal();
      }
    } catch (error) {
      //console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "User Update Failed",
        text:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 pl-20 mx-10 my-24">
      <div className="flex justify-between h-10">
        <div className="flex gap-4 items-center border border-gray-300 rounded-md w-[30%] px-4 py-2">
          <img
            className="object-none"
            src="./LeftColumn/search-normal.png"
            alt=""
          />
          <input
            className="w-full outline-none"
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="px-10 py-2 text-xl text-white bg-blue-900 rounded-md"
          onClick={() => setIsAddOpen(true)}
        >
          Add
        </button>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="h-12 text-white bg-blue-800">
              {/* <th className="border">UserID</th> */}
              <th className="border">Username</th>
              <th className="border">Email Address</th>
              <th className="border">Password</th>
              <th className="border">User Type</th>
              <th className="border">Phone No.</th>
              <th className="border">Can add</th>
              <th className="border">Can edit</th>
              <th className="border">Can view</th>
              <th className="border">Can delete</th>
              <th className="border">Can Print</th>
              <th className="border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.user_id} className="border">
                {/* <td className="px-4 py-2 border">{user.user_id}</td> */}
                <td className="px-4 py-2 break-all border">{user.username}</td>
                <td className="px-4 py-2 break-all border text-wrap">
                  {user.email}
                </td>
                <td className="px-4 py-2 break-all border text-wrap">
                  {user.user_password}
                </td>
                <td className="px-4 py-2 break-all border">{user.user_type}</td>
                <td className="px-4 py-2 break-all border">{user.phone_no}</td>
                <td className="px-4 py-2 break-all border">
                  {user.can_add ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 break-all border">
                  {user.can_edit ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 break-all border">
                  {user.can_view ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 break-all border">
                  {user.can_delete ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 break-all border">
                  {user.can_print_report ? "Yes" : "No"}
                </td>
                <td className="flex justify-center gap-3">
                  <FaEdit
                    className="text-blue-600 cursor-pointer"
                    onClick={() => handleEdit(user)}
                  />
                  <MdDelete
                    className="text-red-600 cursor-pointer"
                    onClick={() => handleDelete(user.user_id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <CustomModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <div className="flex items-center justify-around py-4">
          <div>
            <h1 className="pb-3">Name</h1>
            <input
              className="p-2 border rounded-md"
              type="text"
              name="username"
              value={inputData.user_name}
              onChange={(e) =>
                setInputData({ ...inputData, user_name: e.target.value })
              }
              placeholder="Enter username"
            />
          </div>
          <div>
            <h1 className="pb-3">Email</h1>
            <input
              className="p-2 border rounded-md"
              type="email"
              name="email"
              value={inputData.user_email}
              onChange={(e) =>
                setInputData({ ...inputData, user_email: e.target.value })
              }
              placeholder="Enter Email"
            />
          </div>
        </div>

        <div className="flex items-center justify-around">
          <div className="">
            <h1 className="pb-3">Phone Number</h1>
            <input
              className="p-2 border rounded-md"
              type="number"
              name="phone_no"
              value={inputData.phone_no}
              onChange={(e) =>
                setInputData({ ...inputData, phone_no: e.target.value })
              }
              placeholder="Enter Phone no."
            />
          </div>
          <div>
            <h1 className="pb-3">Password</h1>
            <input
              className="p-2 border rounded-md"
              name="user_type"
              value={inputData.user_password}
              type="password"
              placeholder="Enter password"
              onChange={(e) =>
                setInputData({ ...inputData, user_password: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-7 mx-[40%]" onClick={handleAddUser}>
          <button
            type="button"
            className="px-10 py-2 text-lg text-white bg-blue-900 rounded-md"
            onChange={(e) =>
              setInputData({ ...inputData, user_password: e.target.value })
            }
          >
            Add
          </button>
        </div>
      </CustomModal>

      {/* Edit User Modal */}
      <CustomModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        {selectedUser && (
          <>
            <div className="flex items-center justify-around py-4">
              <div>
                <h1 className="pb-3">Name</h1>
                <input
                  className="p-2 bg-gray-100 border rounded-md"
                  type="text"
                  value={selectedUser.username || ""}
                  readOnly
                />
              </div>
              <div>
                <h1 className="pb-3">Email</h1>
                <input
                  className="p-2 bg-gray-100 border rounded-md"
                  type="email"
                  value={selectedUser.email || ""}
                  readOnly
                />
              </div>
            </div>

            <div className="flex items-center justify-around">
              <div>
                <h1 className="pb-3">Phone Number</h1>
                <input
                  className="p-2 border rounded-md"
                  type="text"
                  maxLength={10}
                  value={selectedUser.phone_no || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      phone_no: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <h1 className="pb-3">User Type</h1>
                <select
                  className="p-2 px-16 border rounded-md"
                  value={selectedUser.user_type || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      user_type: e.target.value,
                    })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-around m-3">
              <div>
                <h1 className="pb-3">New Password</h1>
                <input
                  className="p-2 border rounded-md"
                  type="text"
                  value={selectedUser.user_password || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      user_password: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-7 mx-[40%]">
              <button
                type="button"
                className="px-10 py-2 text-lg text-white bg-blue-900 rounded-md"
                onClick={handleUpdateUser}
              >
                Update
              </button>
            </div>
          </>
        )}
      </CustomModal>
    </div>
  );
};

export default User;