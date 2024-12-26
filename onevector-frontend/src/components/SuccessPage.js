import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessPage = () => {
    const location = useLocation();
    const message = location.state?.message || 'You have successfully registered!';

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-100 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Confetti (dots for a professional look) */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute bg-teal-100 rounded-full w-8 h-8 opacity-50"
                    initial={{ x: '-100vw', y: '100vh', scale: 0.5 }}
                    animate={{ x: '100vw', y: '-100vh', scale: 1.2 }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: 'loop' }}
                ></motion.div>
                <motion.div
                    className="absolute bg-teal-200 rounded-full w-6 h-6 opacity-40"
                    initial={{ x: '100vw', y: '100vh', scale: 0.5 }}
                    animate={{ x: '-100vw', y: '-100vh', scale: 1 }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: 'loop' }}
                ></motion.div>
            </div>

            <motion.div
                className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full relative z-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        <FaCheckCircle className="text-teal-500 text-6xl" />
                    </motion.div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-4">
                    Registration Successful
                </h1>

                {/* Message */}
                <p className="text-lg text-gray-600 text-center mb-6">
                    {message}
                </p>

                {/* Divider */}
                <div className="border-t border-gray-300 my-6"></div>

                {/* Action Button */}
                <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <a
                        href="/"
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-teal-700 transition-all"
                    >
                        Back to Home
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SuccessPage;
