import React, { useState } from 'react';
import { store } from '../../services/store';
import { VerificationDocument } from '../../types';
import { ShieldCheck, FileText, CheckCircle2, XCircle, AlertCircle, Eye } from 'lucide-react';

export const AdminVerification: React.FC = () => {
  const documents = store.getState().documents;
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);

  const handleApprove = (docId: string) => {
    store.approveDocument(docId);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDocId || !rejectionReason.trim()) return;

    store.rejectDocument(rejectingDocId, rejectionReason.trim());
    setRejectingDocId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">Captain KYC Verification Queue</h2>
          <p className="text-xs text-gray-500">Government identity & vehicle registration compliance check</p>
        </div>
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          {documents.filter((d) => d.status === 'pending').length} Awaiting Verification
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8FA] border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="px-4 py-3">Doc ID</th>
              <th className="px-4 py-3">Captain Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Document Type</th>
              <th className="px-4 py-3">Document Number</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Verification Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-gray-900">{doc.id}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{doc.captainName}</td>
                <td className="px-4 py-3 uppercase text-[10px] font-bold text-[#0053DB]">
                  {doc.vehicleCategory}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 font-bold text-gray-900">
                    <FileText className="w-3.5 h-3.5 text-[#A04100]" />
                    {doc.docType}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-gray-800">{doc.docNumber}</td>
                <td className="px-4 py-3 text-gray-500">{doc.submittedAt}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      doc.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : doc.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[11px] font-bold"
                  >
                    Preview
                  </button>

                  {doc.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(doc.id)}
                        className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejectingDocId(doc.id)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold"
                      >
                        Reject...
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Reason Modal */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleConfirmReject}
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Mandatory Rejection Reason</span>
            </div>

            <p className="text-xs text-gray-500">
              Please specify the exact compliance reason to send to the captain for document resubmission.
            </p>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Document photo is blurry / expired validity date / plate number mismatch"
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 outline-none focus:border-red-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRejectingDocId(null)}
                className="py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Document Inspector: {previewDoc.docType}</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 font-bold">✕</button>
            </div>

            <div className="p-4 bg-[#F7F8FA] rounded-xl border border-gray-200 text-center space-y-2">
              <div className="w-full h-40 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-300">
                <FileText className="w-10 h-10 text-gray-400 mb-1" />
                <span className="text-xs font-bold font-mono">{previewDoc.docNumber}</span>
                <span className="text-[10px] text-gray-400">RTO Ahmedabad Verified Hologram</span>
              </div>
              <p className="text-xs font-bold text-gray-900">{previewDoc.captainName} ({previewDoc.vehicleCategory.toUpperCase()})</p>
            </div>

            <button
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2 bg-gray-900 text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
