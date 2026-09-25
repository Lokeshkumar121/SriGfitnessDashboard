
import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  IndianRupee,
  CreditCard,
  ArrowUpRight,
  CalendarClock,
  Dumbbell,
} from "lucide-react";

import api from "../services/api";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard/stats");

      setData(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white border border-slate-200 rounded-3xl" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 bg-white border border-slate-200 rounded-2xl"
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-7 bg-slate-200 rounded-lg w-48" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 bg-white border border-slate-200 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const members = data?.members || {};
  const revenue = data?.revenue || {};
  const fees = data?.fees || {};

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Dumbbell size={17} className="text-white" />
            </div>

            <span className="text-blue-100 text-sm font-medium">
              Gym Management Dashboard
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, Sri G Fitness Club
          </h1>

          <p className="text-blue-100 mt-2 max-w-xl text-sm leading-6">
            Monitor members, memberships, payments and upcoming
            expirations from one place.
          </p>
        </div>

        <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-white/10" />

        <Dumbbell
          className="absolute right-8 bottom-6 text-white/10"
          size={120}
        />
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Members"
          value={members.total || 0}
          icon={Users}
          description="All registered members"
        />

        <StatCard
          title="Active Members"
          value={members.active || 0}
          icon={UserCheck}
          description="Currently active"
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Expiring Soon"
          value={data?.memberships?.expiringSoon?.count || 0}
          icon={Clock3}
          description="Next 7 days"
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Expired"
          value={members.expired || 0}
          icon={UserX}
          description="Expired memberships"
          iconClass="bg-red-50 text-red-600"
        />
      </div>

      {/* Financial Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Financial Overview
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Track your gym's payment and revenue performance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <StatCard
            title="Total Revenue"
            value={`₹${Number(
              revenue.total || 0
            ).toLocaleString("en-IN")}`}
            icon={IndianRupee}
            description="All recorded payments"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="This Month"
            value={`₹${Number(
              revenue.currentMonth || 0
            ).toLocaleString("en-IN")}`}
            icon={ArrowUpRight}
            description="Current month revenue"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Pending Fees"
            value={`₹${Number(
              fees.totalPendingAmount || 0
            ).toLocaleString("en-IN")}`}
            icon={CreditCard}
            description="Amount yet to collect"
            iconClass="bg-orange-50 text-orange-600"
          />
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Expiring Soon
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Memberships ending within 7 days
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <CalendarClock
                size={19}
                className="text-amber-600"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.memberships?.expiringSoon?.members?.length ? (
              data.memberships.expiringSoon.members.map((item) => (
                <div
                  key={item._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {item.member?.fullName}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {item.member?.memberId}
                    </p>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-amber-600">
                      {new Date(item.endDate).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {item.planName}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <CalendarClock
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <p className="text-slate-500 text-sm">
                  No memberships expiring soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Recent Payments
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Latest recorded payments
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <IndianRupee
                size={19}
                className="text-emerald-600"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentPayments?.length ? (
              data.recentPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {payment.member?.fullName}
                    </p>

                    <p className="text-xs text-slate-500 mt-1 capitalize">
                      {payment.paymentMethod?.replace("_", " ")}
                    </p>
                  </div>

                  <div className="text-right ml-4">
                    <p className="font-bold text-emerald-600">
                      ₹
                      {Number(payment.amount).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(
                        payment.paymentDate
                      ).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <CreditCard
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <p className="text-slate-500 text-sm">
                  No payments found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
