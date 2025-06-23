import "react";
import { useEffect, useState } from "react";
import axios from "../helper/axios";
import Swal from "sweetalert2";

const Access = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/get_all_users");
        setUsers(Array.isArray(response.data.data) ? response.data.data : []);
        // console.log(response);
      } catch (error) {
        //console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const updatePermission = async (userId, permissionType, isChecked) => {
    try {
      const response = await axios.put(
        `/api/permissions/${permissionType}/${userId}`,
        {
          enabled: isChecked,
        }
      );
      // console.log(response, "update");
      if (response?.data) {
        await Swal.fire({
          icon: "success",
          title: "User permission updated successfully",
          text: "Redirecting...",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Permission update failed",
        text:
          error.response?.data?.detail ||
          "An error occurred. Please try again.",
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-16 pl-20 mx-10 my-24">
      <div className="flex justify-between">
        <div className="flex gap-4 items-center border border-gray-300 rounded-md w-[30%] px-4 py-2">
          <img
            className="object-none"
            src="./LeftColumn/search-normal.png"
            alt="search-icon"
          />
          <input
            className="w-full outline-none"
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* <div>
          <button className="px-10 py-2 text-xl text-white bg-blue-900 rounded-md hover:bg-blue-800">
            Save
          </button>
        </div> */}
      </div>

      <div className="table-container">
        <table className="w-full mt-12 text-center border border-gray-300">
          <thead>
            <tr className="h-12 text-white bg-blue-800 ">
              <th className="border"> Name</th>
              <th className="border">User Type</th>
              <th className="border">CAN ADD</th>
              <th className="border">CAN EDIT</th>
              <th className="border">CAN DELETE</th>
              <th className="border">CAN VIEW</th>
              <th className="border">CAN PRINT</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.user_id} className="border">
                <td className="border">{user.username}</td>
                <td className="border">{user.user_type}</td>
                <td className="p-4 border">
                  <input
                    type="checkbox"
                    defaultChecked={user.can_add}
                    onChange={(e) =>
                      updatePermission(
                        user.user_id,
                        "can_add",
                        e.target.checked
                      )
                    }
                  />
                </td>
                <td className="p-4 border">
                  <input
                    type="checkbox"
                    defaultChecked={user.can_edit}
                    onChange={(e) =>
                      updatePermission(
                        user.user_id,
                        "can_edit",
                        e.target.checked
                      )
                    }
                  />
                </td>
                <td className="p-4 border">
                  <input
                    type="checkbox"
                    defaultChecked={user.can_delete}
                    onChange={(e) =>
                      updatePermission(
                        user.user_id,
                        "can_delete",
                        e.target.checked
                      )
                    }
                  />
                </td>
                <td className="p-4 border">
                  <input
                    type="checkbox"
                    defaultChecked={user.can_view}
                    onChange={(e) =>
                      updatePermission(
                        user.user_id,
                        "can_view",
                        e.target.checked
                      )
                    }
                  />
                </td>
                <td className="p-4 border">
                  <input
                    type="checkbox"
                    defaultChecked={user.can_print_report}
                    onChange={(e) =>
                      updatePermission(
                        user.user_id,
                        "can_print_report",
                        e.target.checked
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Access;
