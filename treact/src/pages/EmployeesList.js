import React, { useState } from "react";
import DataTable from "react-data-table-component";
import tw from "twin.macro";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Features from "components/features/ThreeColSimple.js";
import MainFeature2 from "components/features/TwoColSingleFeatureWithStats2.js";
import Testimonial from "components/testimonials/ThreeColumnWithProfileImage.js";
import DownloadApp from "components/cta/DownloadApp.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import Header from "components/headers/light.js";

const employeesData = [
  { id: 1, name: "John Doe", role: "Ingénieur Logiciel", email: "john@example.com" },
  { id: 2, name: "Jane Smith", role: "Chef de Projet", email: "jane@example.com" },
  { id: 3, name: "Michael Brown", role: "Designer UX", email: "michael@example.com" },
];

export default function EmployeesList() {
  const [search, setSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(employeesData);

  const columns = [
    { name: "ID", selector: row => row.id, sortable: true },
    { name: "Nom", selector: row => row.name, sortable: true },
    { name: "Rôle", selector: row => row.role, sortable: true },
    { name: "Email", selector: row => row.email, sortable: true },
  ];

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearch(searchTerm);
    const filtered = employeesData.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm) ||
      employee.role.toLowerCase().includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  };

  return (
    <AnimationRevealPage>
      <Header />
      <div tw="p-8 flex justify-center">
        <div tw="w-full max-w-lg mx-auto">
          <h2 tw="text-2xl font-semibold mb-4">Liste des Employés</h2>
          
          <div tw="w-full overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredEmployees}
              pagination
              highlightOnHover
            />
          </div>
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={search}
            onChange={handleSearch}
            tw="mb-4 p-2 border rounded w-full"
          />
        </div>
      </div>
      <Features
        heading={<><span tw="bg-primary-500 text-gray-100 px-4 transform -skew-x-12 inline-block">Service impréssionnant.</span></>}
      />
      <MainFeature2 heading={<><span tw="bg-primary-500 text-gray-100 px-4 transform -skew-x-12 inline-block">Pourquoi nous choisir ?</span></>} />
      <Testimonial heading={<><span tw="bg-primary-500 text-gray-100 px-4 transform -skew-x-12 inline-block">Nos clients nous adorent.</span></>} />
      <DownloadApp text={<>Les personnes autour de vous commandent de délicieux repas avec l'<span tw="bg-gray-100 text-primary-500 px-4 transform -skew-x-12 inline-block">application Treact.</span></>} />
      <Footer />
    </AnimationRevealPage>
  );
}
