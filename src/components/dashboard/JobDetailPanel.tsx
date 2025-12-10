// src/components/dashboard/JobDetailPanel.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown'; // Optional: if installed
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Bookmark, Briefcase, DollarSign, MapPin, ArrowLeft, Zap } from 'lucide-react';
import MatchGrid from './MatchGrid'; // <--- IMPORT ADDED HERE

export default function JobDetailPanel() {
  const { matchedJobs, selectedJobId, setSelectedJobId } = useApp();
  
  const selectedJob = matchedJobs.find(job => job.id === selectedJobId);

  if (!selectedJob) return null; // Handled by parent layout usually

  // Back button handler for mobile
  const handleBack = () => setSelectedJobId(''); // Setting to empty string effectively deselects

  const { matchDetails } = selectedJob;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col relative">
      
      {/* Mobile Back Button (Visible only on small screens) */}
      <div className="md:hidden p-4 border-b border-gray-100 flex items-center">
        <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-indigo-600">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Matches
        </button>
      </div>

      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Briefcase className="w-4 h-4 mr-1" />
              <span>{selectedJob.company}</span>
              <MapPin className="w-4 h-4 ml-3 mr-1" />
              <span>{selectedJob.location}</span>
            </div>
          </div>
          <Badge variant="primary" className="text-lg py-1 px-4">
            {selectedJob.matchConfidence}%
          </Badge>
        </div>

        {/* --- STRATEGIC EXTENSION: Confidence Breakdown Card --- */}
        <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
             <Zap className="w-4 h-4 text-indigo-500" />
             <span className="text-sm font-semibold text-gray-900">Why you matched</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
             <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Skills</div>
                <div className="font-bold text-gray-900">{matchDetails?.skillMatch}%</div>
             </div>
             <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Culture</div>
                <div className="font-bold text-gray-900">{matchDetails?.cultureMatch}%</div>
             </div>
             <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Prefs</div>
                <div className="font-bold text-gray-900">{matchDetails?.preferenceMatch}%</div>
             </div>
          </div>
          <p className="text-xs text-gray-600 italic">
            "{matchDetails?.reason}"
          </p>
        </div>
        {/* ----------------------------------------------------- */}

        {/* 🟢 NEW: MatchGrid Component Added Here 🟢 */}
        {/* This renders the detailed Skill/Behaviour boxes */}
        <MatchGrid />

      </div>

      {/* Main Job Description Body with Markdown */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Job Description</h3>
        <div className="prose prose-sm max-w-none text-gray-700">
          {/* If using react-markdown */}
          <ReactMarkdown>{selectedJob.description}</ReactMarkdown> 
          
          {/* OR fallback if you didn't install it: */}
          {/* <div className="whitespace-pre-line">{selectedJob.description}</div> */}
        </div>
      </div>

      {/* Footer Actions: Status Indicator instead of Apply Button */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        
        {/* Save Button (Still useful for bookmarking) */}
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
          <Bookmark className="w-4 h-4" />
          <span>Save for later</span>
        </button>

        {/* Status Indicator */}
        <div className="flex items-center space-x-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
           <div className="flex items-center justify-center w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-sm font-medium text-indigo-900">
             Match Shared with HR • Awaiting Contact
           </span>
        </div>

      </div>
    </div>
  );
}