import React, { useEffect, useState } from "react";
import axios from "../../helper/axios";
import Swal from "sweetalert2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [propertyCount, setPropertyCount] = useState(0);
  const [from, setFrom] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/get_all_users");
      setData(response.data.data);
    } catch (e) {
      //console.error("Error fetching users:", e);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get("/api/clients/");
      setClientCount(response.data.length);
    } catch (e) {
      //console.error(e);
    }
  };

  const user = localStorage.getItem("user");
  let token = "";
  if (user) {
    try {
      const parsedToken = JSON.parse(user);
      token = parsedToken.token;
    } catch (e) {
      //console.error("Error parsing token:", e);
    }
  }

  // const fetchProperties = async () => {
  //   try {
  //     const response = await axios.get("/api/get_all_properties/", {
  //       headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  //     });
  //     setPropertyCount(response.data.length);
  //   } catch (e) {
  //     //console.error(e);
  //   }
  // };

      const TotalCountData = async () => {
    try {
      const response = await axios.get(
        "/aryan_properties/api/get_all_properties/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.total);
      setPropertyCount(response.data.total);
      //  setTotalCount(response.data.total);

      //  setTotalPage(response.data.total);
      // setPagination((prev) => ({
      //   ...prev,
      //   totalCount: response.data.total,
      //   totalPages: Math.ceil(response.data.total / prev.pageSize),
      // }));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchClients();
    // fetchProperties();
    TotalCountData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setUserCount(data.filter(user => user.user_type === "user").length);
    }
  }, [data]);

  // Chart Data
  const chartData = [
    { Properties: propertyCount, Users: userCount, Clients: clientCount },
  ];

  return (
    <div className="min-h-screen px-8 pt-24 pb-12 bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Stats Cards */}
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        {/* Property Card */}
        <Card title="Property" count={propertyCount} imgSrc="./LeftColumn/real-estate (1) 1.png" bgColor="bg-green-100" />
        {/* User Card */}
        <Card title="User" count={userCount} imgSrc="./LeftColumn/Rectangle (2).png" bgColor="bg-blue-100" />
        {/* Client Card */}
        <Card title="Client" count={clientCount} imgSrc="./LeftColumn/accountant 1.png" bgColor="bg-pink-100" />
      </div>

      {/* Bar Chart */}
      <div className="max-w-4xl p-8 mx-auto mt-16 bg-white shadow-lg rounded-xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Dashboard Analytics
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}   barGap={100}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Properties" fill="#10B981" barSize={80} />
            <Bar dataKey="Users" fill="#3B82F6" barSize={80} />
            <Bar dataKey="Clients" fill="#EC4899" barSize={80} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Reusable Card Component
const Card = ({ title, count, imgSrc, bgColor }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 flex items-center gap-8 w-64 transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
    <div className={`p-4 ${bgColor} border rounded-full flex items-center justify-center`}>
      <img className="object-contain w-14 h-14" src={imgSrc} alt="" />
    </div>
    <div>
      <h1 className="mb-1 text-3xl font-bold text-gray-800">{count || 0}</h1>
      <h1 className="text-xl text-gray-600">{title}</h1>
    </div>
  </div>
);

export default Dashboard;
