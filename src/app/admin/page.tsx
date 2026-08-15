"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Upload, FileText, CheckCircle2, XCircle, AlertOctagon, RefreshCw, Eye, Edit3, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<"DOCUMENTS" | "REVIEW" | "ANOMALIES" | "HEALTH">("REVIEW");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const reviewCandidates = [
    {
      id: "QCAND_9001",
      docName: "IBPS_RRB_PO_Quant_1000.pdf",
      page: 14,
      text: "A sum of ₹10,000 yields ₹1,200 simple interest in 2 years. What is the annual rate of interest?",
      options: ["(A) 5%", "(B) 6%", "(C) 7%", "(D) 8%", "(E) 10%"],
      correctIndex: 1,
      explanation: "SI = (10000 * R * 2)/100 = 1200 => 200R = 1200 => R = 6%.",
      status: "REVIEW_REQUIRED",
      mathVerified: true,
      anomalies: ["Admin explicit approval pending"]
    },
    {
      id: "QCAND_9002",
      docName: "Banking_Quant_Ch3.pdf",
      page: 28,
      text: "Calculate Simple Interest on P = 1000, R = 10%, T = 2 years.",
      options: ["(A) Rs. 100", "(B) Rs. 200", "(C) Rs. 300", "(D) Rs. 400", "(E) Rs. 500"],
      correctIndex: 4, // Points to 500 (discrepancy)
      explanation: "SI = 1000 * 10 * 2 / 100 = 200.",
      status: "REJECTED_DISCREPANCY",
      mathVerified: false,
      anomalies: ["Declared answer key (Rs 500) contradicts mathematical solution (Rs 200)"]
    }
  ];

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      alert(`File "${file.name}" uploaded successfully! 40-stage processing pipeline initiated.`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        
        {/* Admin Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Admin Content Control Portal</h1>
              <p className="text-xs text-gray-400">Content Authority Engine • 40-Stage Pipeline • Publication Gate</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {(["REVIEW", "DOCUMENTS", "ANOMALIES", "HEALTH"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedTab === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Documents Upload */}
        {selectedTab === "DOCUMENTS" && (
          <div className="glass-card p-6 border-gray-800 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-400" />
              <span>Upload Coaching PDF / Study Material</span>
            </h2>

            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center space-y-4">
              <input
                type="file"
                accept=".pdf,.docx,.png,.jpg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="doc-upload"
              />
              <label htmlFor="doc-upload" className="cursor-pointer space-y-2 block">
                <FileText className="w-10 h-10 text-gray-400 mx-auto" />
                <div className="text-sm font-semibold text-gray-200">
                  {file ? file.name : "Click to browse or drop PDF, DOCX, or scanned image"}
                </div>
                <div className="text-xs text-gray-500">Supports multi-column layout, OCR, mathematical symbols</div>
              </label>

              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  {uploading ? "Running 40-Stage Pipeline..." : "Process Document"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Question Review Workspace (Side-by-Side Original vs Structured) */}
        {selectedTab === "REVIEW" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white">Side-by-Side Question Review Queue</h2>

            <div className="space-y-6">
              {reviewCandidates.map((cand) => (
                <div key={cand.id} className="glass-card p-6 border-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Source Document Context */}
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                      <span className="font-mono font-bold text-indigo-400">SOURCE: {cand.docName}</span>
                      <span>Page {cand.page}</span>
                    </div>

                    <div className="p-4 bg-gray-900 rounded-lg text-xs text-gray-300 font-mono space-y-2">
                      <div className="text-gray-500">[Original Document Page Snapshot]</div>
                      <p>{cand.text}</p>
                      {cand.options.map((o, idx) => (
                        <div key={idx}>{o}</div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Structured Question & Publication Gate Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-gray-300">{cand.id}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        cand.mathVerified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {cand.mathVerified ? "MATH VERIFIED" : "MATH DISCREPANCY"}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white">{cand.text}</p>

                    <div className="space-y-1.5">
                      {cand.options.map((o, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-2.5 rounded-lg border ${
                            idx === cand.correctIndex
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                              : "bg-gray-900 border-gray-800 text-gray-300"
                          }`}
                        >
                          {o}
                        </div>
                      ))}
                    </div>

                    {cand.anomalies.length > 0 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                        <span className="font-bold">Anomalies Detected:</span> {cand.anomalies.join(", ")}
                      </div>
                    )}

                    {/* Publication Gate Action Buttons */}
                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        onClick={() => alert(`Question ${cand.id} APPROVED and published to production!`)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>APPROVE & PUBLISH</span>
                      </button>

                      <button
                        onClick={() => alert(`Question ${cand.id} REJECTED.`)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>REJECT</span>
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
