import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import oneVectorImage from './images/onevector.png'; // Adjust the path based on your folder structure


const OnboardingForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Personal Information States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    // Qualifications States
    const [recentJob, setRecentJob] = useState('');
    const [preferredRoles, setPreferredRoles] = useState('');
    const [availability, setAvailability] = useState('');
    const [workPermitStatus, setWorkPermitStatus] = useState('');
    const [preferredRoleType, setPreferredRoleType] = useState('');
    const [preferredWorkArrangement, setPreferredWorkArrangement] = useState('');
    const [preferredCompensationRange, setPreferredCompensationRange] = useState('');
    const [resume, setResume] = useState(null);
    const [skills, setSkills] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedCertifications, setSelectedCertifications] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [newCertification, setNewCertification] = useState('');
    

    // New state to manage dropdown visibility
    const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
    const [isCertificationsDropdownOpen, setIsCertificationsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchSkillsAndCertifications = async () => {
            try {
                const skillsResponse = await axios.get('http://localhost:3000/api/skills');
                setSkills(skillsResponse.data.map(skill => skill.skill_name));

                const certificationsResponse = await axios.get('http://localhost:3000/api/certifications');
                setCertifications(certificationsResponse.data.map(cert => cert.certification_name));
            } catch (error) {
                console.error('Error fetching skills and certifications:', error);
            }
        };

        fetchSkillsAndCertifications();
    }, []);

    useEffect(() => {
      // Assuming the email was saved in localStorage when sending the magic link
      const savedEmail = localStorage.getItem('magicLinkEmail');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }, []);
    

    const handleNext = async (event) => {
      event.preventDefault();
  
      if (step === 1) {
          setStep(2);
      } else if (step === 2) {
          const formData = new FormData();
          formData.append('first_name', firstName);
          formData.append('last_name', lastName);
          formData.append('phone_no', phoneNo);
          formData.append('address_line1', addressLine1);
          formData.append('address_line2', addressLine2);
          formData.append('city', city);
          formData.append('state', state);
          formData.append('country', country);
          formData.append('postal_code', postalCode);
          formData.append('linkedin_url', linkedinUrl);
          formData.append('username', username);
          formData.append('password', password);
          formData.append('email', email);
          formData.append('recent_job', recentJob);
          formData.append('preferred_roles', preferredRoles);
          formData.append('availability', availability);
          formData.append('work_permit_status', workPermitStatus);
          formData.append('preferred_role_type', preferredRoleType);
          formData.append('preferred_work_arrangement', preferredWorkArrangement);
          formData.append('preferred_compensation_range', preferredCompensationRange);
          formData.append('resume_path', resume);
  
          // Append selected skills and certifications
          selectedSkills.forEach(skill => formData.append('skills[]', skill));
          selectedCertifications.forEach(cert => formData.append('certifications[]', cert));
  
          // Add new skills and certifications if provided
          if (newSkill) {
              formData.append('skills[]', newSkill);
              setNewSkill(''); // Clear the input after submission
          }
  
          if (newCertification) {
              formData.append('certifications[]', newCertification);
              setNewCertification(''); // Clear the input after submission
          }
  
          try {
              // Post request with the form data
              const response = await axios.post('http://localhost:3000/api/submit-candidate', formData, {
                  headers: {
                      'Content-Type': 'multipart/form-data',
                  },
              });
              
              if (response.status === 200) {
                  // Redirect to success page
                  navigate('/success');
              }
          } catch (error) {
              // Improved error handling
              console.error('Error submitting the form:', error);
              alert('An error occurred while submitting the form. Please try again later.');
          }
      }
  };

  const handlePrevious = () => {
      if (step > 1) {
          setStep(step - 1);
      }
  };

  const handleAddSkill = () => {
      if (newSkill && !skills.includes(newSkill)) {
          setSkills([...skills, newSkill]);
          setSelectedSkills([...selectedSkills, newSkill]); // Automatically select the new skill
          setNewSkill(''); // Clear the input
      }
  };

  const handleAddCertification = () => {
      if (newCertification && !certifications.includes(newCertification)) {
          setCertifications([...certifications, newCertification]);
          setSelectedCertifications([...selectedCertifications, newCertification]); // Automatically select the new certification
          setNewCertification(''); // Clear the input
      }
  };

  const toggleSkillsDropdown = () => {
      setIsSkillsDropdownOpen(!isSkillsDropdownOpen);
  };

  const toggleCertificationsDropdown = () => {
      setIsCertificationsDropdownOpen(!isCertificationsDropdownOpen);
  };

  const handleSkillSelect = (skill) => {
      if (!selectedSkills.includes(skill)) {
          setSelectedSkills([...selectedSkills, skill]);
      }
      setIsSkillsDropdownOpen(false); // Close the dropdown after selection
  };

  const handleCertificationSelect = (certification) => {
      if (!selectedCertifications.includes(certification)) {
          setSelectedCertifications([...selectedCertifications, certification]);
      }
      setIsCertificationsDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-gray-100">
    <div className="w-full max-w-3xl bg-white bg-opacity-30 backdrop-blur-lg p-8 rounded-xl shadow-lg space-y-6">
     {/* Logo and Title */}
    <div className="flex items-center justify-center space-x-3 mb-6">
      <img src={oneVectorImage} alt="OneVector Logo" className="w-[40px] h-[50px]" />
      <h1 className="text-3xl font-sans-serif text-gray-800 tracking-wide">TalentHub</h1>
    </div>
  
      {/* Heading */}
      <h2 className="text-xl font-sans-serif text-black-800 text-left mb-8">
        {step === 1 ? 'Personal Information' : 'Qualifications'}
      </h2>
  
      <form onSubmit={handleNext} className="space-y-6">
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
                         {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNo" className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNo"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
              {/* Address Line 1 */}
              <div>
                <label htmlFor="addressLine1" className="block text-gray-700 text-sm font-medium mb-2">Address Line 1</label>
                <input
                  type="text"
                  id="addressLine1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address Line 2 */}
              <div>
                <label htmlFor="addressLine2" className="block text-gray-700 text-sm font-medium mb-2">Address Line 2</label>
                <input
                  type="text"
                  id="addressLine2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                />
              </div>
              {/* City */}
              <div>
                <label htmlFor="city" className="block text-gray-700 text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State */}
              <div>
                <label htmlFor="state" className="block text-gray-700 text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-gray-700 text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Postal Code */}
              <div>
                <label htmlFor="postalCode" className="block text-gray-700 text-sm font-medium mb-2">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
              {/* LinkedIn URL */}
              <div>
                <label htmlFor="linkedinUrl" className="block text-gray-700 text-sm font-medium mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                />
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
  
           <div className="grid grid-cols-1 gap-4">
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>

          </>
        )}
         
  {step === 2 && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {/* Recent Job */}
    <div className="w-full px-2 mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Recent Job</label>
      <input
        type="text"
        value={recentJob}
        onChange={(e) => setRecentJob(e.target.value)}
        className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
      />
    </div>

    {/* Preferred Roles */}
    <div className="w-full px-2 mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Roles</label>
      <input
        type="text"
        value={preferredRoles}
        onChange={(e) => setPreferredRoles(e.target.value)}
        className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
      />
    </div>

    {/* Availability */}
    <div className="w-full px-2 mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">Availability</label>
  <div className="relative">
    <select
      value={availability}
      onChange={(e) => setAvailability(e.target.value)}
      className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400 appearance-none"
    >
      <option value="" disabled>Select availability</option>
      <option value="immediate">Immediate</option>
      <option value="less_than_3_months">Less than 3 months</option>
      <option value="more_than_3_months">More than 3 months</option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  </div>
</div>

    {/* Work Permit Status */}
    <div className="w-full px-2 mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Work Permit Status</label>
      <input
        type="text"
        value={workPermitStatus}
        onChange={(e) => setWorkPermitStatus(e.target.value)}
        className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
      />
    </div>

    {/* Preferred Role Type */}
    <div className="w-full px-2 mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Role Type</label>
  <div className="relative">
    <select
      value={preferredRoleType}
      onChange={(e) => setPreferredRoleType(e.target.value)}
      className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400 appearance-none"
    >
      <option value="" disabled>Select role type</option>
      <option value="full_time">Full Time</option>
      <option value="part_time">Part Time</option>
      <option value="intern">Intern</option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  </div>
</div>

    {/* Preferred Work Arrangement */}
    <div className="w-full px-2 mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Work Arrangement</label>
  <div className="relative">
    <select
      value={preferredWorkArrangement}
      onChange={(e) => setPreferredWorkArrangement(e.target.value)}
      className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400 appearance-none"
    >
      <option value="" disabled>Select work arrangement</option>
      <option value="hybrid">Hybrid</option>
      <option value="work_from_home">Work From Home</option>
      <option value="remote">Remote</option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  </div>
</div>

    {/* Preferred Compensation Range */}
    <div className="w-full px-2 mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Compensation Range</label>
      <input
        type="text"
        value={preferredCompensationRange}
        onChange={(e) => setPreferredCompensationRange(e.target.value)}
        className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
      />
    </div>

    {/* Resume */}
    <div className="w-full px-2 mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Resume</label>
      <input
        type="file"
        onChange={(e) => setResume(e.target.files[0])}
        className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
        required
      />
    </div>

    {/* Skills */}
    <div className="w-full px-2 mb-8 flex flex-col col-span-full">
      <h2 className="text-xl font-sans-serif text-black-800 text-left mb-4">Skills</h2>
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a new skill"
          className="mb-2 w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
        />
          <div className="relative">
        <button
          type="button"
          onClick={toggleSkillsDropdown}
          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md flex items-center justify-between"
        >
          <span>
            {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Select Skills'}
          </span>
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isSkillsDropdownOpen && (
          <div className="absolute z-10 bg-gray-50 border rounded shadow-lg mt-1 w-full max-h-60 overflow-y-auto">
            {skills.map((skill, index) => (
              <div
                key={index}
                onClick={() => handleSkillSelect(skill)}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              >
                {skill}
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleAddSkill}
          className="mt-2 w-full bg-gradient-to-r from-teal-100 via-teal-200 to-teal-100 text-black py-3 px-4 rounded-lg shadow-md"
        >
          Add Skill
        </button>
      </div>
    </div>

    {/* Certifications */}
    <div className="w-full px-2 mb-8 flex flex-col col-span-full">
      <h2 className="text-xl font-sans-serif text-black-800 text-left mb-4">Certifications</h2>
        <input
          type="text"
          value={newCertification}
          onChange={(e) => setNewCertification(e.target.value)}
          placeholder="Add a new certification"
          className="mb-2 w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md placeholder:text-sm placeholder:text-gray-400"
        />
        <div className="relative">
        <button
          type="button"
          onClick={toggleCertificationsDropdown}
          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ease-in-out duration-200 shadow-md flex items-center justify-between"
        >
          <span>
            {selectedCertifications.length > 0 ? selectedCertifications.join(', ') : 'Select Certifications'}
          </span>
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isCertificationsDropdownOpen && (
          <div className="absolute z-10 bg-gray-50 border rounded shadow-lg mt-1 w-full max-h-60 overflow-y-auto">
            {certifications.map((certification, index) => (
              <div
                key={index}
                onClick={() => handleCertificationSelect(certification)}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              >
                {certification}
              </div>
            ))}
          </div>
        )}
      
        <button
          type="button"
          onClick={handleAddCertification}
          className="mt-2 w-full bg-gradient-to-r from-teal-100 via-teal-200 to-teal-100 text-black py-3 px-4 rounded-lg shadow-md"
        >
          Add Certification
        </button>
      </div>
    </div>
  </div>
  )}
 <div className="flex justify-between mt-6">
    {step > 1 && (
        <button
            type="button"
            onClick={handlePrevious}
            className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg shadow-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-all ease-in-out duration-200"
        >
            Previous
        </button>
    )}
    <button
        type="submit"
        className="bg-gradient-to-r from-[#15abcd] to-[#094DA2] text-black py-3 px-6 rounded-lg shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-300 focus:outline-none transition-all ease-in-out duration-200"
    >
        {step === 2 ? 'Submit' : 'Next'}
    </button>
</div>

                </form>
            </div>
        </div>
    );
};
export default OnboardingForm;
