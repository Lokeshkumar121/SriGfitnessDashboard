import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock3,
  AlertCircle,
  CreditCard,
} from "lucide-react";

import api from "../services/api";

const Notifications = () => {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(
        "/notifications?limit=50"
      );

      setNotifications(
        response.data.data.notifications || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(
        `/notifications/${id}/read`
      );

      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type) => {
    if (type === "membership_expired") {
      return (
        <AlertCircle className="text-red-600" />
      );
    }

    if (type === "payment_pending") {
      return (
        <CreditCard className="text-orange-600" />
      );
    }

    return (
      <Clock3 className="text-amber-600" />
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Membership and payment alerts
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 text-sm font-medium shadow-sm transition"
        >
          <CheckCheck size={17} />
          Mark all read
        </button>
      </div>

      {/* Notifications Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center">
              <Bell
                size={32}
                className="text-blue-600"
              />
            </div>

            <p className="mt-4 font-semibold text-slate-900">
              You're all caught up
            </p>

            <p className="text-sm text-slate-500 mt-1">
              No notifications available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(
              (notification) => (
                <div
                  key={notification._id}
                  className={`
                    p-5 flex gap-4 transition
                    ${
                      !notification.isRead
                        ? "bg-blue-50/50"
                        : "hover:bg-slate-50"
                    }
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`
                      w-11 h-11 shrink-0 rounded-xl
                      flex items-center justify-center
                      ${
                        notification.type ===
                        "membership_expired"
                          ? "bg-red-50"
                          : notification.type ===
                            "payment_pending"
                          ? "bg-orange-50"
                          : "bg-amber-50"
                      }
                    `}
                  >
                    {getIcon(
                      notification.type
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <span className="w-fit text-[10px] uppercase tracking-wider font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mt-1 leading-6">
                      {notification.message}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Read */}
                  {!notification.isRead && (
                    <button
                      onClick={() =>
                        markRead(
                          notification._id
                        )
                      }
                      className="self-start text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;