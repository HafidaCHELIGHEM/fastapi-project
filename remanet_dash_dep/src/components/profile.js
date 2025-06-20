import React, { useState, useEffect } from "react";
import { Bell, LogOut, UserCog } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWebSocketConnection } from "@/utils/websocketConnection";

function Profile() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeToast, setActiveToast] = useState(null);

  const { data: session } = useSession();
  const { data } = useWebSocketConnection(); // -> { notifications: [...] }

  // Format timestamp to "5m ago", etc.
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Unknown";
    }
  };

  // Ingest server-side notifications
  useEffect(() => {
    if (!data?.notifications?.length) return;

    const newNotifications = [];

    // Map each server notification into our client shape
    data.notifications.forEach(n => {
      newNotifications.push({
        id: `${n.parameter}-${n.timestamp}`,
        text: n.message,
        time: formatTimestamp(n.timestamp),
        type: n.type,
        raw: {
          parameter: n.parameter,
          value: n.value,
          threshold: n.threshold,
          timestamp: n.timestamp,
        },
      });
    });

    if (newNotifications.length) {
      setNotifications(prev => {
        const prevCount = prev.length;
        // merge, dedupe, keep most recent first
        const combined = [...newNotifications, ...prev];
        const unique = Array.from(
          new Map(combined.map(item => [item.id, item]))
            .values()
        );
        const sliced = unique.slice(0, 20);

        // trigger toast for the very first in this batch
        if (sliced.length > prevCount && !activeToast) {
          setActiveToast(newNotifications[0]);
        }

        return sliced;
      });
    }
  }, [data, activeToast]);

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === "all") return true;
    if (activeFilter === "warnings") return notification.type === "warning";
    return notification.raw?.parameter === activeFilter;
  });

  // Toast notification component
  const NotificationToast = ({ notification, onClose }) => {
    useEffect(() => {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }, [onClose]);
    
    if (!notification) return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-3 border-l-4 border-red-500 max-w-md z-50 transition-all duration-300">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              {notification.type === 'warning' ? 'Warning' : 'Alert'}
            </h3>
            <div className="mt-1 text-sm text-gray-500">
              <p>{notification.text}</p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Return null if no session
  if (!session) {
    return null;
  }

  const name = session.user.name;
  const email = session.user.email;

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <div className="flex items-center space-x-4">
      {activeToast && (
        <NotificationToast 
          notification={activeToast}
          onClose={() => setActiveToast(null)}
        />
      )}
      <div className="w-full hidden sm:flex items-center justify-between bg-white rounded-full shadow-2xl shadow-gray-300">
        <div className="flex items-center gap-4 ">
          <Avatar className="h-14 w-14 hidden sm:inline-block overflow-hidden p-1 rounded-full ring-2 ring-[#41463b]">
            <AvatarFallback className="bg-[#41463b] text-white">
              {getInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col text-left align-middle justify-center">
            <p className="text-lg text-[#41463b] font-medium">{name}</p>
            <p className="text-sm text-[#41463b]">{email}</p>
          </div>
        </div>
        <div className="flex items-end justify-end space-x-6 px-2">
          {/* Users Management Link - Only shown to admins */}
          {session.user.role === "admin" && (
            <a
              href="/UsersSettings"
              className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
            >
              <UserCog size={20} className="text-[#41463b]" />
            </a>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <div className="relative">
                <Bell size={20} className="text-[#41463b]" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-screen max-w-md bg-white rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Notifications
                    </h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setActiveFilter("all")}
                        className={`px-2 py-1 text-xs rounded ${
                          activeFilter === "all" 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setActiveFilter("warnings")}
                        className={`px-2 py-1 text-xs rounded ${
                          activeFilter === "warnings" 
                            ? "bg-yellow-500 text-white" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Warnings
                      </button>
                      <button
                        onClick={() => setActiveFilter("P_gun")}
                        className={`px-2 py-1 text-xs rounded ${
                          activeFilter === "P_gun" 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        P_gun
                      </button>
                      <button
                        onClick={() => setActiveFilter("T_gun")}
                        className={`px-2 py-1 text-xs rounded ${
                          activeFilter === "T_gun" 
                            ? "bg-orange-500 text-white" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        T_gun
                      </button>
                      <button
                        onClick={() => setActiveFilter("Q_PG_N2")}
                        className={`px-2 py-1 text-xs rounded ${
                          activeFilter === "Q_PG_N2" 
                            ? "bg-purple-500 text-white" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Q_PG_N2
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-l-4 ${
                          notification.type === "warning" ? "border-yellow-500" : 
                          notification.type === "error" ? "border-red-500" : "border-blue-500"
                        }`}
                      >
                        <p className="text-sm text-gray-800">
                          {notification.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      {activeFilter === "all" 
                        ? "No notifications at this time" 
                        : `No ${activeFilter} notifications`}
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 flex justify-between">
                  <button 
                    onClick={() => setNotifications([])} 
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-sm text-gray-500 hover:text-gray-600 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            <LogOut size={20} className="text-[#41463b]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;