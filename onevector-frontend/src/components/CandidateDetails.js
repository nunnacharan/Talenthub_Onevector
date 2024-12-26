import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './CandidateDetails.css';
import { EyeIcon, DownloadIcon, HomeIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { FaSignOutAlt, FaTachometerAlt,FaBars, FaTimes } from 'react-icons/fa';
import oneVectorImage from './images/onevector.png';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useTheme } from "../ThemeContext"; // Ensure correct import path





function CandidateDetails() {
    const location = useLocation();
    const candidate = location.state?.candidate; // Get candidate data from the state
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [isEditing, setIsEditing] = useState({
        personal: false,
        qualifications: false,
        skills: false,
        certifications: false
    });
    const [formData, setFormData] = useState({
        personalDetails: {},
        qualifications: [],
        skills: [],
        username: '',
        certifications: []
    });
    const [resumeFile, setResumeFile] = useState(null); // For handling resume file upload
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();

  
      // Prepare the data for Excel export
      const handleDownloadDetails = () => {
        // Prepare data for row-by-row export
        const rowData = [
            // Header Row
            ['Candidate Details'],
            [], // Empty row for spacing
    
            // Personal Details Section
            ['Personal Details'],
            ['Username', candidate.username || 'N/A'],
            ['First Name', formData.personalDetails?.first_name || 'N/A'],
            ['Last Name', formData.personalDetails?.last_name || 'N/A'],
            ['Phone Number', formData.personalDetails?.phone_no || 'N/A'],
            ['City', formData.personalDetails?.city || 'N/A'],
            ['State', formData.personalDetails?.state || 'N/A'],
            ['Postal Code', formData.personalDetails?.postal_code || 'N/A'],
            ['Address', formData.personalDetails?.address_line1 || 'N/A'],
            ['LinkedIn URL', formData.personalDetails?.linkedin_url || 'N/A'],
            [], // Empty row for separation
    
            // Qualifications Section
            ['Qualifications'],
        ...formData.qualifications.flatMap((qual) => [
            ['Recent Job', qual.recent_job || 'N/A'],
            ['Preferred Roles', qual.preferred_roles || 'N/A'],
            ['Availability', qual.availability || 'N/A'],
            ['Compensation', qual.compensation || 'N/A'],
            ['Preferred Role Type', qual.preferred_role_type || 'N/A'],
            ['Preferred Work Arrangement', qual.preferred_work_arrangement || 'N/A'],
            [] // Empty row between qualification sets
        ]),
    
            // Skills Section
            ['Skills', formData.skills.join(', ') || 'N/A'],
            [], // Empty row for separation
    
            // Certifications Section
            
            ['Certifications', formData.certifications.join(', ') || 'N/A']
        ];
    
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(rowData);
    
        // Style for header rows
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } }
        };
    
        // Apply styling to section headers
        ['A1', 'A3', 'A12', 'A24', 'A26'].forEach(cell => {
            if (worksheet[cell]) {
                worksheet[cell].s = headerStyle;
            }
        });
    
        // Adjust column widths
        worksheet['!cols'] = [
            { wch: 30 },  // First column
            { wch: 50 }   // Second column
        ];
    
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidate Details');
    
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
        // Create and save the file
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${candidate.username}_details.xlsx`);
    };

    useEffect(() => {
        if (candidate) {
            fetchPersonalDetails(candidate.id);
        }
    }, [candidate]);

    const fetchPersonalDetails = async (id) => {
        try {
            const response = await axios.get(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/personalDetails/${id}`);
            setDetails(response.data);
            setFormData({
                personalDetails: response.data.personalDetails,
                qualifications: response.data.qualifications,
                skills: response.data.skills,
                certifications: response.data.certifications
            });
        } catch (error) {
            setError('Failed to fetch personal details');
        } finally {
            setLoading(false);
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
    

    const handleResumeUpload = async () => {
        if (!resumeFile) {
            setError('Please select a resume file to upload');
            return;
        }
        
        const formData = new FormData();
        formData.append('resume', resumeFile);
        
        try {
            const response = await axios.post('https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/uploadResume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Handle success - maybe show a success message
            console.log('Resume uploaded successfully:', response.data);
        } catch (error) {
            setError('Failed to upload resume');
        }
    };

    const handleDownloadResume = async () => {
           try {
               const resumeUrl = `https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/resume/${details.personalDetails.id}`;
               window.open(resumeUrl, '_blank'); // Opens the resume in a new tab
             } catch (error) {
               alert('Failed to view resume');
             }
   };

    const handleResumeChange = (e) => {
      setResumeFile(e.target.files[0]); // Store the selected resume file
  };


    const handleEditToggle = (section) => {
      setIsEditing((prevState) => ({
        ...prevState,
        [section]: !prevState[section],
      }));
    };
    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/');
    };
    const handleChange = (e) => {
      const { name, value } = e.target;
  
      // Handling qualification fields
      if (name.startsWith('qualification_')) {
          const [, index, field] = name.split('_'); // Extract index and field
  
          setFormData((prev) => {
              const updatedQualifications = [...(prev.qualifications || [])];
              if (!updatedQualifications[index]) {
                  updatedQualifications[index] = {}; // Initialize if undefined
              }
  
              // Make sure the field exists and update the value
              updatedQualifications[index] = {
                  ...updatedQualifications[index],
                  [field]: value,
              };
  
              return { ...prev, qualifications: updatedQualifications };
          });
      }
      // Handling skills fields
      else if (name.startsWith('skill_')) {
          const index = name.split('_')[1];
          setFormData((prev) => {
              const updatedSkills = [...prev.skills];
              updatedSkills[index] = value;
              return { ...prev, skills: updatedSkills };
          });
      }
      // Handling certifications fields
      else if (name.startsWith('certification_')) {
          const index = name.split('_')[1];
          setFormData((prev) => {
              const updatedCertifications = [...prev.certifications];
              updatedCertifications[index] = value;
              return { ...prev, certifications: updatedCertifications };
          });
      }
      // Handling other fields like personal details
       else if (name.startsWith('personalDetails_')) {
    const field = name.split('_')[1]; // Extract field from name

    setFormData((prev) => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [field]: value, // Update the personal details field
      },
    }));
  }
      else {
          setFormData((prev) => ({
              ...prev,
              personalDetails: {
                  ...prev.personalDetails,
                  [name]: value,
              },
          }));
      }
  };  

