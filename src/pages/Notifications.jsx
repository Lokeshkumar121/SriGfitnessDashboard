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
        <AlertCircle className="text-red-400" />
      );
    }

    if (type === "payment_pending") {
      return (
        <CreditCard className="text-orange-400" />
      );
    }

    return (
      <Clock3 className="text-amber-400" />
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Notifications
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Membership and payment alerts
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 text-sm"
        >
          <CheckCheck size={17} />
          Mark all read
        </button>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell
              size={40}
              className="mx-auto text-slate-700"
            />

            <p className="mt-4 font-medium">
              You're all caught up
            </p>

            <p className="text-sm text-slate-500 mt-1">
              No notifications available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map(
              (notification) => (
                <div
                  key={notification._id}
                  className={`
                    p-5 flex gap-4
                    ${
                      !notification.isRead
                        ? "bg-blue-500/[0.03]"
                        : ""
                    }
                  `}
                >
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-white/5 flex items-center justify-center">
                    {getIcon(
                      notification.type
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-semibold">
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <span className="text-[10px] uppercase tracking-wider text-blue-400">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-xs text-slate-600 mt-2">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() =>
                        markRead(
                          notification._id
                        )
                      }
                      className="self-start text-xs text-blue-400 hover:text-blue-300"
                    >
                      Read
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