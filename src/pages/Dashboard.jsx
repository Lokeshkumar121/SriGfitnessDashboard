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
      const response =
        await api.get("/dashboard/stats");

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
        <div className="h-10 bg-white/5 rounded-xl w-64" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 bg-white/5 rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const members = data?.members || {};
  const revenue = data?.revenue || {};
  const fees = data?.fees || {};

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-100 text-sm">
            Welcome back
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Sri G Fitness Club
          </h1>

          <p className="text-blue-100 mt-2 max-w-xl text-sm">
            Monitor members, memberships, payments
            and upcoming expirations from one place.
          </p>
        </div>

        <Dumbbell
          className="absolute right-6 bottom-5 opacity-10"
          size={130}
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
          iconClass="bg-emerald-500/10 text-emerald-400"
        />

        <StatCard
          title="Expiring Soon"
          value={
            data?.memberships?.expiringSoon
              ?.count || 0
          }
          icon={Clock3}
          description="Next 7 days"
          iconClass="bg-amber-500/10 text-amber-400"
        />

        <StatCard
          title="Expired"
          value={members.expired || 0}
          icon={UserX}
          description="Expired memberships"
          iconClass="bg-red-500/10 text-red-400"
        />
      </div>

      {/* Finance */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          Financial Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <StatCard
            title="Total Revenue"
            value={`₹${Number(
              revenue.total || 0
            ).toLocaleString("en-IN")}`}
            icon={IndianRupee}
            description="All recorded payments"
            iconClass="bg-emerald-500/10 text-emerald-400"
          />

          <StatCard
            title="This Month"
            value={`₹${Number(
              revenue.currentMonth || 0
            ).toLocaleString("en-IN")}`}
            icon={ArrowUpRight}
            description="Current month revenue"
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <StatCard
            title="Pending Fees"
            value={`₹${Number(
              fees.totalPendingAmount || 0
            ).toLocaleString("en-IN")}`}
            icon={CreditCard}
            description="Amount yet to collect"
            iconClass="bg-orange-500/10 text-orange-400"
          />
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expiring */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold">
                Expiring Soon
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Memberships ending within 7 days
              </p>
            </div>

            <CalendarClock
              size={20}
              className="text-amber-400"
            />
          </div>

          <div className="divide-y divide-white/5">
            {data?.memberships?.expiringSoon
              ?.members?.length ? (
              data.memberships.expiringSoon.members.map(
                (item) => (
                  <div
                    key={item._id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {item.member?.fullName}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {item.member?.memberId}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-amber-400">
                        {new Date(
                          item.endDate
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.planName}
                      </p>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No memberships expiring soon.
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="font-bold">
              Recent Payments
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Latest recorded payments
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {data?.recentPayments?.length ? (
              data.recentPayments.map(
                (payment) => (
                  <div
                    key={payment._id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {payment.member?.fullName}
                      </p>

                      <p className="text-xs text-slate-500 mt-1 capitalize">
                        {payment.paymentMethod?.replace(
                          "_",
                          " "
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-emerald-400">
                        ₹
                        {Number(
                          payment.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <p className="text-xs text-slate-500">
                        {new Date(
                          payment.paymentDate
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No payments found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;