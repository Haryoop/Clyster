import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Features from "components/features/ThreeColSimple.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import Header from "components/headers/light.js";

const frenchLocalization = {
  pagination: {
    rowsPerPageText: 'Candidats par page:',
    rangeSeparatorText: 'sur',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Tous',
    noRowsPerPage: false,
  },
  noData: {
    text: 'Aucune donnée disponible'
  }
};

export default function EmployeesList() {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);

  // Fetch untested users from the backend
  useEffect(() => {
    const fetchUntestedUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/untested');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUntestedUsers();
  }, []);

  const handleSendTest = async (userId) => {
    setSendingTest(true);
    try {
      // Call the backend to generate questions and create form
      const response = await fetch(`http://localhost:5000/api/forms/generate/${userId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to generate test');
      }

      const result = await response.json();
      
      // Update the UI to show the user has been tested
      setEmployees(prevEmployees => 
        prevEmployees.map(employee => 
          employee._id === userId ? { ...employee, IsTested: true } : employee
        )
      );
      setFilteredEmployees(prev => 
        prev.map(employee => 
          employee._id === userId ? { ...employee, IsTested: true } : employee
        )
      );

      alert(`Test généré avec succès pour le candidat. ID du formulaire: ${result.form_id}`);
    } catch (error) {
      console.error('Error generating test:', error);
      alert('Erreur lors de la génération du test');
    } finally {
      setSendingTest(false);
    }
  };

  const columns = [
    { 
      name: "Nom", 
      selector: row => `${row.first_name} ${row.last_name}`, 
      sortable: true 
    },
    { 
      name: "Rôle", 
      selector: row => row.métier, 
      sortable: true 
    },
    { 
      name: "Email", 
      selector: row => row.email, 
      sortable: true 
    },
    { 
      name: "Date de naissance", 
      cell: row => {
        if (!row.birth_date) return 'N/A';
        try {
          const date = new Date(row.birth_date);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        } catch (e) {
          console.error('Invalid date format:', row.birth_date);
          return 'Date invalide';
        }
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = a.birth_date ? new Date(a.birth_date) : null;
        const dateB = b.birth_date ? new Date(b.birth_date) : null;
        return (dateA || 0) - (dateB || 0);
      }
    },
    {
      name: "Actions",
      cell: row => (
        <button
          onClick={() => handleSendTest(row._id)}
          disabled={sendingTest || row.IsTested}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: row.IsTested ? '#6b7280' : '#3b82f6', // gray if tested, blue otherwise
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: row.IsTested ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '120px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => !row.IsTested && (e.currentTarget.style.backgroundColor = '#2563eb')} // blue-600
          onMouseOut={(e) => !row.IsTested && (e.currentTarget.style.backgroundColor = '#3b82f6')} // blue-500
        >
          {sendingTest ? 'Envoi en cours...' : row.IsTested ? 'Test envoyé' : 'Envoyer test'}
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearch(searchTerm);
    const filtered = employees.filter(employee =>
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm) ||
      employee.métier.toLowerCase().includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  };

  return (
    <AnimationRevealPage>
      <Header />
      <Features
        heading={<><span tw="bg-primary-500 text-gray-100 px-4 transform -skew-x-12 inline-block">Liste des candidats à tester</span></>}
      />
      <div tw="p-8 flex justify-center">
        <div tw="w-full max-w-6xl mx-auto">
          <h2 tw="text-2xl font-semibold mb-4">Liste des Candidats Non Testés</h2>
          
          <div tw="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={search}
              onChange={handleSearch}
              tw="p-2 w-64"
              style={{ border: '2px solid #6b7280', borderRadius: '0.5rem' }}
            />
            <span tw="text-gray-600">
              {filteredEmployees.length} candidat(s) trouvé(s)
            </span>
          </div>

          {loading ? (
            <div tw="text-center py-8">Chargement en cours...</div>
          ) : (
            <div tw="w-full overflow-x-auto border rounded-lg">
              <DataTable
                columns={columns}
                data={filteredEmployees}
                pagination
                highlightOnHover
                striped
                noDataComponent={
                  <div tw="py-8 text-center text-gray-500">
                    Aucun candidat non testé trouvé
                  </div>
                }
                customStyles={{
                  headCells: {
                    style: {
                      fontWeight: 'bold',
                      fontSize: '1rem',
                    },
                  },
                }}
                paginationComponentOptions={frenchLocalization.pagination}
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20]}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </AnimationRevealPage>
  );
}