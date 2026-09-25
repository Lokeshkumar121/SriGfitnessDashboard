import { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  X,
  IndianRupee,
} from "lucide-react";

import api from "../services/api";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] =
    useState([]);

  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedMember, setSelectedMember] =
    useState("");

  const [form, setForm] = useState({
    memberId: "",
    membershipId: "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date()
      .toISOString()
      .split("T")[0],
    transactionId: "",
    notes: "",
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/payments?limit=50"
      );

      setPayments(
        response.data.data.payments || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

  const fetchMemberships = async (memberId) => {
    if (!memberId) {
      setMemberships([]);
      return;
    }

    try {
      const token = localStorage.getItem(
        "srig_token"
      );

      console.log("TOKEN:", token);

      const response = await api.get(
        `/memberships/member/${memberId}`
      );

      console.log(
        "MEMBERSHIP RESPONSE:",
        response.data
      );

      setMemberships(
        response.data.data.memberships || []
      );
    } catch (error) {
      console.error(
        "MEMBERSHIP ERROR:",
        error.response?.data || error
      );
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, []);

  const handleMemberChange = async (memberId) => {
    setSelectedMember(memberId);

    setForm({
      ...form,
      memberId,
      membershipId: "",
    });

    fetchMemberships(memberId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/payments", {
        ...form,
        amount: Number(form.amount),
      });

      setModal(false);

      setForm({
        memberId: "",
        membershipId: "",
        amount: "",
        paymentMethod: "cash",
        paymentDate: new Date()
          .toISOString()
          .split("T")[0],
        transactionId: "",
        notes: "",
      });

      setSelectedMember("");

      fetchPayments();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to add payment"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payments
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Track all manual gym fee payments
          </p>
        </div>

        <button
          onClick={() => setModal(true)}
          className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-semibold shadow-sm transition"
        >
          <Plus size={18} />
          Add Payment
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
              <CreditCard
                size={30}
                className="text-blue-600"
              />
            </div>

            <p className="font-medium text-slate-700">
              No payments found.
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Recorded payments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 text-left bg-slate-50">
                  <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">
                    Member
                  </th>

                  <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">
                    Membership
                  </th>

                  <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">
                    Method
                  </th>

                  <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    {/* Member */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {payment.member?.fullName}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {payment.member?.memberId}
                      </p>
                    </td>

                    {/* Membership */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {payment.membership?.planName}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="text-emerald-600 font-semibold">
                        ₹
                        {Number(
                          payment.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium capitalize">
                        {payment.paymentMethod?.replace(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(
                        payment.paymentDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Add Payment
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Record a manual gym fee payment
                </p>
              </div>

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
              {/* Member */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Member
                </label>

                <select
                  required
                  value={selectedMember}
                  onChange={(e) =>
                    handleMemberChange(
                      e.target.value
                    )
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

              {/* Membership */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Membership
                </label>

                <select
                  required
                  value={form.membershipId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      membershipId:
                        e.target.value,
                    })
                  }
                  className="input"
                >
                  <option value="">
                    Select Membership
                  </option>

                  {memberships.map(
                    (membership) => (
                      <option
                        key={membership._id}
                        value={membership._id}
                      >
                        {membership.planName} — ₹
                        {membership.amount}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Amount + Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="Amount"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          amount:
                            e.target.value,
                        })
                      }
                      className="input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Method
                  </label>

                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentMethod:
                          e.target.value,
                      })
                    }
                    className="input"
                  >
                    <option value="cash">
                      Cash
                    </option>

                    <option value="upi">
                      UPI
                    </option>

                    <option value="bank_transfer">
                      Bank Transfer
                    </option>

                    <option value="card">
                      Card
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Date
                </label>

                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentDate:
                        e.target.value,
                    })
                  }
                  onClick={(e) =>
                    e.currentTarget.showPicker?.()
                  }
                  className="input cursor-pointer"
                />
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transaction ID
                </label>

                <input
                  placeholder="Transaction ID / Reference (optional)"
                  value={form.transactionId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      transactionId:
                        e.target.value,
                    })
                  }
                  className="input"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>

                <textarea
                  rows="3"
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                  className="input resize-none"
                />
              </div>

              {/* Submit */}
              <button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition">
                Save Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;