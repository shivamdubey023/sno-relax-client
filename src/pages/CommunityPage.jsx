// src/pages/CommunityPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { API_ENDPOINTS, SOCKET_URL } from "../config/api.config";
import { io } from "socket.io-client";
import { useNavigate } from 'react-router-dom';
import "../styles/Community.css";

export default function CommunityPage() {
  // ---- User identity handling (safe + consistent) ----
  const storedUserId =
    localStorage.getItem("userId") ||
    localStorage.getItem("sno_userId") ||
    localStorage.getItem("sno_user_id") ||
    null;

  const [currentUserId, setCurrentUserId] = useState(storedUserId);
  const userRole = localStorage.getItem("userRole") || "user";
  const isLoggedIn = !!currentUserId;
  const navigate = useNavigate();

  // ---- UI: hamburger/menu for groups (mobile/top) ----
  const [menuOpen, setMenuOpen] = useState(true); // controls sidebar visibility

  // ---- Core state ----
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- UI state ----
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupIsPrivate, setGroupIsPrivate] = useState(false);
  const [nickname, setNickname] = useState(
    localStorage.getItem("communityNickname") || "Anonymous"
  );
  const [showViolationPopup, setShowViolationPopup] = useState(
    !localStorage.getItem("communityPolicyAccepted")
  );

  // ---- Refs ----
  const messagesEndRef = useRef(null);
  const inputAreaRef = useRef(null);
  const msgInputRef = useRef(null);
  const socketRef = useRef(null);
  const [messagesMaxHeight, setMessagesMaxHeight] = useState("auto");

  // Auto-resize textarea for a comfortable typing area
  useEffect(() => {
    if (msgInputRef.current) {
      msgInputRef.current.style.height = "auto";
      msgInputRef.current.style.height = Math.min(msgInputRef.current.scrollHeight, 300) + "px";
    }
  }, [msgInput]);

  // Keyboard shortcut: Ctrl/Cmd + Enter to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // ---- Initial group load ----
  useEffect(() => {
    loadGroups();
  }, []);

  // ---- Auto scroll ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Responsive message height ----
  useEffect(() => {
    const updateHeight = () => {
      try {
        const inputH = inputAreaRef.current?.offsetHeight || 0;
        const h = window.innerHeight - inputH - 16;
        setMessagesMaxHeight(h > 200 ? `${h}px` : "200px");
      } catch {
        setMessagesMaxHeight("auto");
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [selectedGroup]);

  // ---- Socket setup (only for members) ----
  useEffect(() => {
    const member = selectedGroup && groupMembers.some((m) => m.userId === currentUserId);
    if (!selectedGroup || !currentUserId || !member) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current = socket;
    socket.emit("joinGroup", selectedGroup._id);

    socket.on("receiveGroupMessage", (msg) => {
      if (String(msg.groupId) !== String(selectedGroup._id)) return;
      setMessages((prev) =>
        prev.some((m) => String(m._id) === String(msg._id))
          ? prev
          : [...prev, msg]
      );
    });

    return () => {
      try {
        socket.emit("leaveGroup", selectedGroup._id);
      } catch {}
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedGroup, currentUserId, groupMembers]);

  // ---- Load members on group select and only load messages for members ----
  useEffect(() => {
    if (!selectedGroup) return;
    (async () => {
      setMessages([]);
      const members = await loadGroupMembers();
      const member = members.some((m) => m.userId === currentUserId);
      if (member) {
        await loadMessages();
      } else {
        // Ensure messages are cleared for non-members
        setMessages([]);
      }
    })();
  }, [selectedGroup]);

  // ---- Polling fallback ----
  useEffect(() => {
    if (!selectedGroup) return;
    let mounted = true;
    const id = setInterval(async () => {
      const active = document.activeElement;
      if (inputAreaRef.current?.contains(active)) return;
      if (!mounted) return;
      await loadMessages();
    }, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selectedGroup]);

  // ---- API helpers ----
  const loadGroups = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.COMMUNITY.GET_GROUPS, {
        credentials: "include",
      });
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch {
      setGroups([]);
      return [];
    }
  };

  const loadMessages = async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(
        API_ENDPOINTS.COMMUNITY.GET_GROUP_MESSAGES(selectedGroup._id),
        { credentials: "include" }
      );
      const data = await res.json();
      setMessages(data.messages || data || []);
    } catch {
      setMessages([]);
    }
  };

  const loadGroupMembers = async () => {
    if (!selectedGroup) return [];
    try {
      const res = await fetch(
        API_ENDPOINTS.COMMUNITY.GET_GROUP_MEMBERS(selectedGroup._id),
        { credentials: "include" }
      );
      const data = res.ok ? await res.json() : [];
      setGroupMembers(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch {
      setGroupMembers([]);
      return [];
    }
  };

  // ---- Membership helpers ----
  const ensureUserId = () => {
    if (currentUserId) return currentUserId;
    const id = `u_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("sno_user_id", id);
    setCurrentUserId(id);
    return id;
  };

  // ---- Group actions ----
  const joinGroup = async (groupId) => {
    const uid = ensureUserId();
    let inviteCode = null;

    const group = groups.find((g) => g._id === groupId);
    if (group?.isPrivate) {
      inviteCode = window.prompt("Enter invite code:");
      if (!inviteCode) return;
    }

    const res = await fetch(API_ENDPOINTS.COMMUNITY.JOIN_GROUP(groupId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: uid, nickname, inviteCode }),
    });

    if (res.ok) {
      const updated = await loadGroups();
      await loadGroupMembers();
      const g = updated.find((x) => x._id === groupId);
      if (g) setSelectedGroup(g);
    } else {
      alert("Failed to join group");
    }
  };

  const leaveGroup = async (groupId) => {
    await fetch(API_ENDPOINTS.COMMUNITY.LEAVE_GROUP(groupId), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: currentUserId }),
    });
    setSelectedGroup(null);
    loadGroups();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !selectedGroup) return;

    const uid = ensureUserId();
    setLoading(true);

    try {
      // Prefer socket when available to get real-time broadcast via server socket
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("sendGroupMessage", {
          groupId: selectedGroup._id || selectedGroup.id,
          senderId: uid,
          senderNickname: nickname,
          message: msgInput,
        });
        // optimistic clear; server will broadcast message back
        setMsgInput("");
        return;
      }

      // Fallback to HTTP POST if sockets unavailable
      const res = await fetch(
        API_ENDPOINTS.COMMUNITY.POST_GROUP_MESSAGE(selectedGroup._id),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            senderId: uid,
            senderNickname: nickname,
            message: msgInput,
          }),
        }
      );
      if (res.ok) {
        setMsgInput("");
        await loadMessages();
      } else {
        alert("Failed to send message");
      }
    } finally {
      setLoading(false);
    }
  };

  const isMember =
    selectedGroup &&
    groupMembers.some((m) => m.userId === currentUserId);

  // ---- JSX ----
  return (
    <div className="community-page">
      {/* Sidebar: Groups */}
      {/* Sidebar: Groups (toggleable via hamburger) */}
      <aside className="community-sidebar" style={{ display: menuOpen ? 'flex' : 'none' }}>
        <div className="sidebar-header">
          <h2>Communities</h2>
          <button
            className="create-btn"
            title="Create group"
            onClick={() => setShowCreateModal(true)}
          >
            +
          </button>
        </div>

        <div className="groups-list">
          {groups.length === 0 ? (
            <div style={{ padding: 16, color: '#777' }}>No groups found.</div>
          ) : (
            groups.map((g) => {
              const gid = g._id || g.id;
              const active = selectedGroup && (String(selectedGroup._id || selectedGroup.id) === String(gid));
              return (
                <div
                  key={gid}
                  className={`group-item ${active ? 'active' : ''}`}
                  onClick={() => { setSelectedGroup(g); setMenuOpen(false); }}
                >
                  <div className="group-info">
                    <h4>{g.name}</h4>
                    <p>{g.description || `${g.memberCount || (g.members && g.members.length) || 0} members`}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="community-main">
        {!selectedGroup ? (
          <div className="no-selection">
            <div>
              <h3>Select a group to join the conversation</h3>
              <p>Join a group or create a new one to start talking with others.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-header-comm">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => navigate('/dashboard')} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label="Back to Dashboard">← Back</button>
                <div className="header-info">
                  <h3>{selectedGroup.name}</h3>
                  <p>{selectedGroup.description || ''}</p>
                </div>
              </div>

              <div className="header-actions">
                {isMember ? (
                  <button
                    className="leave-btn"
                    style={{ background: '#e74c3c' }}
                    onClick={() => leaveGroup(selectedGroup._id || selectedGroup.id)}
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    className="join-btn"
                    style={{ color: '#000', background: 'transparent', border: '1px solid #333' }}
                    onClick={() => joinGroup(selectedGroup._id || selectedGroup.id)}
                  >
                    Join
                  </button>
                )}
              </div>
            </div>

            {isMember ? (
              <>
                <div
                  className="messages-container"
                  style={{ maxHeight: messagesMaxHeight, minHeight: 200 }}
                >
                  {messages.length === 0 ? (
                    <div style={{ padding: 16, color: '#777' }}>No messages yet.</div>
                  ) : (
                    messages.map((m) => {
                      const mid = m._id || m.id;
                      const own = String(m.senderId) === String(currentUserId);
                      return (
                        <div key={mid} className={`message-item ${own ? 'own' : ''}`}>
                          <div className="msg-bubble">
                            <div className="msg-sender">{m.senderNickname || m.senderId}</div>
                            <div className="msg-text">{m.message || m.text}</div>
                            <div className="edited">
                              {m.isEdited ? 'edited' : ''}
                              <span style={{ fontSize: 11, color: '#999', marginLeft: 6 }}>
                                {new Date(m.createdAt || m.date || Date.now()).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="msg-input-area" ref={inputAreaRef}>
                  <div className="nickname-display">You are: <strong>{nickname}</strong></div>
                  <form onSubmit={sendMessage}>
                    <textarea
                      ref={msgInputRef}
                      className="msg-input"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isMember ? 'Write a message (press Ctrl+Enter to send)' : 'Join the group to send messages.'}
                      disabled={!isMember || loading}
                    />
                    <button className="msg-send" type="submit" disabled={loading || !isMember} aria-label="Send message">
                      {loading ? '...' : '➤'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ padding: 20 }}>
                <p style={{ margin: 0, color: '#555' }}>
                  You are not a member of this group. Join the group to view the chat and participate.
                </p>
                <div style={{ marginTop: 12 }}>
                  <button
                    className="join-btn"
                    style={{ color: '#000', background: 'transparent', border: '1px solid #333' }}
                    onClick={() => joinGroup(selectedGroup._id || selectedGroup.id)}
                  >
                    Join
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Group</h3>
            <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group name" />
            <textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Description" />
            <label style={{ display: 'block', marginBottom: 12 }}>
              <input type="checkbox" checked={groupIsPrivate} onChange={(e) => setGroupIsPrivate(e.target.checked)} /> Private
            </label>
            <div className="modal-buttons">
              <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  const createdBy = ensureUserId();
                  try {
                    const res = await fetch(API_ENDPOINTS.COMMUNITY.CREATE_GROUP, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ name: groupName, description: groupDesc, createdBy, isPrivate: groupIsPrivate }),
                    });
                    if (res.ok) {
                      const g = await res.json();
                      setShowCreateModal(false);
                      setGroupName('');
                      setGroupDesc('');
                      const updated = await loadGroups();
                      const newGroup = (Array.isArray(updated) ? updated : []).find((x) => (x._id || x.id) === (g._id || g.id));
                      if (newGroup) setSelectedGroup(newGroup);
                    } else {
                      const err = await res.json();
                      alert(err.error || 'Failed to create group');
                    }
                  } catch (e) {
                    alert('Failed to create group');
                  }
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Violation Popup */}
      {showViolationPopup && (
        <div className="violation-modal" onClick={() => { setShowViolationPopup(false); localStorage.setItem('communityPolicyAccepted','1'); }}>
          <div className="violation-content" onClick={(e) => e.stopPropagation()}>
            <h2>Community Guidelines</h2>
            <p>Please be kind and follow the community rules before posting.</p>
            <button onClick={() => { setShowViolationPopup(false); localStorage.setItem('communityPolicyAccepted','1'); }}>I Agree</button>
          </div>
        </div>
      )}

    </div>
  );
}
