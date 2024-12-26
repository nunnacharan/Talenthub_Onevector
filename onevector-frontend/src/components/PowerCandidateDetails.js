import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { DocumentDownloadIcon } from '@heroicons/react/solid';
import './CandidateDetails.css';
import { EyeIcon } from '@heroicons/react/solid';
import { FaSignOutAlt } from 'react-icons/fa';
import oneVectorImage from './images/onevector.png'; // Adjust the path based on your folder structure





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
      /* try {
           const response = await axios.get(`https://5q5faxzgb7.execute-api.ap-south-1.amazonaws.com/api/resume/${details.personalDetails.id}`, {
               responseType: 'blob', // Important for downloading files
           });
           const url = window.URL.createObjectURL(new Blob([response.data]));
           const link = document.createElement('a');
           link.href = url;
           link.setAttribute('download', 'resume.pdf'); // You can change the file name here
           document.body.appendChild(link);
           link.click();
           link.remove();
       } catch (error) {
           alert('Failed to download resume');
       }*/

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

      <div className="min-h-screen bg-white text-black font-sans">
  {/* Navbar */}
  <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
    <div className="flex justify-between items-center p-4">
      {/* Logo and Title on the left */}
      <div className="flex items-center space-x-3">
        <img src={oneVectorImage} alt="OneVector Logo" className="w-[30px] h-[40px]" />
        <h1 className="text-2xl font-normal text-gray-800 tracking-wide">TalentHub</h1>
      </div>

      {/* Dashboard Link in the middle */}
      <div className="flex-1 text-center">
        <Link
          to="/power-user-dashboard" // Update with your actual route path
          className="text-l font-light text-black-600 underline hover:text-gray-800 transition-all duration-300 transform hover:scale-110 hover:text-lg hover:underline-offset-4 custom-underline mr-24"
          >
          Dashboard
        </Link>
      </div>

      {/* Buttons on the right */}
      <div className="flex items-center space-x-6">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center space-x-2 hover:bg-red-400"
        >
          <FaSignOutAlt size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>

      <div>
  {/* Candidate Details Section */}
  <div className="bg-white  rounded-lg p-6 ml-4 mr-4 mb-0 mt-20 relative">
    {/* Bottom Border */}
    <div className="border-b-0 py-4 flex items-center justify-between">
     {/* Candidate Name and Recent Job */}
     <div className="flex-grow text-left flex flex-col items-start ml-5">
        <h1 className="text-2xl font-serif text-black truncate">
          {`${formData?.personalDetails?.first_name || ''} ${formData?.personalDetails?.last_name || ''}`.trim() || 'N/A'}
        </h1>
        <p className="text-base text-gray-500 font-medium mt-2 mr-2">
          {recentJob}
        </p>
      </div>

      {/* View Resume Button */}
      <button 
        onClick={handleDownloadResume} 
        className="px-6 py-2 text-white font-medium rounded-lg bg-gradient-to-r from-[#15abcd] to-[#094DA2] hover:opacity-90 transition duration-300 flex items-center ml-auto"
      >
        <EyeIcon className="h-5 w-5 mr-2" />
        View Resume
      </button>
    </div>

