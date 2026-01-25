// src/components/UserList.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * UserList
 * --------------------------------------------------
 * Simple presentational component to display a list
 * of users.
 *
 * Props:
 *  - users: Array of user objects
 *      {
 *        id: string,
 *        name: string,
 *        email: string
 *      }
 *
 * Responsibilities:
 *  - Render user list UI only
 *  - Does NOT fetch data
 *  - Does NOT manage state
 *
 * Design Notes:
 *  - Safe default value for users
 *  - Clear separation between data and UI
 *
 * Future Enhancements (non-breaking):
 *  - Click handler for selecting a user
 *  - Avatar support
 *  - Search / filter support
 *  - Empty / loading state UI
 */
const UserList = ({ users = [] }) => {
  return (
    <div className="user-list">
      <h2>User List</h2>

      {users.length === 0 ? (
        <p style={{ color: "#666", fontSize: 14 }}>
          No users available.
        </p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <strong>{user.name}</strong>{" "}
              <span style={{ color: "#666" }}>
                ({user.email})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Runtime prop validation
 * Helps catch incorrect data shapes during development
 */
UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    })
  ),
};

export default UserList;
