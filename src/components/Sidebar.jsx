// src/components/Sidebar.jsx
import React from "react";
import GroupList from "./GroupList";
import UserList from "./UserList";

/**
 * Sidebar
 * --------------------------------------------------
 * This component acts as a navigation and selection
 * panel for:
 *  - Community Groups
 *  - Private Chat Users (Friends)
 *
 * It does NOT manage any state by itself.
 * All selections are delegated upward via callbacks.
 *
 * Props:
 *  - onSelectGroup(group): called when a group is selected
 *  - onSelectUser(user): called when a user is selected
 *
 * Design Notes:
 *  - Keeps Sidebar "dumb" and reusable
 *  - Allows future expansion (search, filters, tabs)
 *  - Parent component decides what happens on selection
 *
 * Future Enhancements (no breaking changes):
 *  - Add collapsible sections (Groups / Friends)
 *  - Add unread count badges
 *  - Add search input for groups/users
 *  - Add loading / empty states
 */
export default function Sidebar({ onSelectGroup, onSelectUser }) {
  return (
    <aside className="sidebar">
      {/* Community Groups Section */}
      <section className="sidebar-section">
        <h3 className="sidebar-title">Groups</h3>

        {/* 
          GroupList handles:
          - fetching groups
          - join / leave logic
          - selection UI
        */}
        <GroupList onSelectGroup={onSelectGroup} />
      </section>

      {/* Friends / Users Section */}
      <section className="sidebar-section">
        <h3 className="sidebar-title">Friends</h3>

        {/*
          UserList handles:
          - fetching users
          - excluding current user
          - selection for private chat
        */}
        <UserList onSelectUser={onSelectUser} />
      </section>
    </aside>
  );
}