{/* Personal Details Layout */}
<div className="w-full px-4 space-y-4">
  <div className="flex flex-col space-y-4 ">
    <div className="min-h-[0px]">
      {/* Header */}
      <div className="max-w-full mx-auto flex justify-between items-center mb-2 mt-6 relative">
        <h2 className="text-lg font-serif text-black truncate">Personal Details</h2>
        <button
          onClick={() => handleEditToggle('personal')}
          className="text-[#72757F] hover:text-[#505257] transition duration-300"
        >
          <i className="fas fa-edit text-lg" />
        </button>
        <div className="absolute bottom-[-6px] left-0 w-full border-b border-gray-300" />
      </div>

      {/* Personal Details Content */}
      <div className="p-4 rounded-lg bg-white">
        {isEditing.personal ? (
          <form onSubmit={(e) => handleSubmit(e, 'personal')}>
            {/* Editable Fields */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={candidate.username || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phone_no"
                  value={formData.personalDetails?.phone_no || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.personalDetails?.city || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.personalDetails?.state || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.personalDetails?.postal_code || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.personalDetails?.address_line1 || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">LinkedIn URL</label>
                <input
                  type="text"
                  name="linkedin_url"
                  value={formData.personalDetails?.linkedin_url || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Resume</label>
                <input
                  type="file"
                  name="resume"
                  onChange={handleResumeChange}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72757F]"
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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            {[
              ['Username', candidate.username || 'N/A'],
              ['Phone Number', formData.personalDetails?.phone_no || 'N/A'],
              ['City', formData.personalDetails?.city || 'N/A'],
              ['State', formData.personalDetails?.state || 'N/A'],
              ['Postal Code', formData.personalDetails?.postal_code || 'N/A'],
              ['Address', formData.personalDetails?.address_line1 || 'N/A'],
              ['LinkedIn URL', formData.personalDetails?.linkedin_url ? (
                <div className="flex items-center">
                  <a
                    href={formData.personalDetails.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 font-light hover:text-black hover:text-base transition-all duration-300"
                  >
                    {formData.personalDetails.linkedin_url}
                  </a>
                  <i className="fas fa-link ml-2 text-gray-600 hover:text-black hover:text-base transition-all duration-300"></i>
                </div>
              ) : 'N/A'],
            ['Resume', 'Uploaded'],
            ].map(([label, value], index) => (
              <div key={index} className="flex flex-col">
                <label className="text-sm font-medium text-black">{label}</label>
                <p className="text-sm text-gray-600 font-light">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>




    <div className="flex-1 min-h-[0px]">
  {/* Qualifications Section */}
  <div className="max-w-full mx-auto mr-1 mt-6 mb-10">
    {/* Qualifications Header (outside the box) */}
    <div className="flex justify-between items-center mb-3 relative">
    <h2 className="text-lg font-serif text-black truncate">Qualifications</h2>
    <button
        onClick={() => handleEditToggle('qualifications')}
        className="text-[#989AA1] hover:text-[#CCCDD2] transition duration-300"
      >
        <i className="fas fa-edit text-sm" />
      </button>
      {/* Underline effect */}
      <span className="absolute bottom-[-10px] left-0 w-full border-b border-gray-300" />
    </div>

    {/* Qualifications Content Box */}
    <div className="bg-white p-4 rounded-lg mb-4">
      {isEditing.qualifications ? (
        <form onSubmit={(e) => handleSubmit(e, 'qualifications')} className="space-y-4">
          {formData.qualifications.map((qual, index) => (
            <div key={index} className="space-y-4">
              {/* Grid layout for qualifications */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 text-gray-700">
                {/* Recent Job */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_recent_job`}
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Recent Job
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_recent_job`}
                    value={qual.recent_job || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#72757F] transition duration-200 text-gray-700 text-sm"
                    placeholder="Recent Job"
                  />
                </div>

                {/* Preferred Role */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_preferred_roles`}
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Preferred Role
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_preferred_roles`}
                    value={qual.preferred_roles || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#72757F] transition duration-200 text-gray-700 text-sm"
                    placeholder="Preferred Role"
                  />
                </div>

                {/* Availability */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_availability`}
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Availability
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_availability`}
                    value={qual.availability || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#72757F] transition duration-200 text-gray-700 text-sm"
                    placeholder="Availability"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 text-gray-700">
                {/* Preferred Role Type */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_preferred_role_type`}
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Preferred Role Type
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_preferred_role_type`}
                    value={qual.preferred_role_type || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#72757F] transition duration-200 text-gray-700 text-sm"
                    placeholder="Preferred Role Type"
                  />
                </div>

                {/* Preferred Work Arrangement */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_preferred_work_arrangement`}
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Preferred Work Type
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_preferred_work_arrangement`}
                    value={qual.preferred_work_arrangement || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#72757F] transition duration-200 text-gray-700 text-sm"
                    placeholder="Preferred Work Arrangement"
                  />
                </div>

                {/* Compensation */}
                <div className="text-left">
                  <label
                    htmlFor={`qualification_${index}_compensation`}
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Compensation
                  </label>
                  <input
                    type="text"
                    name={`qualification_${index}_compensation`}
                    value={qual.compensation || ''}
                    onChange={handleChange}
                    className="block w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#72757F] transition duration-200 text-gray-700 text-sm"
                    placeholder="Compensation"
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
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          {qualifications.length > 0 ? (
            qualifications.map((qual, index) => (
              <div key={index} className="space-y-3">
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm text-gray-700">
                  <div className="text-left">
                    <strong className="text-sm font-medium text-black">Recent Job:</strong>
                    <p>{qual.recent_job || 'N/A'}</p>
                  </div>
                  <div className="text-left">
                    <strong className="text-sm font-medium text-black">Preferred Role:</strong>
                    <p>{qual.preferred_roles || 'N/A'}</p>
                  </div>
                  <div className="text-left">
                    <strong className="text-sm font-medium text-black">Availability:</strong>
                    <p>{qual.availability || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm text-gray-700">
                  <div className="text-left">
                    <strong className="text-sm font-medium text-black">Preferred Role Type:</strong>
                    <p>{qual.preferred_role_type || 'N/A'}</p>
                  </div>
                  <div className="text-left">
                    <strong className="text-sm font-medium text-black">Preferred Work Type:</strong>
                    <p>{qual.preferred_work_arrangement || 'N/A'}</p>
                  </div>
                  <div className="text-left">
                    <strong className="text-sm font-medium text-black">Compensation:</strong>
                    <p>{qual.compensation || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No qualifications available.</p>
          )}
        </div>
      )}
    </div>
  </div>
</div>
</div>

    
<div className="flex flex-wrap gap-8 min-h-[300px]">
  {/* Skills Section */}
  <div className="flex-1 min-h-[0px]">
    {/* Skills Header */}
    <div className="max-w-[900px] mx-auto flex justify-between items-center mb-4 -mt-2 relative">
      <h2 className="text-lg font-serif text-black truncate">Skills</h2>
      <button
        onClick={() => handleEditToggle('skills')}
        className="text-[#989AA1] hover:text-[#CCCDD2] transition duration-300"
      >
        <i className="fas fa-edit text-xl" />
      </button>
      {/* Underline line */}
      <div className="absolute bottom-[-9px] left-0 w-full border-b-[2px] border-gray-300" />
    </div>

    <div className="p-6 rounded-lg flex items-center justify-between min-h-[150px]">
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
            className="border rounded-md p-2 w-full bg-gray-100"
            placeholder="Enter skills separated by commas"
          />
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => handleEditToggle('skills')}
              className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between w-full">
          <div className="grid grid-cols-2 gap-4 w-full"> {/* 2 columns for skills */}
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-[#4A4A4A] font-medium  border rounded-full border-black flex items-center justify-center"
                  style={{ maxWidth: '7rem' }}
                >
                  {skill}
                </div>
              ))
            ) : (
              <p className="text-[#989AA1]">No skills available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
{/* Certifications Section */}
<div className="flex-1 min-h-[0px]">
  {/* Certifications Header */}
  <div className="max-w-[900px] mx-auto flex justify-between items-center mb-4 -mt-3 relative">
    <h2 className="text-lg font-serif text-black truncate">Certifications</h2>
    <button
      onClick={() => handleEditToggle('certifications')}
      className="text-[#989AA1] hover:text-[#CCCDD2] transition duration-300"
    >
      <i className="fas fa-edit text-xl" />
    </button>
    {/* Underline line */}
    <div className="absolute bottom-[-13px] left-0 w-full border-b-[2px] border-gray-300" />
  </div>

  <div className="p-6 rounded-lg flex items-center justify-between min-h-[200px]">
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
          className="border rounded-md p-2 w-full bg-gray-100"
          placeholder="Enter certifications separated by commas"
        />
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-300"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => handleEditToggle('certifications')}
            className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    ) : (
      <div className="grid grid-cols-3 grid-rows-2 gap-4 w-full">
        {certifications.length > 0 ? (
          certifications.slice(0, 6).map((cert, index) => (
            <div
              key={index}
              className="text-sm font-bold uppercase text-[#4A4A4A] text-center p-2"
            >
              {cert}
            </div>
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-500">No certifications available.</p>
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
