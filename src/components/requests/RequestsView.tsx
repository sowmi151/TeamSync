import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../common/Avatar";
import { Check, CheckCircle2, Clock, UserPlus, X } from "lucide-react";

export const RequestsView: React.FC<{
  onOpenProfile: (student: any) => void;
}> = ({ onOpenProfile }) => {
  const {
    currentUser,
    requests,
    students,
    projects,
    respondToRequest,
    setActiveTab,
  } = useApp();

  const [filter, setFilter] = useState<"received" | "sent">("received");

  const receivedRequests = requests.filter(
    (r) => r.receiverId === currentUser.id,
  );
  const sentRequests = requests.filter((r) => r.senderId === currentUser.id);
  const currentList = filter === "received" ? receivedRequests : sentRequests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title font-bold text-2xl sm:text-3xl tracking-tight text-[#FAF7F2]">
            Invitations & Admission Requests
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
            Accepting an invitation triggers automatic team formation, updates
            skill coverage, and synchronizes the project workspace.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center p-1 rounded-lg bg-[#0C0C10] border border-white/8 self-start sm:self-auto">
          <button
            onClick={() => setFilter("received")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filter === "received"
                ? "bg-[#1E1E26] text-[#FAF7F2] shadow-sm"
                : "text-[#71717A] hover:text-[#FAF7F2]"
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setFilter("sent")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filter === "sent"
                ? "bg-[#1E1E26] text-[#FAF7F2] shadow-sm"
                : "text-[#71717A] hover:text-[#FAF7F2]"
            }`}
          >
            Dispatched ({sentRequests.length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {currentList.length > 0 ? (
          currentList.map((req) => {
            const otherPersonId =
              filter === "received" ? req.senderId : req.receiverId;
            const otherPerson = students.find((s) => s.id === otherPersonId);
            const project = projects.find((p) => p.id === req.projectId);

            if (!otherPerson) return null;

            return (
              <div
                key={req.id}
                className="p-5 rounded-xl bg-[#121217] border border-white/8 hover:border-[#D4AF37]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    name={otherPerson.name}
                    avatarUrl={otherPerson.avatarUrl}
                    department={otherPerson.department}
                    size="md"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif-title font-bold text-base text-[#FAF7F2]">
                        {otherPerson.name}
                      </span>
                      <span className="text-xs text-[#71717A]">
                        ({otherPerson.roles?.[0] || "Student"})
                      </span>
                      <span className="text-xs text-[#C5A880]">
                        · {otherPerson.year}
                      </span>
                    </div>

                    <div className="text-xs text-[#E8E4DD] font-medium">
                      {filter === "received" ? (
                        <>
                          Requested entry to{" "}
                          <span className="text-[#E5C07B] font-semibold">
                            "{project?.title || "Project"}"
                          </span>
                        </>
                      ) : (
                        <>
                          You invited {otherPerson.name.split(" ")[0]} to join{" "}
                          <span className="text-[#E5C07B] font-semibold">
                            "{project?.title || "Project"}"
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-[#A1A1AA] italic bg-[#0C0C10] p-2.5 rounded-lg border border-white/[0.06] max-w-xl">
                      "{req.message}"
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-[#71717A] pt-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status or Action Buttons */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  {req.status === "pending" ? (
                    filter === "received" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => respondToRequest(req.id, "reject")}
                          className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#A1A1AA] hover:text-rose-400 border border-white/8 transition-all flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>

                        <button
                          onClick={() => respondToRequest(req.id, "accept")}
                          className="px-4 py-2 text-xs font-semibold rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/35 hover:border-[#D4AF37]/65 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 text-[#E5C07B]" />
                          <span>Accept & Formalize</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-md bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/25 font-medium font-mono">
                        Awaiting Response
                      </span>
                    )
                  ) : req.status === "accepted" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Formalized · Squad Updated</span>
                      </span>
                      <button
                        onClick={() => setActiveTab("my-team")}
                        className="text-xs text-[#E5C07B] hover:underline font-medium"
                      >
                        Inspect Squad →
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-md bg-[#0C0C10] border border-white/[0.06] text-[#71717A]">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-xl bg-[#121217] text-center border border-white/8 space-y-3">
            <UserPlus className="w-8 h-8 text-[#D4AF37] mx-auto opacity-75" />
            <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
              No {filter} admission requests
            </h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
              {filter === "received"
                ? "When scholars discover your published projects, their entry requests will appear here."
                : "Explore candidates in the Registry to dispatch collaborative invitations."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
