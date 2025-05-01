import { useParams } from 'react-router'; // Correct import for react-router version 7+

export default function UserProfile() {
  const { id } = useParams();

  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {id}</p>
    </div>
  );
}