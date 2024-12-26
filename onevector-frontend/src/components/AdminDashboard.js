import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { tableRowVariant, buttonVariant, modalVariant } from './animations';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';
import oneVectorImage from './images/onevector.png'; 
import MagicLinkHistoryPopup from './MagicLinkHistoryPopup';
import * as XLSX from 'xlsx'; 
import { DownloadIcon, SunIcon, MoonIcon } from '@heroicons/react/solid';
import { useTheme } from "../ThemeContext"; // Ensure correct import path

function AdminDashboard() {
  const [details, setDetails] = useState(null);
  const [email, setEmail] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [sentEmails, setSentEmails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleChangeModalOpen, setIsRoleChangeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [showMagicLinkPopup, setShowMagicLinkPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [magicLinks, setMagicLinks] = useState([]);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleDownloadDetails = async () => {
    try {
      const response = await axios.get('https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates'); // Fetch candidates
  
      if (response.data.length === 0) {
        alert('No candidate details available to download.');
        return;
      }
  
      // Create an array to hold all candidate details
      const candidatesWithDetails = await Promise.all(response.data.map(async (candidate) => {
        // Fetch personal details for each candidate
        const personalDetailsResponse = await axios.get(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/personalDetails/${candidate.id}`);
        const personalDetails = personalDetailsResponse.data;
  
        // Combine candidate and personal details
        return {
          FirstName: personalDetails.personalDetails.first_name || 'N/A',
          LastName: personalDetails.personalDetails.last_name || 'N/A',
          Email: candidate.email || 'N/A',
          Role: candidate.role || 'N/A',
          Username: candidate.username || 'N/A',
          Phone: personalDetails.personalDetails.phone_no || 'N/A',
          Address: `${personalDetails.personalDetails.address_line1 || ''}, ${personalDetails.personalDetails.address_line2 || ''}`,
          City: personalDetails.personalDetails.city || 'N/A',
          State: personalDetails.personalDetails.state || 'N/A',
          Country: personalDetails.personalDetails.country || 'N/A',
          PostalCode: personalDetails.personalDetails.postal_code || 'N/A',
          LinkedIn: personalDetails.personalDetails.linkedin_url || 'N/A',
          ResumePath: personalDetails.personalDetails.resume_path || 'N/A',
          RecentJob: personalDetails.qualifications[0]?.recent_job || 'N/A',
          PreferredRoles: personalDetails.qualifications[0]?.preferred_roles || 'N/A',
          Availability: personalDetails.qualifications[0]?.availability || 'N/A',
          WorkPermitStatus: personalDetails.qualifications[0]?.work_permit_status || 'N/A',
          PreferredRoleType: personalDetails.qualifications[0]?.preferred_role_type || 'N/A',
          PreferredWorkArrangement: personalDetails.qualifications[0]?.preferred_work_arrangement || 'N/A',
          Compensation: personalDetails.qualifications[0]?.compensation || 'N/A',
          Skills: personalDetails.skills.join(', ') || 'N/A',
          Certifications: personalDetails.certifications.join(', ') || 'N/A',
        };
      }));
  
      // Generate an Excel worksheet
      const worksheet = XLSX.utils.json_to_sheet(candidatesWithDetails);
  
      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
  
      // Trigger download of the Excel file
      XLSX.writeFile(workbook, 'Candidate_Details.xlsx');
    } catch (error) {
      console.error('Error downloading candidate details:', error);
      alert(`Failed to download candidate details: ${error.message}`);
    }
  };
      
        useEffect(() => {
          const fetchCandidates = async () => {
            setLoading(true);
            setError('');
            try {
              const response = await axios.get('https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates');
              const filteredCandidates = response.data
                .filter((candidate) => candidate.role !== 'admin')
                .sort((a, b) => (a.role === 'power_user' ? -1 : 1));
      
              setCandidates(filteredCandidates);
            } catch (error) {
              setError('Failed to fetch candidates');
            } finally {
              setLoading(false);
            }
          };
          fetchCandidates();
        }, []);
      
        const fetchMagicLinks = async () => {
          try {
            const response = await axios.get('https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/magic-links');
            setMagicLinks(response.data);
            setShowHistoryPopup(true);
          } catch (error) {
            alert('Failed to fetch magic links');
            console.error('Fetch error:', error);
          }
        };
      
        const handleDelete = async (id) => {
          if (window.confirm('Are you sure you want to delete this candidate and all their associated data?')) {
            try {
              console.log(`Attempting to delete candidate with ID: ${id}`);
              const response = await axios.delete(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates/${id}`);
              console.log('Delete response:', response);
              
              // Update candidates list after successful deletion
              setCandidates(candidates.filter((candidate) => candidate.id !== id));
              
              // Show success message
              setSuccessMessageText('Candidate deleted successfully!');
              setShowSuccessMessage(true);
              setTimeout(() => setShowSuccessMessage(false), 3000);
            } catch (error) {
              console.error('Error deleting candidate:', error);
              alert('Failed to delete candidate');
            }
          }
        };
      
        const toggleRole = (candidate) => {
          setSelectedCandidate(candidate);
          setIsRoleChangeModalOpen(true);
        };
      
        const sendMagicLink = async () => {
          if (!email) {
            alert('Please enter a valid email.');
            return;
          }
        
          try {
            // Send magic link to the email
            await axios.post('https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/send-magic-link', { email });
        
            // Save email to localStorage after sending the magic link
            localStorage.setItem('magicLinkEmail', email);
        
            // Add the sent email to history (if needed)
            setSentEmails([...sentEmails, email]);
        
            // Clear email field after sending the link
            setEmail('');
        
            // Set success message and show it
            setSuccessMessageText('Magic Link sent successfully!');
            setShowSuccessMessage(true);
        
            // Close the form modal
            setShowForm(false);
        
            // Auto-hide the success message after 3 seconds
            setTimeout(() => setShowSuccessMessage(false), 3000);
          } catch (error) {
            alert('Failed to send magic link');
          }
        };
        
        const filteredCandidates = candidates.filter((candidate) =>
          candidate.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
        const handleLogout = () => {
          localStorage.removeItem('token');
          navigate('/');
        };
      
        const handleShowDetails = (candidate) => {
          navigate('/candidate-details', { state: { candidate } });
        };
      
        const isActive = (path) => location.pathname === path;
      
        const handleHistoryClick = () => {
          setHistoryModalOpen(true);
        };
      
        const closeHistoryModal = () => {
          setHistoryModalOpen(false);
        };
      
        const confirmRoleChange = async (newRole) => {
          if (!selectedCandidate) return;
      
          try {
            await axios.put(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates/${selectedCandidate.id}/role`, { role: newRole });
      
            const updatedCandidates = candidates.map((candidate) =>
              candidate.id === selectedCandidate.id ? { ...candidate, role: newRole } : candidate
            );
            setCandidates(updatedCandidates);
      
            const action = newRole === 'power_user' ? 'Promoted' : 'Demoted';
            setSuccessMessageText(`${action} successfully!`);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            setIsRoleChangeModalOpen(false);
          } catch {
            alert(`Failed to update role to ${newRole}`);
          }
        };
      
        const confirmDelete = async () => {
          if (!selectedCandidate) return;
      
          try {
            await axios.delete(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates/${selectedCandidate.id}`);
            setCandidates(candidates.filter((candidate) => candidate.id !== selectedCandidate.id));
            setSuccessMessageText('Candidate deleted successfully!');
            setShowSuccessMessage(true);
            setIsDeleteModalOpen(false);
            setTimeout(() => setShowSuccessMessage(false), 3000);
          } catch {
            alert('Failed to delete candidate');
          }
        };
      
        return (
          <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} font-sans`}>
            {showMagicLinkPopup && (
              <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-20">
                <div className={`p-4 rounded-lg shadow-lg w-96 ${isDarkMode ? 'bg-green-700' : 'bg-green-500'} text-white`}>
                  <p className="text-center font-semibold">Magic Link sent successfully!</p>
                </div>
              </div>
            )}
        
            {showSuccessMessage && (
              <div className={`p-4 fixed top-0 left-0 right-0 text-center z-20 ${isDarkMode ? 'bg-green-700' : 'bg-green-500'} text-white`}>
                {successMessageText}
              </div>
            )}
        
            <header className={`fixed top-0 left-0 right-0 z-10 shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-3">
                  <img src={oneVectorImage} alt="OneVector Logo" className="w-[30px] h-[40px]" />
                  <h1 className={`text-2xl font-normal tracking-wide ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    TalentHub
                  </h1>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    {isDarkMode ? (
                      <SunIcon className="w-4 h-4 md:w-7 md:h-7 text-gray-100" />
                    ) : (
                      <MoonIcon className="w-4 h-4 md:w-7 md:h-7 text-gray-800" />
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${isDarkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-400'} text-white`}
                  >
                    <FaSignOutAlt size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </header>
        
            <main className="pt-20 px-4 lg:px-16">
              <div className="flex flex-wrap justify-between items-center mb-4 mt-8">
                <input
                  type="text"
                  placeholder="Search by username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`border p-2 rounded-lg w-full md:w-1/2 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-black'}`}
                />
                <div className="flex items-center space-x-4 mt-4 md:mt-0 w-full md:w-auto md:justify-end">
                  <button
                    onClick={handleDownloadDetails}
                    className={`px-4 py-2.5 text-white font-medium rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-r from-[#094DA2] to-[#15abcd]' : 'bg-gradient-to-r from-[#15ABCD] to-[#094DA2]'} hover:opacity-90`}
                  >
                    <DownloadIcon className="h-5 w-5 mr-2"              />
              Export Details
            </button>
            <button
              onClick={() => setShowForm(true)}
              className={`px-4 py-2 rounded-lg text-white flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-r from-[#094DA2] to-[#15abcd]' : 'bg-gradient-to-r from-[#15ABCD] to-[#094DA2]'} hover:opacity-90`}
            >
              <span className="mr-2 text-lg font-bold">+</span>
              Add User
            </button>
            <FaHistory
              size={20}
              className={`cursor-pointer ${isDarkMode ? 'text-gray-100' : 'text-black'}`}
              onClick={fetchMagicLinks}
            />
            {showHistoryPopup && (
              <MagicLinkHistoryPopup
                magicLinks={magicLinks}
                onClose={() => setShowHistoryPopup(false)}
              />
            )}
          </div>
        </div>
  
        {showForm && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-20">
            <div className={`p-8 rounded-lg shadow-xl w-96 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-black'}`}>
              <h3 className="text-2xl font-semibold mb-4">Add a New User</h3>
              <div className="flex flex-col space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`border p-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100 focus:ring-gray-500' : 'border-gray-300 focus:ring-black'}`}
                />
                <button
                  onClick={sendMagicLink}
                  className={`px-6 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gradient-to-r from-[#094DA2] to-[#15abcd] text-gray-100 focus:ring-[#15abcd]' : 'bg-gradient-to-r from-[#15ABCD] to-[#094DA2] text-white focus:ring-[#094DA2]'} hover:opacity-90`}
                >
                  Send Magic Link
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className={`px-6 py-3 rounded-lg ${isDarkMode ? 'bg-gray-600 text-gray-100 hover:bg-gray-700' : 'bg-gray-300 text-black hover:bg-gray-400'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
  
        <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mt-8`}>
          {loading ? (
            <p className="text-black dark:text-white">Loading...</p>
          ) : filteredCandidates.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-[3px] border-[#F0F4F8] dark:border-gray-700 text-left">
                <thead className="bg-[#F7FAFC] dark:bg-gray-700 text-black dark:text-white">
                  <tr>
                    <th className="py-4 px-6 border-b-[3px] border-[#E5E9EF] dark:border-gray-600">TITLE</th>
                    <th className="py-4 px-6 border-b-[3px] border-[#E5E9EF] dark:border-gray-600">EMAIL</th>
                    <th className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF] dark:border-gray-600">ROLE</th>
                    <th className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF] dark:border-gray-600">USERNAME</th>
                    <th className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF] dark:border-gray-600">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td className="py-4 px-6 border-b-[3px] border-[#E5E9EF] dark:border-gray-600">
                      <div className="flex items-center">
                          <span className="text-black dark:text-white font-medium">
                            {candidate.first_name && candidate.last_name
                              ? `${candidate.first_name} ${candidate.last_name}`
                              : candidate.first_name || candidate.last_name || "N/A"}
                          </span>
                          {candidate.role === "power_user" && (
                            <FontAwesomeIcon
                              icon={faCrown}
                              className="ml-2 text-yellow-500"
                              title="Power User"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b-[3px] border-[#E5E9EF] dark:border-gray-600 text-black dark:text-white">{candidate.email}</td>
                      <td className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF] dark:border-gray-600 text-black dark:text-white">
                        {candidate.role === "power_user" ? "Power User" : "User "}
                      </td>
                      <td className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF] dark:border-gray-600">
                        <span
                          className="font-medium"
                          style={{
                            backgroundImage: 'linear-gradient(to right, #15abcd, #094DA2)',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                          }}
                        >
                          {candidate.username}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF] dark:border-gray-600">
                        <div className="flex justify-center items-center gap-4">
                          <button
                            onClick={() => toggleRole(candidate)}
                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-black dark:border-gray-500 text-black dark:text-white rounded-lg hover:bg-gradient-to-r hover:from-[#15ABCD] hover:to-[#094DA2] hover:text-white hover:border-0"
                          >
                            {candidate.role === "power_user" ? "Demote" : "Promote"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setIsDeleteModalOpen(true);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleShowDetails(candidate)}
                            className="px-4 py-2 bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-600"
                          >
                            Show Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-4 text-center text-black dark:text-white">No candidates found.</p>
          )}
        </div>

        {/* History Modal */}
        {historyModalOpen && (
          <motion.div
            variants={modalVariant}
            initial="hidden"
            animate="visible"
            className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-20"
          >
            <motion.div
              variants={modalVariant}
              className="bg-white p-6 rounded-lg shadow-lg w-96"
            >
              <h3 className="text-lg font-semibold text-black mb-4">History</h3>
              <div className="overflow-y-auto max-h-64 space-y-2">
                {sentEmails.length > 0 ? (
                  sentEmails.map((email, index) => (
                    <div
                      key={index}
                      className="border border-black p-2 rounded-lg bg-gray-50"
                    >
                      <p className="text-black">{email}</p>
                      <p className="text-sm text-gray-600">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-black">No history available.</p>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <motion.button
                  variants={buttonVariant}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={closeHistoryModal}
                  className="px-4 py-2 bg-white border border-black text-black rounded-lg hover:bg-black hover:text-white"
                >
                  Close
                </motion.button>
                </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && selectedCandidate && (
          <motion.div
            variants={modalVariant}
            initial="hidden"
            animate="visible"
            className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              variants={modalVariant}
              className="bg-white p-6 rounded-lg shadow-lg w-96"
            >
              <h3 className="text-lg font-semibold text-black">Confirm Deletion</h3>
              <p className="my-4 text-black">
                Are you sure you want to delete {selectedCandidate.username}?
              </p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  variants={buttonVariant}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  variants={buttonVariant}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-gradient-to-r from-[#15ABCD] to-[#094DA2] text-white rounded-lg"
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Role Change Modal */}
        {isRoleChangeModalOpen && selectedCandidate && (
          <motion.div
            variants={modalVariant}
            initial="hidden"
            animate="visible"
            className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              variants={modalVariant}
              className="bg-white p-6 rounded-lg shadow-lg w-96"
            >
              <h3 className="text-lg font-semibold text-black">Confirm Role Change</h3>
              <p className="my-4 text-black">
                Are you sure you want to {selectedCandidate.role === 'power_user' ? 'demote' : 'promote'}{' '}
                {selectedCandidate.username}{' '}
                {selectedCandidate.role === 'power_user' && (
                  <FaCrown className="text-yellow-500 ml-2 inline-block" />
                )}
                ?
              </p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  variants={buttonVariant}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setIsRoleChangeModalOpen(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Cancel
                </motion.button>

                <motion.button
                  variants={buttonVariant}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() =>
                    confirmRoleChange(
                      selectedCandidate.role === 'power_user' ? 'user' : 'power_user'
                    )
                  }
                  className="px-4 py-2 bg-gradient-to-r from-[#15ABCD] to-[#094DA2] text-white rounded-lg"
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
