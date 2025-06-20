

import React from "react";
import { DataProvider } from "@/components/dataprovider";
import AddUserForm from "@/components/Adduser";

const UserManagementProvider = () => {
  const [users, setUsers] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/UserdataProvider");
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      
      // Add error handling for missing data
      if (!data || !data.users) {
        throw new Error("Invalid data format from API");
      }
      
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-[#41463b] mb-2">
        User Management
      </h1>
      <p className="text-gray-500 mb-6">
        Manage your users, add, edit and remove users, and control their roles
        and permissions.
      </p>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col overflow-auto sm:py-0 ">
          <DataProvider
            users={users}
            isLoading={isLoading}
            error={error}
            onRefresh={fetchUsers}
          />
        </div>
        <AddUserForm onRefresh={fetchUsers} />
      </div>
    </div>
  );
};

export default UserManagementProvider;