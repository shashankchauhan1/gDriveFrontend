// client/src/components/SharedWithMe.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL;

function SharedWithMe() {
  const [sharedItems, setSharedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/files/shared-with-me`, {
          headers: { 'x-auth-token': token },
        });
        setSharedItems(response.data);
      } catch (error) {
        console.error('Error fetching shared items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedItems();
  }, []);

  if (loading) {
    return <p>Loading shared files...</p>;
  }

  return (
    <div>
      <h2>Shared with me</h2>
      {sharedItems.length === 0 ? (
        <p>No files have been shared with you yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Shared by</th>
              <th>Date Shared</th>
            </tr>
          </thead>
          <tbody>
            {sharedItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <a href={item.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
                    {item.type === 'folder' ? '📁' : '📄'} {item.filename}
                  </a>
                </td>
                <td>{item.owner.email}</td>
                <td>{format(new Date(item.updatedAt), 'PPpp')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SharedWithMe;