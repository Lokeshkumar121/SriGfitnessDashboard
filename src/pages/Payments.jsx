import { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  X,
  IndianRupee,
  Search,
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
    const token = localStorage.getItem("srig_token");

    console.log("TOKEN:", token);

    const response = await api.get(
      `/memberships/member/${memberId}`
    );

    console.log("MEMBERSHIP RESPONSE:", response.data);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Payments
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Track all manual gym fee payments
          </p>
        </div>

        <button
          onClick={() => setModal(true)}
          className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 font-semibold"
        >
          <Plus size={18} />
          Add Payment
        </button>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CreditCard
              size={40}
              className="mx-auto mb-3 opacity-40"
            />
            No payments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-5 py-4 text-xs text-slate-500 uppercase">
                    Member
                  </th>

                  <th className="px-5 py-4 text-xs text-slate-500 uppercase">
                    Membership
                  </th>

                  <th className="px-5 py-4 text-xs text-slate-500 uppercase">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-xs text-slate-500 uppercase">
                    Method
                  </th>

                  <th className="px-5 py-4 text-xs text-slate-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-white/5"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {payment.member?.fullName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {payment.member?.memberId}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {payment.membership?.planName}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-emerald-400 font-semibold">
                        ₹
                        {Number(
                          payment.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm capitalize">
                      {payment.paymentMethod?.replace(
                        "_",
                        " "
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
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

      {modal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">
                  Add Payment
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Record a manual gym fee payment
                </p>
              </div>

              <button
                onClick={() => setModal(false)}
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <IndianRupee
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
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
                className="input"
              />

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

              <button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold">
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