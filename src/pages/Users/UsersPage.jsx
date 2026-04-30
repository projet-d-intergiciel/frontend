// src/pages/Users/UsersPage.jsx
const UsersPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">👥 Gestion des Utilisateurs</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Page réservée aux administrateurs.</p>
        <p className="text-gray-500 text-sm mt-2">
          Ici tu pourras gérer les utilisateurs, leurs rôles et permissions.
        </p>
      </div>
    </div>
  );
};

export default UsersPage;