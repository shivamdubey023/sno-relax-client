// src/pages/CommunityPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { API_ENDPOINTS, SOCKET_URL } from "../config/api.config";
import { io } from "socket.io-client";
import { useNavigate } from 'react-router-dom';
import { Users, Plus, X, MessageCircle, Send, LogOut, LogIn, Hash } from "lucide-react";
import "../styles/Community.css";

export default function CommunityPage() {
  const storedUserId =
    localStorage.getItem("userId") ||
    localStorage.getItem("sno_userId") ||
    localStorage.getItem("sno_user_id") ||
    null;

  const [currentUserId, setCurrentUserId] = useState(storedUserId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(false);
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
  const messagesEndRef = useRef(null);
  const inputAreaRef = useRef(null);
  const msgInputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (msgInputRef.current) {
      msgInputRef.current.style.height = "auto";
      msgInputRef.current.style.height = Math.min(msgInputRef.current.scrollHeight, 300) + "px";
    }
  }, [msgInput]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedGroup) return;
    (async () => {
      setMessages([]);
      const members = await loadGroupMembers();
      const member = members.some((m) => m.userId === currentUserId);
      if (member) {
        await loadMessages();
      } else {
        setMessages([]);
      }
    })();
  }, [selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;
    let mounted = true;
    const id = setInterval(async () => {
      const active = document.activeElement;
      if (inputAreaRef.current?.contains(active)) return;
      if (!mounted) return;
      await loadMessages();
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selectedGroup]);

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

  const ensureUserId = () => {
    if (currentUserId) return currentUserId;
    const id = `u_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("sno_user_id", id);
    setCurrentUserId(id);
    return id;
  };

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

  const isMember = selectedGroup && groupMembers.some((m) => m.userId === currentUserId);

  return (
    <div className="community-page">
      {/* Mobile topbar */}
      <div className="community-topbar">
        <button className="hamburger" onClick={() => setMenuOpen((s) => !s)}>
          {menuOpen ? <X size={24} /> : <Hash size={24} />}
        </button>
        <span className="topbar-title">Community</span>
      </div>

      {/* Sidebar */}
      <aside className={`community-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2><Users size={20} /> Communities</h2>
          <div className="sidebar-actions">
            <button className="create-btn" onClick={() => setShowCreateModal(true)} title="Create group">
              <Plus size={20} />
            </button>
            <button className="close-sidebar" onClick={() => setMenuOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="groups-list">
          {groups.length === 0 ? (
            <div className="empty-groups">
              <Hash size={40} />
              <p>No groups yet</p>
              <span>Create one to get started</span>
            </div>
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
                    <h4><Hash size={14} /> {g.name}</h4>
                    <p>{g.description || `${g.memberCount || 0} members`}</p>
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
            <MessageCircle size={80} />
            <h3>Welcome to Community</h3>
            <p>Select a group to join the conversation</p>
          </div>
        ) : (
          <>
            <div className="chat-header-comm">
              <div className="chat-info">
                <h3><Hash size={18} /> {selectedGroup.name}</h3>
                <p>{selectedGroup.description}</p>
              </div>
              <div className="header-actions">
                {isMember ? (
                  <button className="leave-btn" onClick={() => leaveGroup(selectedGroup._id || selectedGroup.id)}>
                    <LogOut size={16} /> Leave
                  </button>
                ) : (
                  <button className="join-btn" onClick={() => joinGroup(selectedGroup._id || selectedGroup.id)}>
                    <LogIn size={16} /> Join
                  </button>
                )}
              </div>
            </div>

            {isMember ? (
              <>
                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="empty-messages">
                      <MessageCircle size={40} />
                      <p>No messages yet</p>
                      <span>Be the first to say hello!</span>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mid = m._id || m.id;
                      const own = String(m.senderId) === String(currentUserId);
                      return (
                        <div key={mid} className={`message-item ${own ? 'own' : ''}`}>
                          <div className="msg-bubble">
                            <div className="msg-sender">{m.senderNickname || 'Anonymous'}</div>
                            <div className="msg-text">{m.message || m.text}</div>
                            <div className="msg-meta">
                              {m.isEdited && <span className="edited">edited</span>}
                              <span className="msg-timestamp">
                                {new Date(m.createdAt || m.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="msg-input-area">
                  <div className="nickname-display">
                    Posting as: <strong>{nickname}</strong>
                  </div>
                  <form onSubmit={sendMessage}>
                    <textarea
                      ref={msgInputRef}
                      className="msg-input"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Write a message (Ctrl+Enter to send)"
                      disabled={!isMember || loading}
                    />
                    <button className="msg-send" type="submit" disabled={loading || !isMember || !msgInput.trim()}>
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="join-prompt">
                <MessageCircle size={60} />
                <h3>Join this Community</h3>
                <p>Join the group to view messages and participate in the conversation.</p>
                <button className="join-btn large" onClick={() => joinGroup(selectedGroup._id || selectedGroup.id)}>
                  <LogIn size={20} /> Join Group
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Community</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <input 
              value={groupName} 
              onChange={(e) => setGroupName(e.target.value)} 
              placeholder="Community name"
            />
            <textarea 
              value={groupDesc} 
              onChange={(e) => setGroupDesc(e.target.value)} 
              placeholder="Description (optional)"
            />
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={groupIsPrivate} 
                onChange={(e) => setGroupIsPrivate(e.target.checked)} 
              />
              <span>Private community (requires invite code)</span>
            </label>
            <div className="modal-buttons">
              <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button
                type="button"
                className="btn-primary"
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
            <p>Please be kind, respectful, and follow these guidelines:</p>
            <ul>
              <li>Be supportive and encouraging</li>
              <li>Respect privacy and confidentiality</li>
              <li>No harassment or bullying</li>
              <li>Report inappropriate behavior</li>
            </ul>
            <button>I Understand & Agree</button>
          </div>
        </div>
      )}
    </div>
  );
}
