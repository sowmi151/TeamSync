import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../types";
import { Avatar } from "../common/Avatar";
import { MessageSquare, Search, Send, Paperclip, X, CheckCheck, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { ChatMedia, MEDIA_TYPES, validateMedia } from "../../lib/chatMedia";

export function timeAgo(timestamp: string, now: number): string {
  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) return "time unavailable";
  const seconds = Math.max(0, Math.floor((now - parsed) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export const MessagingView: React.FC<{
  initialSelectedStudent?: Student | null;
}> = ({ initialSelectedStudent }) => {
  const { currentUser, students, messages, sendMessage } = useApp();

  const conversationPartners = useMemo(() => {
    const partnerIds = new Set<string>();
    messages.forEach((m) => {
      if (m.senderId === currentUser.id) partnerIds.add(m.receiverId);
      if (m.receiverId === currentUser.id) partnerIds.add(m.senderId);
    });

    if (
      initialSelectedStudent &&
      initialSelectedStudent.id !== currentUser.id
    ) {
      partnerIds.add(initialSelectedStudent.id);
    }
    if (partnerIds.size === 0) {
      students.filter((s) => s.id !== currentUser.id).slice(0, 3).forEach((s) => partnerIds.add(s.id));
    }

    return students.filter((s) => s.id !== currentUser.id && partnerIds.has(s.id));
  }, [messages, currentUser, students, initialSelectedStudent]);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    initialSelectedStudent?.id || conversationPartners[0]?.id || "",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activity, setActivity] = useState<Record<string, { last_active: string; online: boolean }>>({});
  const [statusError, setStatusError] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      // Also record activity on entering Messages and report permission/setup failures.
      if (document.visibilityState === "visible" && document.hasFocus()) {
        const { error: heartbeatError } = await supabase.rpc("teamsync_activity", { active_now: true });
        if (!active) return;
        if (heartbeatError) setStatusError(`Activity update failed: ${heartbeatError.message}`);
      }
      const { data, error } = await supabase.from("user_activity").select("student_id,last_active,online");
      if (!active) return;
      setClock(Date.now());
      if (error) { setStatusError(`Activity status unavailable: ${error.message}`); return; }
      setActivity(Object.fromEntries((data || []).map((row) => [row.student_id, row])));
    };
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const activityLabel = (id: string) => {
    const entry = activity[id];
    if (entry?.online && clock - Date.parse(entry.last_active) < 75000) return "Online";
    // Sent messages and read receipts are real interactions, even without a heartbeat.
    const recordedTimes = messages.flatMap((message) => [
      ...(message.senderId === id ? [message.timestamp] : []),
      ...(message.receiverId === id && message.isRead && message.readAt ? [message.readAt] : []),
    ]);
    if (entry?.last_active) recordedTimes.push(entry.last_active);
    const latest = recordedTimes.filter((time) => Number.isFinite(Date.parse(time)))
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
    return latest ? `Last active ${timeAgo(latest, clock)}` : "No activity recorded yet";
  };
  useEffect(() => {
    if (initialSelectedStudent && initialSelectedStudent.id !== currentUser.id) {
      setSelectedPartnerId(initialSelectedStudent.id);
    }
  }, [initialSelectedStudent?.id, currentUser.id]);
  const messagesPanelRef = useRef<HTMLDivElement | null>(null);
  const previousPartnerRef = useRef<string | undefined>(undefined);
  const followLatestRef = useRef(true);
  const sentMessageRef = useRef(false);

  const selectedPartner = useMemo(() => {
    return (
      students.find((s) => s.id === selectedPartnerId) ||
      conversationPartners[0]
    );
  }, [students, selectedPartnerId, conversationPartners]);

  const activeConversation = useMemo(() => {
    if (!selectedPartner) return [];
    return messages
      .filter(
        (m) =>
          (m.senderId === currentUser.id &&
            m.receiverId === selectedPartner.id) ||
          (m.senderId === selectedPartner.id &&
            m.receiverId === currentUser.id),
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }, [messages, currentUser, selectedPartner]);

  useEffect(() => {
    const panel = messagesPanelRef.current;
    if (!panel || !selectedPartner) return;
    const inFlight = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) return;
      const ids = entries.filter((entry) => entry.isIntersecting)
        .map((entry) => (entry.target as HTMLElement).dataset.messageId!)
        .filter((id) => id && !inFlight.has(id));
      if (!ids.length) return;
      ids.forEach((id) => inFlight.add(id));
      void supabase.rpc("teamsync_mark_seen", { message_ids: ids }).then(({ error }) => {
        if (error) { ids.forEach((id) => inFlight.delete(id)); setStatusError(`Seen update failed: ${error.message}`); }
      });
    }, { root: panel, threshold: 0.5 });
    const observe = () => {
      observer.disconnect();
      panel.querySelectorAll("[data-unread='true']").forEach((element) => observer.observe(element));
    };
    observe();
    window.addEventListener("focus", observe);
    document.addEventListener("visibilitychange", observe);
    return () => {
      observer.disconnect();
      window.removeEventListener("focus", observe);
      document.removeEventListener("visibilitychange", observe);
    };
  }, [selectedPartner?.id, activeConversation]);

  useEffect(() => {
    // Scroll inside the conversation without moving the surrounding page.
    const panel = messagesPanelRef.current;
    if (!panel) return;
    const changedPartner = previousPartnerRef.current !== selectedPartner?.id;
    previousPartnerRef.current = selectedPartner?.id;
    if (changedPartner || sentMessageRef.current || followLatestRef.current) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollTo({
        top: panel.scrollHeight,
        behavior: changedPartner || reduceMotion ? "instant" : "smooth",
      });
      followLatestRef.current = true;
    }
    sentMessageRef.current = false;
  }, [selectedPartner?.id, activeConversation.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || (!inputText.trim() && !attachment) || !selectedPartner) return;
    setSending(true);
    setSendError(null);
    try {
      sentMessageRef.current = true;
      await sendMessage(selectedPartner.id, inputText.trim(), undefined, attachment || undefined);
      setInputText("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      sentMessageRef.current = false;
      setSendError(error instanceof Error ? error.message : "Unable to send message.");
    } finally { setSending(false); }
  };

  const filteredPartners = conversationPartners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-serif-title font-bold text-2xl sm:text-3xl tracking-tight text-[#FAF7F2]">
            Collegiate Dispatch & Correspondence
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Direct peer messaging for coordinating hackathon project scopes and
            mutual skill synergy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px] rounded-xl bg-[#121217] border border-white/8 overflow-hidden shadow-xl">
        {/* Left: Conversation List */}
        <div className="md:col-span-4 bg-[#0E0E12] border-r border-white/8 flex flex-col h-full min-h-0 overflow-hidden">
          <div className="p-3.5 border-b border-white/8">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#71717A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search correspondence..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#14141A] text-xs text-[#FAF7F2] border border-white/8 focus:outline-none focus:border-[#D4AF37]/40"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-white/[0.04]">
            {filteredPartners.map((partner) => {
              const isSelected = selectedPartner?.id === partner.id;
              const lastMsg = messages
                .filter(
                  (m) =>
                    (m.senderId === currentUser.id &&
                      m.receiverId === partner.id) ||
                    (m.senderId === partner.id &&
                      m.receiverId === currentUser.id),
                )
                .slice(-1)[0];

              return (
                <button
                  key={partner.id}
                  disabled={sending}
                  onClick={() => { setSelectedPartnerId(partner.id); setSendError(null); setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 ${
                    isSelected
                      ? "bg-[#181822] border-l-2 border-[#D4AF37]"
                      : "hover:bg-[#131318]"
                  }`}
                >
                  <Avatar
                    name={partner.name}
                    avatarUrl={partner.avatarUrl}
                    department={partner.department}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-title font-bold text-sm text-[#FAF7F2] truncate">
                        {partner.name}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {activityLabel(partner.id)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#C5A880] truncate">
                      {partner.roles?.[0] || "Student"}
                    </div>
                    <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                      {lastMsg ? lastMsg.content : "No correspondence yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className="md:col-span-8 flex flex-col h-full min-h-0 overflow-hidden bg-[#121217]">
          {selectedPartner ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 p-3.5 px-4 border-b border-white/8 bg-[#15151C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={selectedPartner.name}
                    avatarUrl={selectedPartner.avatarUrl}
                    size="sm"
                  />
                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-[#FAF7F2]">
                      {selectedPartner.name}
                    </h4>
                    <span className="text-[11px] text-[#A1A1AA]">
                      {selectedPartner.department} · {selectedPartner.year}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className={`text-[11px] font-mono flex items-center gap-1.5 ${activityLabel(selectedPartner.id) === "Online" ? "text-emerald-400" : "text-slate-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activityLabel(selectedPartner.id) === "Online" ? "bg-emerald-400" : "bg-slate-500"}`} />
                    <span>{activityLabel(selectedPartner.id)}</span>
                  </span>
                </div>
              </div>

              {/* Messages Body */}
              <div ref={messagesPanelRef}
                onScroll={(event) => {
                  const panel = event.currentTarget;
                  followLatestRef.current = panel.scrollHeight - panel.scrollTop - panel.clientHeight < 80;
                }}
                className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-[#0F0F13]">
                {activeConversation.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      data-message-id={msg.id}
                      data-unread={!isMine && !msg.isRead ? "true" : "false"}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-xl text-xs leading-relaxed shadow-sm ${
                          isMine
                            ? "bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/30 rounded-br-none"
                            : "bg-[#181820] text-[#E8E4DD] border border-white/[0.07] rounded-bl-none"
                        }`}
                      >
                        {msg.attachmentPath && msg.attachmentType && <ChatMedia path={msg.attachmentPath} type={msg.attachmentType} name={msg.attachmentName} />}
                        <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                      </div>
                      <span className="text-[10px] text-[#71717A] mt-1 px-1 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isMine && <span className={`inline-flex items-center gap-1 ml-2 ${msg.isRead ? "text-sky-400" : "text-slate-400"}`}>
                          {msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
                          {msg.isRead ? (msg.readAt ? `Seen ${timeAgo(msg.readAt, clock)}` : "Seen (time not recorded)") : "Sent · Not seen yet"}
                        </span>}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input Footer */}
              {statusError && <p role="status" className="shrink-0 px-3 text-xs text-amber-300">{statusError}</p>}
              {attachment && <div className="shrink-0 p-2 flex items-center gap-2 text-xs text-slate-200">
                <span>{attachment.name} ({(attachment.size / 1024 / 1024).toFixed(1)} MB)</span>
                <button type="button" disabled={sending} aria-label="Remove attachment" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}><X size={16} /></button>
              </div>}
              {sendError && <p role="alert" className="shrink-0 p-3 text-sm text-red-400">{sendError}</p>}
              <form
                onSubmit={handleSend}
                className="shrink-0 p-3 border-t border-white/8 bg-[#14141A] flex items-center gap-2"
              >
                <input ref={fileInputRef} type="file" className="hidden" accept={MEDIA_TYPES.join(",")}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try { validateMedia(file); setAttachment(file); setSendError(null); }
                    catch (error) { setSendError((error as Error).message); event.target.value = ""; }
                  }} />
                <button type="button" disabled={sending} title="Attach photo or video (up to 50 MB)" aria-label="Attach photo or video"
                  onClick={() => fileInputRef.current?.click()} className="p-2 text-sky-300"><Paperclip size={20} /></button>
                <input
                  type="text"
                  disabled={sending}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Dispatch message to ${selectedPartner.name.split(" ")[0]}...`}
                  className="flex-1 px-3.5 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/8 focus:outline-none focus:border-[#D4AF37]/40"
                />
                <button
                  type="submit"
                  disabled={sending || (!inputText.trim() && !attachment)}
                  aria-label={sending ? "Sending message" : "Send message"}
                  className="p-2.5 rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/35 hover:border-[#D4AF37]/65 transition-all"
                >
                  <Send className="w-4 h-4 text-[#E5C07B]" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
              <MessageSquare className="w-8 h-8 text-[#71717A]" />
              <div className="text-sm font-semibold text-[#FAF7F2]">
                No conversation selected
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Select a teammate from the left sidebar to start collaborating.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
