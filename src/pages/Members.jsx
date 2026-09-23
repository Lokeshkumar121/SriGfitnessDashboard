import { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Users,
  X,
  Phone,
  UserRound,
  CalendarDays,
  MapPin,
  FileText,
  CreditCard,
  Clock3,
  Trash2,
} from "lucide-react";

import api from "../services/api";

const Members = () => {
  const [members, setMembers] = useState([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Payment Status
  |--------------------------------------------------------------------------
  */

  const [paymentStatuses, setPaymentStatuses] =
    useState({});

  /*
  |--------------------------------------------------------------------------
  | Delete Member
  |--------------------------------------------------------------------------
  */

  const [deletingMember, setDeletingMember] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Member Details
  |--------------------------------------------------------------------------
  */

  const [detailsModal, setDetailsModal] =
    useState(false);

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [
    memberMemberships,
    setMemberMemberships,
  ] = useState([]);

  const [paymentSummary, setPaymentSummary] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Add Member Form
  |--------------------------------------------------------------------------
  */

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    gender: "male",
    address: "",
  });

  /*
  |--------------------------------------------------------------------------
  | Fetch Payment Statuses
  |--------------------------------------------------------------------------
  */
const fetchPaymentStatuses = async (memberList) => {
  try {
    if (!memberList.length) {
      setPaymentStatuses({});
      return;
    }

    const results = await Promise.all(
      memberList.map(async (member) => {
        try {
          const response = await api.get(
            `/payments/member/${member._id}/summary`
          );

          const paymentData =
            response.data?.data;

          const summary =
            paymentData?.summary;

          console.log(
            "PAYMENT DATA:",
            member.fullName,
            paymentData
          );

          const paymentStatus =
            summary?.currentMembership
              ?.paymentStatus ||
            summary?.paymentStatus ||
            "unpaid";

          return {
            memberId: member._id,
            status: paymentStatus,
          };
        } catch (error) {
          console.error(
            `Payment status error for ${member.fullName}:`,
            error.response?.data ||
              error.message
          );

          return {
            memberId: member._id,
            status: "unpaid",
          };
        }
      })
    );

    const statusMap = {};

    results.forEach((item) => {
      statusMap[item.memberId] =
        item.status;
    });

    console.log(
      "PAYMENT STATUS MAP:",
      statusMap
    );

    setPaymentStatuses(statusMap);
  } catch (error) {
    console.error(
      "Fetch payment statuses error:",
      error
    );
  }
};

  /*
  |--------------------------------------------------------------------------
  | Fetch Members
  |--------------------------------------------------------------------------
  */

const fetchMembers = async () => {
  try {
    setLoading(true);

    const params = new URLSearchParams();

    if (search) {
      params.append("search", search);
    }

    if (status) {
      params.append("status", status);
    }

    const response = await api.get(
      `/members?${params.toString()}`
    );

    const memberList =
      response.data?.data?.members || [];

    setMembers(memberList);

    await fetchPaymentStatuses(memberList);
  } catch (error) {
    console.error(
      "Fetch members error:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  /*
  |--------------------------------------------------------------------------
  | Delete Member
  |--------------------------------------------------------------------------
  */

  const handleDeleteMember = async (
    member
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingMember(member._id);

      await api.delete(
        `/members/${member._id}`
      );

      /*
      |--------------------------------------------------------------------------
      | Remove From Members List
      |--------------------------------------------------------------------------
      */

      setMembers((prev) =>
        prev.filter(
          (item) =>
            item._id !== member._id
        )
      );

      /*
      |--------------------------------------------------------------------------
      | Remove Payment Status
      |--------------------------------------------------------------------------
      */

      setPaymentStatuses((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[member._id];

        return updated;
      });

      /*
      |--------------------------------------------------------------------------
      | Close Details If Same Member
      |--------------------------------------------------------------------------
      */

      if (
        selectedMember?._id ===
        member._id
      ) {
        closeMemberDetails();
      }

      alert(
        "Member deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete member error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete member"
      );
    } finally {
      setDeletingMember(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Members On Search / Filter
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  /*
  |--------------------------------------------------------------------------
  | Create Member
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/members",
        form
      );

      setModal(false);

      setForm({
        fullName: "",
        phone: "",
        gender: "male",
        address: "",
      });

      fetchMembers();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create member"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Open Member Details
  |--------------------------------------------------------------------------
  */

  const openMemberDetails = async (
    member
  ) => {
    try {
      setSelectedMember(member);

      setDetailsModal(true);

      setDetailsLoading(true);

      setMemberMemberships([]);

      setPaymentSummary(null);

      const [
        membershipResponse,
        paymentResponse,
      ] = await Promise.all([
        api.get(
          `/memberships/member/${member._id}`
        ),

        api.get(
          `/payments/member/${member._id}/summary`
        ),
      ]);

      /*
      |--------------------------------------------------------------------------
      | Membership Data
      |--------------------------------------------------------------------------
      */

      setMemberMemberships(
        membershipResponse.data.data
          .memberships || []
      );

      /*
      |--------------------------------------------------------------------------
      | Payment Data
      |--------------------------------------------------------------------------
      */

      setPaymentSummary(
        paymentResponse.data.data ||
          null
      );

      /*
      |--------------------------------------------------------------------------
      | Update List Payment Status
      |--------------------------------------------------------------------------
      */

      const currentPaymentStatus =
        paymentResponse.data.data?.summary
          ?.currentMembership
          ?.paymentStatus || "unpaid";

      setPaymentStatuses((prev) => ({
        ...prev,
        [member._id]:
          currentPaymentStatus,
      }));
    } catch (error) {
      console.error(
        "Member details error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load member details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Close Member Details
  |--------------------------------------------------------------------------
  */

  const closeMemberDetails = () => {
    setDetailsModal(false);

    setSelectedMember(null);

    setMemberMemberships([]);

    setPaymentSummary(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Calculate Membership Information
  |--------------------------------------------------------------------------
  */

  const getMembershipInfo = (
    membership
  ) => {
    const startDate = new Date(
      membership.startDate
    );

    const endDate = new Date(
      membership.endDate
    );

    const today = new Date();

    const totalMilliseconds =
      endDate.getTime() -
      startDate.getTime();

    const totalDays = Math.max(
      1,
      Math.ceil(
        totalMilliseconds /
          (1000 * 60 * 60 * 24)
      )
    );

    const remainingMilliseconds =
      endDate.getTime() -
      today.getTime();

    const remainingDays = Math.max(
      0,
      Math.ceil(
        remainingMilliseconds /
          (1000 * 60 * 60 * 24)
      )
    );

    const completedDays = Math.min(
      totalDays,
      Math.max(
        0,
        totalDays - remainingDays
      )
    );

    const progress = Math.min(
      100,
      Math.max(
        0,
        (completedDays / totalDays) *
          100
      )
    );

    const isActive =
      membership.status === "active" &&
      endDate >= today;

    return {
      startDate,
      endDate,
      totalDays,
      remainingDays,
      completedDays,
      progress,
      isActive,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Payment Status UI
  |--------------------------------------------------------------------------
  */

  const getPaymentStatusUI = (
    paymentStatus
  ) => {
    if (paymentStatus === "paid") {
      return {
        label: "PAID",
        className:
          "bg-emerald-500/10 text-emerald-400",
      };
    }

    if (
      paymentStatus === "partial"
    ) {
      return {
        label: "PARTIALLY PAID",
        className:
          "bg-amber-500/10 text-amber-400",
      };
    }

    return {
      label: "UNPAID",
      className:
        "bg-red-500/10 text-red-400",
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Status UI
  |--------------------------------------------------------------------------
  */

  const getMemberStatusUI = (
    memberStatus
  ) => {
    if (memberStatus === "active") {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (memberStatus === "expired") {
      return "bg-red-500/10 text-red-400";
    }

    if (memberStatus === "suspended") {
      return "bg-amber-500/10 text-amber-400";
    }

    return "bg-slate-500/10 text-slate-400";
  };

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* Header */}
      {/* ========================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold">
            Members
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage all gym members
          </p>

        </div>

        <button
          onClick={() =>
            setModal(true)
          }
          className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 font-semibold transition"
        >
          <Plus size={18} />

          Add Member
        </button>

      </div>

      {/* ========================================================= */}
      {/* Filters */}
      {/* ========================================================= */}

      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4">

        <div className="flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search name, phone, member ID..."
              className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 outline-none focus:border-blue-500"
            />

          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="h-11 bg-slate-950 border border-white/10 rounded-xl px-4 outline-none text-sm"
          >
            <option value="">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="expired">
              Expired
            </option>

            <option value="suspended">
              Suspended
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

        </div>

      </div>

      {/* ========================================================= */}
      {/* Members */}
      {/* ========================================================= */}

      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">

        {loading ? (

          <div className="p-10 text-center text-slate-500">
            Loading members...
          </div>

        ) : members.length === 0 ? (

          <div className="p-12 text-center">

            <Users
              size={40}
              className="mx-auto text-slate-700"
            />

            <p className="mt-4 font-medium">
              No members found
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Add your first gym member.
            </p>

          </div>

        ) : (

          <>

            {/* ================================================= */}
            {/* Desktop Table */}
            {/* ================================================= */}

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-white/10 text-left">

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Member
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Gender
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Membership
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500 text-right">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {members.map(
                    (member) => {

                      const paymentStatus =
                        paymentStatuses[
                          member._id
                        ] || "unpaid";

                      const paymentUI =
                        getPaymentStatusUI(
                          paymentStatus
                        );

                      const isDeleting =
                        deletingMember ===
                        member._id;

                      return (

                        <tr
                          key={
                            member._id
                          }
                          onClick={() =>
                            openMemberDetails(
                              member
                            )
                          }
                          className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition"
                        >

                          {/* Member */}

                          <td className="px-5 py-4">

                            <p className="font-medium">
                              {
                                member.fullName
                              }
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {
                                member.memberId
                              }
                            </p>

                          </td>

                          {/* Contact */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <Phone
                                size={14}
                                className="text-slate-500"
                              />

                              <p className="text-sm">
                                {
                                  member.phone
                                }
                              </p>

                            </div>

                          </td>

                          {/* Gender */}

                          <td className="px-5 py-4 text-sm capitalize">
                            {
                              member.gender
                            }
                          </td>

                          {/* Membership */}

                          <td className="px-5 py-4">

                            {member.status ===
                            "active" ? (

                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                                ACTIVE
                              </span>

                            ) : (

                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
                                NO ACTIVE
                                MEMBERSHIP
                              </span>

                            )}

                          </td>

                          {/* Payment */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${paymentUI.className}`}
                            >
                              {
                                paymentUI.label
                              }
                            </span>

                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getMemberStatusUI(
                                member.status
                              )}`}
                            >
                              {
                                member.status
                              }
                            </span>

                          </td>

                          {/* Action */}

                          <td
                            className="px-5 py-4 text-right"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >

                            <button
                              type="button"
                              disabled={
                                isDeleting
                              }
                              onClick={() =>
                                handleDeleteMember(
                                  member
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >

                              <Trash2
                                size={15}
                              />

                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}

                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* ================================================= */}
            {/* Mobile */}
            {/* ================================================= */}

            <div className="md:hidden divide-y divide-white/5">

              {members.map(
                (member) => {

                  const paymentStatus =
                    paymentStatuses[
                      member._id
                    ] || "unpaid";

                  const paymentUI =
                    getPaymentStatusUI(
                      paymentStatus
                    );

                  const isDeleting =
                    deletingMember ===
                    member._id;

                  return (

                    <div
                      key={
                        member._id
                      }
                      onClick={() =>
                        openMemberDetails(
                          member
                        )
                      }
                      className="p-4 cursor-pointer hover:bg-white/[0.03] transition"
                    >

                      {/* Top */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex gap-3">

                          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">

                            <UserRound
                              size={20}
                            />

                          </div>

                          <div>

                            <p className="font-semibold">
                              {
                                member.fullName
                              }
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {
                                member.memberId
                              }
                            </p>

                          </div>

                        </div>

                        <span
                          className={`text-xs capitalize px-2.5 py-1 rounded-full ${getMemberStatusUI(
                            member.status
                          )}`}
                        >
                          {
                            member.status
                          }
                        </span>

                      </div>

                      {/* Contact */}

                      <div className="mt-4 space-y-2 text-sm text-slate-400">

                        <div className="flex items-center gap-2">

                          <Phone
                            size={14}
                          />

                          {
                            member.phone
                          }

                        </div>

                        <div className="flex items-center gap-2">

                          <UserRound
                            size={14}
                          />

                          <span className="capitalize">
                            {
                              member.gender
                            }
                          </span>

                        </div>

                      </div>

                      {/* Badges */}

                      <div className="flex flex-wrap items-center gap-2 mt-4">

                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                          {member.status ===
                          "active"
                            ? "ACTIVE MEMBERSHIP"
                            : "NO ACTIVE MEMBERSHIP"}
                        </span>

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${paymentUI.className}`}
                        >
                          {
                            paymentUI.label
                          }
                        </span>

                      </div>

                      {/* Delete */}

                      <div
                        className="mt-4"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        <button
                          type="button"
                          disabled={
                            isDeleting
                          }
                          onClick={() =>
                            handleDeleteMember(
                              member
                            )
                          }
                          className="w-full h-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition"
                        >

                          <Trash2
                            size={15}
                          />

                          {isDeleting
                            ? "Deleting..."
                            : "Delete Member"}

                        </button>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          </>

        )}

      </div>

      {/* ========================================================= */}
      {/* Member Details Modal */}
      {/* ========================================================= */}

      {detailsModal &&
        selectedMember && (

          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl max-h-[92vh] overflow-y-auto">

              {/* ================================================= */}
              {/* Details Header */}
              {/* ================================================= */}

              <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900 z-20">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">

                    <UserRound
                      size={23}
                    />

                  </div>

                  <div>

                    <h2 className="font-bold text-lg">
                      {
                        selectedMember.fullName
                      }
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      Member ID:{" "}
                      {
                        selectedMember.memberId
                      }
                    </p>

                  </div>

                </div>

                <button
                  onClick={
                    closeMemberDetails
                  }
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>

              </div>

              {detailsLoading ? (

                <div className="p-16 text-center text-slate-500">
                  Loading member details...
                </div>

              ) : (

                <div className="p-5 space-y-6">

                  {/* ================================================= */}
                  {/* Member Information */}
                  {/* ================================================= */}

                  <section>

                    <h3 className="text-sm font-semibold text-slate-300 mb-3">
                      Member Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                      {/* Phone */}

                      <div className="bg-slate-950 border border-white/5 rounded-xl p-4">

                        <div className="flex items-center gap-2 text-slate-500 text-xs">

                          <Phone
                            size={14}
                          />

                          Phone

                        </div>

                        <p className="mt-2 font-medium">
                          {
                            selectedMember.phone ||
                            "—"
                          }
                        </p>

                      </div>

                      {/* Gender */}

                      <div className="bg-slate-950 border border-white/5 rounded-xl p-4">

                        <div className="flex items-center gap-2 text-slate-500 text-xs">

                          <UserRound
                            size={14}
                          />

                          Gender

                        </div>

                        <p className="mt-2 font-medium capitalize">
                          {
                            selectedMember.gender ||
                            "—"
                          }
                        </p>

                      </div>

                      {/* Address */}

                      <div className="bg-slate-950 border border-white/5 rounded-xl p-4 sm:col-span-2">

                        <div className="flex items-center gap-2 text-slate-500 text-xs">

                          <MapPin
                            size={14}
                          />

                          Address

                        </div>

                        <p className="mt-2 font-medium">
                          {
                            selectedMember.address ||
                            "—"
                          }
                        </p>

                      </div>

                    </div>

                  </section>

                  {/* ================================================= */}
                  {/* Membership */}
                  {/* ================================================= */}

                  <section>

                    <div className="flex items-center justify-between mb-3">

                      <h3 className="text-sm font-semibold text-slate-300">
                        Membership
                      </h3>

                      {memberMemberships.length >
                        0 && (

                        <span className="text-xs text-slate-500">

                          {
                            memberMemberships.length
                          }{" "}
                          record
                          {memberMemberships.length >
                          1
                            ? "s"
                            : ""}

                        </span>

                      )}

                    </div>

                    {memberMemberships.length ===
                    0 ? (

                      <div className="bg-slate-950 border border-white/5 rounded-2xl p-10 text-center">

                        <CreditCard
                          size={36}
                          className="mx-auto text-slate-700"
                        />

                        <p className="mt-3 font-medium">
                          No membership assigned
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          This member does not have
                          any membership yet.
                        </p>

                      </div>

                    ) : (

                      <div className="space-y-4">

                        {memberMemberships.map(
                          (
                            membership
                          ) => {

                            const {
                              startDate,
                              endDate,
                              totalDays,
                              remainingDays,
                              completedDays,
                              progress,
                              isActive,
                            } =
                              getMembershipInfo(
                                membership
                              );

                            return (

                              <div
                                key={
                                  membership._id
                                }
                                className="bg-slate-950 border border-white/5 rounded-2xl p-5"
                              >

                                {/* Plan Header */}

                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                                  <div>

                                    <p className="text-xs text-slate-500">
                                      Membership Plan
                                    </p>

                                    <h4 className="text-xl font-bold mt-1">
                                      {
                                        membership.planName ||
                                        membership
                                          .plan
                                          ?.name ||
                                        "Membership"
                                      }
                                    </h4>

                                    <p className="text-sm text-slate-500 mt-1">
                                      {
                                        membership.durationInDays
                                      }{" "}
                                      days
                                    </p>

                                  </div>

                                  <span
                                    className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                      isActive
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-red-500/10 text-red-400"
                                    }`}
                                  >
                                    {isActive
                                      ? "Active"
                                      : membership.status}
                                  </span>

                                </div>

                                {/* Membership Stats */}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">

                                  {/* Start Date */}

                                  <div className="bg-slate-900 rounded-xl p-4">

                                    <div className="flex items-center gap-2 text-slate-500 text-xs">

                                      <CalendarDays
                                        size={14}
                                      />

                                      Start Date

                                    </div>

                                    <p className="text-sm font-medium mt-2">
                                      {startDate.toLocaleDateString(
                                        "en-IN"
                                      )}
                                    </p>

                                  </div>

                                  {/* End Date */}

                                  <div className="bg-slate-900 rounded-xl p-4">

                                    <div className="flex items-center gap-2 text-slate-500 text-xs">

                                      <CalendarDays
                                        size={14}
                                      />

                                      End Date

                                    </div>

                                    <p className="text-sm font-medium mt-2">
                                      {endDate.toLocaleDateString(
                                        "en-IN"
                                      )}
                                    </p>

                                  </div>

                                  {/* Duration */}

                                  <div className="bg-slate-900 rounded-xl p-4">

                                    <div className="flex items-center gap-2 text-slate-500 text-xs">

                                      <Clock3
                                        size={14}
                                      />

                                      Duration

                                    </div>

                                    <p className="text-sm font-medium mt-2">
                                      {
                                        totalDays
                                      }{" "}
                                      days
                                    </p>

                                  </div>

                                  {/* Fee */}

                                  <div className="bg-slate-900 rounded-xl p-4">

                                    <div className="flex items-center gap-2 text-slate-500 text-xs">

                                      <CreditCard
                                        size={14}
                                      />

                                      Membership Fee

                                    </div>

                                    <p className="text-sm font-semibold text-emerald-400 mt-2">
                                      ₹
                                      {Number(
                                        membership.amount
                                      ).toLocaleString(
                                        "en-IN"
                                      )}
                                    </p>

                                  </div>

                                </div>

                                {/* Progress */}

                                {isActive && (

                                  <div className="mt-5">

                                    <div className="flex items-center justify-between text-xs mb-2">

                                      <span className="text-slate-500">
                                        Membership Progress
                                      </span>

                                      <span className="text-slate-400">
                                        {
                                          remainingDays
                                        }{" "}
                                        days
                                        remaining
                                      </span>

                                    </div>

                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

                                      <div
                                        className="h-full bg-blue-600 rounded-full transition-all"
                                        style={{
                                          width: `${progress}%`,
                                        }}
                                      />

                                    </div>

                                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">

                                      <span>
                                        {
                                          completedDays
                                        }{" "}
                                        days
                                        completed
                                      </span>

                                      <span>
                                        {
                                          totalDays
                                        }{" "}
                                        total days
                                      </span>

                                    </div>

                                  </div>

                                )}

                                {/* Membership Notes */}

                                {membership.notes && (

                                  <div className="mt-5 pt-4 border-t border-white/5">

                                    <div className="flex items-center gap-2 text-xs text-slate-500">

                                      <FileText
                                        size={14}
                                      />

                                      Membership Notes

                                    </div>

                                    <p className="text-sm text-slate-400 mt-2">
                                      {
                                        membership.notes
                                      }
                                    </p>

                                  </div>

                                )}

                              </div>

                            );
                          }
                        )}

                      </div>

                    )}

                  </section>

                  {/* ================================================= */}
                  {/* Payment Status */}
                  {/* ================================================= */}

                  {memberMemberships.length >
                    0 && (

                    <section>

                      <div className="flex items-center justify-between mb-3">

                        <h3 className="text-sm font-semibold text-slate-300">
                          Payment Status
                        </h3>

                        {paymentSummary?.summary
                          ?.currentMembership && (

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              getPaymentStatusUI(
                                paymentSummary
                                  .summary
                                  .currentMembership
                                  .paymentStatus
                              ).className
                            }`}
                          >
                            {
                              getPaymentStatusUI(
                                paymentSummary
                                  .summary
                                  .currentMembership
                                  .paymentStatus
                              ).label
                            }
                          </span>

                        )}

                      </div>

                      <div className="bg-slate-950 border border-white/5 rounded-2xl p-5">

                        {paymentSummary?.summary
                          ?.currentMembership ? (

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* Membership Fee */}

                            <div className="bg-slate-900 rounded-xl p-4">

                              <p className="text-xs text-slate-500">
                                Membership Fee
                              </p>

                              <p className="text-xl font-bold mt-2">

                                ₹
                                {Number(
                                  paymentSummary
                                    .summary
                                    .currentMembership
                                    .membershipAmount
                                ).toLocaleString(
                                  "en-IN"
                                )}

                              </p>

                            </div>

                            {/* Paid */}

                            <div className="bg-slate-900 rounded-xl p-4">

                              <p className="text-xs text-slate-500">
                                Paid Amount
                              </p>

                              <p className="text-xl font-bold text-emerald-400 mt-2">

                                ₹
                                {Number(
                                  paymentSummary
                                    .summary
                                    .currentMembership
                                    .paidAmount
                                ).toLocaleString(
                                  "en-IN"
                                )}

                              </p>

                            </div>

                            {/* Pending */}

                            <div className="bg-slate-900 rounded-xl p-4">

                              <p className="text-xs text-slate-500">
                                Pending Amount
                              </p>

                              <p
                                className={`text-xl font-bold mt-2 ${
                                  Number(
                                    paymentSummary
                                      .summary
                                      .currentMembership
                                      .pendingAmount
                                  ) > 0
                                    ? "text-red-400"
                                    : "text-emerald-400"
                                }`}
                              >

                                ₹
                                {Number(
                                  paymentSummary
                                    .summary
                                    .currentMembership
                                    .pendingAmount
                                ).toLocaleString(
                                  "en-IN"
                                )}

                              </p>

                            </div>

                          </div>

                        ) : (

                          <div className="p-6 text-center text-slate-500">
                            Loading payment information...
                          </div>

                        )}

                      </div>

                    </section>

                  )}

                  {/* ================================================= */}
                  {/* Member Notes */}
                  {/* ================================================= */}

                  {selectedMember.notes && (

                    <section>

                      <h3 className="text-sm font-semibold text-slate-300 mb-3">
                        Member Notes
                      </h3>

                      <div className="bg-slate-950 border border-white/5 rounded-2xl p-4">

                        <div className="flex items-center gap-2 text-xs text-slate-500">

                          <FileText
                            size={14}
                          />

                          Notes

                        </div>

                        <p className="text-sm text-slate-400 mt-2">
                          {
                            selectedMember.notes
                          }
                        </p>

                      </div>

                    </section>

                  )}

                </div>

              )}

            </div>

          </div>

        )}

      {/* ========================================================= */}
      {/* Add Member Modal */}
      {/* ========================================================= */}

      {modal && (

        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className="p-5 border-b border-white/10 flex items-center justify-between">

              <div>

                <h2 className="font-bold text-lg">
                  Add New Member
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Create a new gym member profile
                </p>

              </div>

              <button
                onClick={() =>
                  setModal(false)
                }
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-5"
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}

                <input
                  required
                  placeholder="Full Name"
                  value={
                    form.fullName
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fullName:
                        e.target.value,
                    })
                  }
                  className="input"
                />

                {/* Phone */}

                <input
                  required
                  placeholder="Phone Number"
                  value={
                    form.phone
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone:
                        e.target.value,
                    })
                  }
                  className="input"
                />

                {/* Gender */}

                <select
                  value={
                    form.gender
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender:
                        e.target.value,
                    })
                  }
                  className="input"
                >

                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

                {/* Address */}

                <input
                  placeholder="Address"
                  value={
                    form.address
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address:
                        e.target.value,
                    })
                  }
                  className="input"
                />

              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition"
              >
                Create Member
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Members;