import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-700">
              Horeb Choir
            </h1>

            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-indigo-700 hover:text-indigo-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow"
              >
                View Attendance
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg
              className="w-16 h-16 text-indigo-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
        </motion.div>

        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Horeb Choir
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          “Sing to the Lord a new song.”  
          <span className="block text-sm mt-2 text-gray-500">— Psalm 96:1</span>
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Worship",
              text: "Glorifying God through united voices and sacred melodies.",
              color: "from-indigo-500 to-indigo-700",
              shadow: "shadow-indigo-300",
            },
            {
              title: "Fellowship",
              text: "Growing together in faith, love, and spiritual harmony.",
              color: "from-emerald-500 to-emerald-700",
              shadow: "shadow-emerald-300",
            },
            {
              title: "Service",
              text: "Serving the church faithfully with discipline and dedication.",
              color: "from-amber-500 to-amber-600",
              shadow: "shadow-amber-300",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{
                delay: i * 0.2,
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`bg-white rounded-2xl p-8 shadow-xl ${card.shadow} border border-gray-100`}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white font-bold text-xl mb-4`}
              >
                ✝
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {card.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl shadow-indigo-200 p-10 max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            To honor God through music, strengthen unity among members,
            and uphold responsibility through a transparent attendance system.
          </p>
        </motion.div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-300"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-300"
          >
            View Attendance
          </Link>
        </div>
      </div>
    </div>
  );
}
