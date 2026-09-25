import { useEffect, useState } from "react";
import {
  Dumbbell,
  Plus,
  X,
  CalendarDays,
  UserPlus,
} from "lucide-react";

import api from "../services/api";

const Memberships = () => {
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);

  const [modal, setModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);

  const [selectedPlan, setSelectedPlan] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    durationInDays: "",
    price: "",
    description: "",
  });

  const [assignForm, setAssignForm] = useState({
    memberId: "",
    planId: "",
    startDate: new Date()
      .toISOString()
      .split("T")[0],
    notes: "",
  });

  const fetchPlans = async () => {
    try {
      const response = await api.get(
        "/memberships/plans"
      );

      setPlans(
        response.data.data.plans || []
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(
        "/members?status=active&limit=100"
      );

      setMembers(
        response.data.data.members || []
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/memberships/plans", {
        ...form,
        durationInDays: Number(
          form.durationInDays
        ),
        price: Number(form.price),
      });

      setModal(false);

      setForm({
        name: "",
        durationInDays: "",
        price: "",
        description: "",
      });

      fetchPlans();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create plan"
      );
    }
  };

  const openAssignModal = (plan) => {
    setSelectedPlan(plan);

    setAssignForm({
      memberId: "",
      planId: plan._id,
      startDate: new Date()
        .toISOString()
        .split("T")[0],
      notes: "",
    });

    setAssignModal(true);
  };

  const handleAssignMembership = async (e) => {
    e.preventDefault();

    try {
      await api.post("/memberships", {
        memberId: assignForm.memberId,
        planId: assignForm.planId,
        startDate: assignForm.startDate,
        notes: assignForm.notes,
      });

      alert(
        "Membership assigned successfully"
      );

      setAssignModal(false);
      setSelectedPlan(null);

      setAssignForm({
        memberId: "",
        planId: "",
        startDate: new Date()
          .toISOString()
          .split("T")[0],
        notes: "",
      });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to assign membership"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Membership Plans
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage your gym membership packages
          </p>
        </div>

        <button
          onClick={() => setModal(true)}
          className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-semibold shadow-sm transition"
        >
          <Plus size={18} />
          Add Plan
        </button>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Dumbbell size={22} />
            </div>

            {/* Plan Name */}
            <h2 className="text-xl font-bold text-slate-900 mt-5">
              {plan.name}
            </h2>

            {/* Price */}
            <div className="flex items-end gap-1 mt-3">
              <span className="text-3xl font-bold text-slate-900">
                ₹
                {Number(
                  plan.price
                ).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-3">
              <CalendarDays size={16} />

              {plan.durationInDays} days
            </div>

            {/* Description */}
            {plan.description && (
              <p className="text-sm text-slate-500 mt-4 leading-6">
                {plan.description}
              </p>
            )}

            {/* Status */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  plan.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {plan.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            {/* Assign */}
            {plan.isActive && (
              <button
                onClick={() =>
                  openAssignModal(plan)
                }
                className="w-full mt-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-semibold shadow-sm transition"
              >
                <UserPlus size={17} />
                Assign to Member
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 text-slate-500">
          No membership plans available.
        </div>
      )}

      {/* Create Membership Plan Modal */}

      {modal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-900">
                Create Membership Plan
              </h2>

              <button
                onClick={() => setModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >
              <input
                required
                placeholder="Plan Name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="input"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Duration in days"
                  value={form.durationInDays}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      durationInDays:
                        e.target.value,
                    })
                  }
                  className="input"
                />

                <input
                  required
                  type="number"
                  min="0"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                  className="input"
                />
              </div>

              <textarea
                rows="3"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                className="input resize-none"
              />

              <button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-sm">
                Create Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Membership Modal */}

      {assignModal && selectedPlan && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Assign Membership
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Assign {selectedPlan.name} to a
                  member
                </p>
              </div>

              <button
                onClick={() =>
                  setAssignModal(false)
                }
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                handleAssignMembership
              }
              className="p-5 space-y-4"
            >
              {/* Member */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Member
                </label>

                <select
                  required
                  value={assignForm.memberId}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      memberId:
                        e.target.value,
                    })
                  }
                  className="input"
                >
                  <option value="">
                    Select Member
                  </option>

                  {members.map((member) => (
                    <option
                      key={member._id}
                      value={member._id}
                    >
                      {member.fullName} —{" "}
                      {member.memberId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Plan */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Membership Plan
                </label>

                <div className="input flex items-center justify-between bg-slate-50">
                  <span className="text-slate-900">
                    {selectedPlan.name}
                  </span>

                  <span className="text-blue-600 font-semibold">
                    ₹
                    {Number(
                      selectedPlan.price
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Start Date */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>

                <input
                  required
                  type="date"
                  value={
                    assignForm.startDate
                  }
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      startDate:
                        e.target.value,
                    })
                  }
                  onClick={(e) =>
                    e.currentTarget.showPicker?.()
                  }
                  className="input cursor-pointer"
                />
              </div>

              {/* Notes */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>

                <textarea
                  rows="3"
                  placeholder="Optional notes"
                  value={assignForm.notes}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      notes: e.target.value,
                    })
                  }
                  className="input resize-none"
                />
              </div>

              <button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition">
                <UserPlus size={18} />
                Assign Membership
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Memberships;