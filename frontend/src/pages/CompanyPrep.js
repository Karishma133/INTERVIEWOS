import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const COMPANY_COLORS = {
  Google: "from-blue-500 to-green-500",
  Amazon: "from-orange-400 to-yellow-500",
  Microsoft: "from-cyan-500 to-blue-600",
  Facebook: "from-blue-600 to-indigo-600",
  LinkedIn: "from-sky-500 to-blue-700",
  Adobe: "from-red-500 to-rose-600",
  default: "from-primary-500 to-primary-700",
};

const DIFFICULTY_DOT = { Easy: "bg-green-400", Medium: "bg-yellow-400", Hard: "bg-red-400" };

export default function CompanyPrep() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.listCompanies().then(setCompanies).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">🏢 Company-Wise Prep Sets</h1>
        <p className="text-gray-500 dark:text-gray-400">Curated problem bundles tagged by the companies that actually ask them.</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading companies...</p>
      ) : companies.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400">No company-tagged questions yet. Add <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">companyTags</code> to questions in the seed data to populate this page.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c) => (
            <button
              key={c.company}
              onClick={() => navigate(`/questions?company=${encodeURIComponent(c.company)}`)}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-left shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`h-20 bg-gradient-to-br ${COMPANY_COLORS[c.company] || COMPANY_COLORS.default} flex items-end p-4`}>
                <span className="text-white font-extrabold text-lg drop-shadow-sm">{c.company}</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{c.count} problem{c.count !== 1 ? "s" : ""}</p>
                <div className="flex items-center gap-2 mb-4">
                  {c.difficulties.map((d) => (
                    <span key={d} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className={`w-2 h-2 rounded-full ${DIFFICULTY_DOT[d]}`} /> {d}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:gap-2 transition-all">
                  Start prep set →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
