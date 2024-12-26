import React, { useState } from 'react';

const MagicLinkHistoryPopup = ({ magicLinks, onClose }) => {
    const [filterEmail, setFilterEmail] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Ensure magicLinks is an array before filtering
    const validMagicLinks = Array.isArray(magicLinks) ? magicLinks : [];

    // Filtered magic links based on email and status
    const filteredMagicLinks = validMagicLinks.filter((link) => {
        const matchesEmail = link.email.toLowerCase().includes(filterEmail.toLowerCase());
        const isExpired = new Date(link.expires_at) < new Date();
        const matchesStatus =
            filterStatus === ''
                ? true
                : (filterStatus === 'active' && !isExpired) || (filterStatus === 'expired' && isExpired);

        return matchesEmail && matchesStatus;
    }).reverse(); // Reverse to show new to old

    // Paginate the filtered magic links
    const paginatedLinks = filteredMagicLinks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredMagicLinks.length / itemsPerPage);

    const clearFilters = () => {
        setFilterEmail('');
        setFilterStatus('');
        setCurrentPage(1); // Reset to the first page when filters are cleared
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-11/12 max-w-4xl relative" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-b-2 border-black pb-2">Magic Link History</h2>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                    ✖
                </button>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <input
                        type="text"
                        placeholder="Search by email"
                        className="p-3 border border-black rounded-md w-full md:w-1/3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filterEmail}
                        onChange={(e) => setFilterEmail(e.target.value)}
                    />
                    <select
                        className="p-3 border border-black rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                    </select>
                    <button
    onClick={clearFilters}
    className="p-2 bg-gray-100 text-black rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring focus:ring-gray-400"
>
    Clear Filters
</button>

                </div>

                {/* Displaying Magic Link History */}
                {paginatedLinks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-3 w-1/3">Email</th>
                                    <th className="px-4 py-3 w-1/4">Created At</th>
                                    <th className="px-4 py-3 w-1/4">Expiration</th>
                                    <th className="px-4 py-3 w-1/4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLinks.map((link) => {
                                    const isExpired = new Date(link.expires_at) < new Date();
                                    return (
                                        <tr
                                            key={link.id}
                                            className="bg-white dark:bg-gray-800 hover:bg-gray-100 transition-all border-b border-gray-300"
                                        >
                                            <td className="px-4 py-3 break-words">{link.email}</td>
                                            <td className="px-4 py-3">
                                                {new Date(link.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(link.expires_at).toLocaleString()}
                                            </td>
                                            <td
                                                className={`px-4 py-3 ${isExpired ? 'text-red-500' : 'text-green-500'}`}
                                                title={isExpired ? 'This link has expired.' : 'This link is active.'}
                                            >
                                                {isExpired ? 'Expired' : 'Active'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="mt-4 flex justify-between items-center">
    <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className={`p-3 rounded-md transition-colors duration-300 ${
            currentPage === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-black hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400'
        }`}
    >
        First
    </button>
    <div className="flex gap-4 justify-center w-full">
        <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-3 rounded-md transition-colors duration-300 ${
                currentPage === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-black hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400'
            }`}
        >
            Previous
        </button>
        <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-3 rounded-md transition-colors duration-300 ${
                currentPage === totalPages
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-black hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400'
            }`}
        >
            Next
        </button>
    </div>
    <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className={`p-3 rounded-md transition-colors duration-300 ${
            currentPage === totalPages
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-black hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400'
        }`}
    >
        Last
    </button>
</div>

                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No magic links found matching the criteria.</p>
                        <img
                            src="/no-data.svg"
                            alt="No data"
                            className="mx-auto w-32 h-32 opacity-50"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MagicLinkHistoryPopup;