const recentJob = formData.qualifications.length > 0 ? formData.qualifications[0].recent_job : 'No Recent Job';

  

    const handleSubmit = async (e, section) => {
        e.preventDefault();
        try {
            const id = details.personalDetails.id;

            // Create a FormData object to handle file uploads
            const formDataToSubmit = new FormData();
            if (section === 'personal') {
                // Append all personal details to formData
                Object.keys(formData.personalDetails).forEach(key => {
                    formDataToSubmit.append(key, formData.personalDetails[key]);
                });
                // If there's a new resume file, append it as well
                if (resumeFile) {
                    formDataToSubmit.append('resume', resumeFile);
                }

                await axios.put(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates/${id}/personal`, formDataToSubmit, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                // Fetch updated details after submission
                fetchPersonalDetails(id);
                handleEditToggle(section); // Close the edit form
            } else if (section === 'qualifications') {
                // Assuming qualifications is an array and you want to update each one
                for (const qualification of formData.qualifications) {
                    await axios.put(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates/${id}/qualifications`, qualification);
                }
                fetchPersonalDetails(id); // Fetch updated details after submission
                handleEditToggle(section); // Close the edit form
            
            } else if (section === 'skills') {
                await axios.put(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates/${id}/skills`, { skills: formData.skills });
                fetchPersonalDetails(id); // Fetch updated details after submission
                handleEditToggle(section); // Close the edit form
            } else if (section === 'certifications') {
                await axios.put(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/candidates/${id}/certifications`, { certifications: formData.certifications });
                fetchPersonalDetails(id); // Fetch updated details after submission
                handleEditToggle(section); // Close the edit form
            }
        } catch (error) {
            alert('Failed to update details: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    if (loading) {
        return <p className="text-center">Loading candidate details...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    if (!details) {
        return <p className="text-center">No personal details found.</p>;
    }

    const { personalDetails, qualifications, skills, certifications } = details;
    
    return (
<div className="min-h-screen bg-white text-black font-sans dark:bg-gray-900 dark:text-gray-100">
  {/* Navbar */}
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
            onClick={handleLogout}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${isDarkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-400'} text-white`}
          >
            <FaSignOutAlt size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  

  {/* Candidate Details Section */}
  <div className="bg-white rounded-lg p-6 mb-0 mt-14 relative px-0 dark:bg-gray-800">
    {/* Breadcrumb */}
    <nav className="absolute top-0 left-0 pl-4 py-4 mt-1 flex items-center space-x-2 text-base">
      {/* Dashboard Icon */}
      <button
        onClick={() => navigate('/admin-dashboard')}
        className="flex items-center space-x-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-black hover:text-white dark:bg-gray-600 dark:text-gray-100"
      >
        <HomeIcon className="w-5 h-5" />
        <span className="font-medium">Dashboard</span>
      </button>

      <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-300" />

      <span className="flex items-center space-x-2 px-3 py-1 bg-gray-400 text-gray-800 rounded-lg dark:bg-gray-700 dark:text-gray-100">
        Candidate Details
      </span>
    </nav>

    {/* Candidate Info */}
    <div className="border-b-0 py-4 flex items-center justify-between flex-wrap space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-3 ml-4 mt-6 w-full md:w-auto md:flex-row flex-col">
        {/* Full Name */}
        <h1 className="text-3xl font-serif text-black truncate dark:text-gray-100">
          {`${formData?.personalDetails?.first_name || ''} ${formData?.personalDetails?.last_name || ''}`.trim() || 'N/A'}
        </h1>
        
        {/* Recent Job */}
        <p className="text-base text-gray-500 font-medium dark:text-gray-300 md:ml-4 mt-2 md:mt-0">
          <span className="font-semibold dark:text-gray-200">({recentJob || 'N/A'})</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mr-5 flex-wrap justify-center mt-4 sm:mt-0 ml-5 w-full md:w-auto">
        {/* View Resume Button */}
        <button
          onClick={handleDownloadResume}
          className="px-4 py-2 text-white font-medium rounded-lg bg-gradient-to-r from-[#15abcd] to-[#094DA2] hover:opacity-90 transition duration-300 flex items-center"
        >
          <EyeIcon className="h-5 w-5 mr-2" />
          View Resume
        </button>

        {/* Download Details Button */}
        <button
          onClick={handleDownloadDetails}
          className="px-4 py-2 text-white font-medium rounded-lg bg-gradient-to-r from-[#15abcd] to-[#094DA2] hover:opacity-90 transition duration-300 flex items-center"
        >
          <DownloadIcon className="h-5 w-5 mr-2" />
          Download Details
        </button>
      </div>

{/*personal details section */}    
<div className="w-full px-4 space-y-5">
  <div className="flex flex-col space-y-4">
    <div className="min-h-[0px]">
      {/* Header */}
      <div className="max-w-full mx-auto flex justify-between items-center mb-2 mt-2 relative">
        <h2 className="text-lg font-serif text-black dark:text-white truncate">Personal Details</h2>
        <button
          onClick={() => handleEditToggle('personal')}
          className="text-[#72757F] hover:text-[#505257] dark:text-[#B0B3B8] dark:hover:text-[#C0C3C8] transition duration-300"
        >
          <i className="fas fa-edit text-lg" />
        </button>
        <div className="absolute bottom-[-6px] left-0 w-full border-b border-gray-300 dark:border-gray-600" />
      </div>

      {/* Personal Details Content */}
      <div className="p-4 rounded-lg">
        {isEditing.personal ? (
          <form onSubmit={(e) => handleSubmit(e, 'personal')}>
            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  name="username"
                  value={candidate.username || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F] dark:bg-[#2C2C2C] dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  type="text"
                  name="phone_no"
                  value={formData.personalDetails?.phone_no || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F] dark:bg-[#2C2C2C] dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.personalDetails?.city || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F] dark:bg-[#2C2C2C] dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.personalDetails?.state || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F] dark:bg-[#2C2C2C] dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.personalDetails?.postal_code || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F] dark:bg-[#2C2C2C] dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.personalDetails?.address_line1 || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F] dark:bg-[#2C2C2C] dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
                <input
                  type="text"
                  name="linkedin_url"
                  value={formData.personalDetails?.linkedin_url || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F] dark:bg-[#2C2C2C] dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resume</label>
                <input
                  type="file"
                  name="resume"
                  onChange={handleResumeChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F] dark:bg-[#2C2C2C] dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            {/* Actions */}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#72757F] text-white rounded-md hover:bg-[#505257] transition duration-300"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => handleEditToggle('personal')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300 dark:bg-[#3C3C3C] dark:text-white dark:hover:bg-[#4C4C4C]"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            {[ 
              ['Username', candidate.username || 'N/A'],
              ['Phone Number', formData.personalDetails?.phone_no || 'N/A'],
              ['City', formData.personalDetails?.city || 'N/A'],
              ['State', formData.personalDetails?.state || 'N/A'],
              ['Postal Code', formData.personalDetails?.postal_code || 'N/A'],
              ['Address', formData.personalDetails?.address_line1 || 'N/A'],
            ].map(([label, value], index) => (
              <div key={index} className="flex flex-col">
                <label className="text-base font-serif text-black dark:text-white">{label}</label>
                <p className="text-sm font-serif text-gray-600 font-light dark:text-gray-400">{value}</p>
              </div>
            ))}

            {/* Non-editable LinkedIn and Resume fields */}
            <div className="flex flex-col col-span-2 lg:col-span-1">
              <label className="text-base font-serif text-black dark:text-white">LinkedIn URL</label>
              <p className="text-sm font-serif text-gray-600 font-light dark:text-gray-400">
                {formData.personalDetails?.linkedin_url ? (
                  <a
                    href={formData.personalDetails.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 font-light hover:text-black hover:text-sm transition-all duration-300 dark:text-gray-400 dark:hover:text-white"
                  >
                    {formData.personalDetails.linkedin_url}
                  </a>
                ) : 'N/A'}
              </p>
            </div>
            <div className="flex flex-col col-span-2 lg:col-span-1">
              <label className="text-base font-serif text-black dark:text-white">Resume</label>
              <p className="text-sm font-serif text-gray-600 font-light dark:text-gray-400">
                {formData.personalDetails?.resume_path || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

  
    <div className="flex-1 min-h-[0px]">
  {/* Qualifications Section */}
  <div className="max-w-full mx-auto mr-1 mb-10">
    {/* Qualifications Header (outside the box) */}
    <div className="flex justify-between items-center mb-3 relative">
      <h2 className="text-lg font-serif text-black dark:text-white truncate">Qualifications</h2>
      <button
        onClick={() => handleEditToggle('qualifications')}
        className="text-[#72757F] hover:text-[#505257] dark:text-[#B5B8BF] dark:hover:text-[#A0A3A9] transition duration-300"
      >
        <i className="fas fa-edit text-lg" />
      </button>
      {/* Underline effect */}
      <span className="absolute bottom-[-10px] left-0 w-full border-b border-gray-300 dark:border-gray-600" />
    </div>

    {/* Qualifications Content Box */}
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
      {isEditing.qualifications ? (
        <form onSubmit={(e) => handleSubmit(e, 'qualifications')} className="space-y-4">
          {formData.qualifications.map((qual, index) => (
            <div key={index} className="space-y-5">
              {/* Responsive grid layout */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 text-gray-700 dark:text-gray-300">
                {/* Recent Job */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_recent_job`}
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    Recent Job
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_recent_job`}
                    value={qual.recent_job || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#72757F] dark:focus:ring-[#A0A3A9] transition duration-200 text-gray-700 dark:text-gray-300 text-sm"
                    placeholder="Recent Job"
                  />
                </div>

                {/* Preferred Role */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_preferred_roles`}
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    Preferred Role
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_preferred_roles`}
                    value={qual.preferred_roles || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#72757F] dark:focus:ring-[#A0A3A9] transition duration-200 text-gray-700 dark:text-gray-300 text-sm"
                    placeholder="Preferred Role"
                  />
                </div>

                {/* Availability */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_availability`}
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    Availability
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_availability`}
                    value={qual.availability || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#72757F] dark:focus:ring-[#A0A3A9] transition duration-200 text-gray-700 dark:text-gray-300 text-sm"
                    placeholder="Availability"
                  />
                </div>

                {/* Compensation */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_compensation`}
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    Compensation
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_compensation`}
                    value={qual.compensation || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#72757F] dark:focus:ring-[#A0A3A9] transition duration-200 text-gray-700 dark:text-gray-300 text-sm"
                    placeholder="Compensation"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 text-gray-700 dark:text-gray-300">
                {/* Preferred Role Type */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_preferred_role_type`}
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    Preferred Role Type
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_preferred_role_type`}
                    value={qual.preferred_role_type || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#72757F] dark:focus:ring-[#A0A3A9] transition duration-200 text-gray-700 dark:text-gray-300 text-sm"
                    placeholder="Preferred Role Type"
                  />
                </div>

                {/* Preferred Work Arrangement */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_preferred_work_arrangement`}
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    Preferred Work Type
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_preferred_work_arrangement`}
                    value={qual.preferred_work_arrangement || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#72757F] dark:focus:ring-[#A0A3A9] transition duration-200 text-gray-700 dark:text-gray-300 text-sm"
                    placeholder="Preferred Work Arrangement"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-end mt-4 space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition duration-300 text-sm"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => handleEditToggle('qualifications')}
              className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-md hover:bg-gray-500 dark:hover:bg-gray-500 transition duration-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          {qualifications.length > 0 ? (
            qualifications.map((qual, index) => (
              <div key={index} className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-base text-gray-700 dark:text-gray-300 font-serif">
                  <div className="text-left">
                    <strong className="text-base font-medium font-serif text-black dark:text-white">Recent Job</strong>
                    <p>{qual.recent_job || 'N/A'}</p>
                  </div>
                  <div className="text-left">
                    <strong className="text-base font-medium font-serif text-black dark:text-white">Preferred Role</strong>
                    <p>{qual.preferred_roles || 'N/A'}</p>
                  </div>
                  <div className="text-left">
                    <strong className="text-base font-medium font-serif text-black dark:text-white">Availability</strong>
                    <p>{qual.availability || 'N/A'}</p>
                  </div>
                  <div className="text-left">
                    <strong className="text-base font-medium font-serif text-black dark:text-white">Compensation</strong>
                    <p>{qual.compensation || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-base text-gray-700 dark:text-gray-300">
                  <div className="text-left">
                    <strong className="text-base font-medium font-serif text-black dark:text-white">Preferred Role Type</strong>
                    <p>{qual.preferred_role_type || 'N/A'}</p>
                  </div>
                  <div className="text-left">
                    <strong className="text-base font-medium font-serif text-black dark:text-white">Preferred Work Type</strong>
                    <p>{qual.preferred_work_arrangement || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No qualifications available.</p>
          )}
        </div>
      )}
    </div>
  </div>
</div>
</div>
    
<div className="flex flex-wrap lg:flex-row flex-col gap-8 min-h-[100px]">
  {/* Skills Section */}
  <div className="flex-1 min-h-[0px]">
    {/* Skills Header */}
    <div className="max-w-[900px] mx-auto flex justify-between items-center mb-4 -mt-8 relative">
      <h2 className="text-lg font-serif text-black dark:text-white truncate">Skills</h2>
      <button
        onClick={() => handleEditToggle('skills')}
        className="text-[#72757F] hover:text-[#505257] dark:text-[#B0B3B8] dark:hover:text-[#C0C3C8] transition duration-300"
      >
        <i className="fas fa-edit text-lg" />
      </button>
      <div className="absolute bottom-[-9px] left-0 w-full border-b-[2px] border-gray-300 dark:border-gray-600" />
    </div>

    <div className="p-6 rounded-lg flex items-center justify-between min-h-[200px]">
      {isEditing.skills ? (
        <form onSubmit={(e) => handleSubmit(e, 'skills')} className="w-full">
          <input
            type="text"
            name="skills"
            value={formData.skills.join(', ')}
            onChange={(e) =>
              setFormData({
                ...formData,
                skills: e.target.value.split(',').map((skill) => skill.trim()),
              })
            }
            className="border rounded-md p-2 w-full bg-gray-100 dark:bg-[#3C3C3C] text-black dark:text-white"
            placeholder="Enter skills separated by commas"
          />
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-[#4A4A4A] dark:hover:bg-[#3C3C3C] transition duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => handleEditToggle('skills')}
              className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 dark:bg-[#4C4C4C] dark:text-white dark:hover:bg-[#3E3E3E] transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-[#4A4A4A] font-serif border rounded-full border-black dark:text-white dark:border-gray-600 flex items-center justify-center"
                  style={{ maxWidth: '7rem' }}
                >
                  {skill}
                </div>
              ))
            ) : (
              <p className="text-[#989AA1] dark:text-[#B0B3B8]">No skills available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Certifications Section */}
  <div className="flex-1 min-h-[0px]">
    {/* Certifications Header */}
    <div className="max-w-[900px] mx-auto flex justify-between items-center mb-4 -mt-8 relative">
      <h2 className="text-lg font-serif text-black dark:text-white truncate">Certifications</h2>
      <button
        onClick={() => handleEditToggle('certifications')}
        className="text-[#72757F] hover:text-[#505257] dark:text-[#B0B3B8] dark:hover:text-[#C0C3C8] transition duration-300"
      >
        <i className="fas fa-edit text-lg" />
      </button>
      <div className="absolute bottom-[-9px] left-0 w-full border-b-[2px] border-gray-300 dark:border-gray-600" />
    </div>

    <div className="p-3 rounded-lg flex items-center justify-between min-h-[200px]">
      {isEditing.certifications ? (
        <form onSubmit={(e) => handleSubmit(e, 'certifications')} className="w-full">
          <input
            type="text"
            name="certifications"
            value={formData.certifications.join(', ')}
            onChange={(e) =>
              setFormData({
                ...formData,
                certifications: e.target.value.split(',').map((cert) => cert.trim()),
              })
            }
            className="border rounded-md p-2 w-full bg-gray-100 dark:bg-[#3C3C3C] text-black dark:text-white"
            placeholder="Enter certifications separated by commas"
          />
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-[#4A4A4A] dark:hover:bg-[#3C3C3C] transition duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => handleEditToggle('certifications')}
              className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 dark:bg-[#4C4C4C] dark:text-white dark:hover:bg-[#3E3E3E] transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 w-full">
          {certifications.length > 0 ? (
            certifications.slice(0, 6).map((cert, index) => (
              <div
                key={index}
                className="text-base font-serif uppercase text-[#4A4A4A] text-left break-words dark:text-white"
              >
                {cert}
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500 dark:text-gray-400">No certifications available.</p>
          )}
        </div>
      )}
    </div>
  </div>
</div>
</div>
</div>

        </div>
        </div>
    );
};

export default CandidateDetails;
