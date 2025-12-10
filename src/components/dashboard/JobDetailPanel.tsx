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
    <div className="bg-white rounded-3xl h-full flex flex-col relative" style={{ 
      boxShadow: '0 2px 12px rgba(124, 58, 237, 0.06)',
      border: '1px solid rgba(124, 58, 237, 0.1)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif"
    }}>
      
      {/* Mobile Back Button */}
      <div className="md:hidden p-4 border-b flex items-center" style={{ borderColor: 'rgba(124, 58, 237, 0.1)' }}>
        <button 
          onClick={handleBack} 
          className="flex items-center transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#7C3AED'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Matches
        </button>
      </div>

      <div className="p-8 border-b" style={{ borderColor: 'rgba(124, 58, 237, 0.1)', background: 'rgba(124, 58, 237, 0.01)' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#5B21B6' }}>{selectedJob.title}</h2>
            <div className="flex items-center text-sm mt-1" style={{ color: '#6B7280' }}>
              <Briefcase className="w-4 h-4 mr-1.5" />
              <span>{selectedJob.company}</span>
              <MapPin className="w-4 h-4 ml-4 mr-1.5" />
              <span>{selectedJob.location}</span>
            </div>
          </div>
          <div className="px-6 py-3 rounded-2xl font-bold text-3xl" style={{
            background: selectedJob.matchConfidence >= 80
              ? 'rgba(16, 185, 129, 0.1)'
              : selectedJob.matchConfidence >= 60
              ? 'rgba(251, 191, 36, 0.1)'
              : 'rgba(107, 114, 128, 0.1)',
            color: selectedJob.matchConfidence >= 80
              ? '#10B981'
              : selectedJob.matchConfidence >= 60
              ? '#FBBF24'
              : '#6B7280'
          }}>
            {selectedJob.matchConfidence}%
          </div>
        </div>

        {/* Confidence Breakdown Card */}
        <div className="p-6 rounded-2xl mb-4" style={{ background: 'rgba(124, 58, 237, 0.02)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
             <Zap className="w-5 h-5" style={{ color: '#7C3AED' }} />
             <span className="text-sm font-semibold" style={{ color: '#5B21B6' }}>Why you matched</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
             <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.05)' }}>
                <div className="text-sm mb-1" style={{ color: '#6B7280' }}>Skills</div>
                <div className="font-bold text-2xl" style={{ color: '#1F2937' }}>{matchDetails?.skillMatch}%</div>
             </div>
             <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.05)' }}>
                <div className="text-sm mb-1" style={{ color: '#6B7280' }}>Culture</div>
                <div className="font-bold text-2xl" style={{ color: '#1F2937' }}>{matchDetails?.cultureMatch}%</div>
             </div>
             <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.05)' }}>
                <div className="text-sm mb-1" style={{ color: '#6B7280' }}>Prefs</div>
                <div className="font-bold text-2xl" style={{ color: '#1F2937' }}>{matchDetails?.preferenceMatch}%</div>
             </div>
          </div>
          <p className="text-sm italic" style={{ color: '#6B7280', lineHeight: '1.6' }}>
            "{matchDetails?.reason}"
          </p>
        </div>

        <MatchGrid />

      </div>

      {/* Main Job Description Body */}
      <div className="flex-1 overflow-y-auto p-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#5B21B6' }}>Job Description</h3>
        <div className="prose prose-sm max-w-none" style={{ color: '#1F2937', lineHeight: '1.6' }}>
          <ReactMarkdown>{selectedJob.description}</ReactMarkdown>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t flex items-center justify-between" style={{ borderColor: 'rgba(124, 58, 237, 0.1)', background: 'rgba(124, 58, 237, 0.01)' }}>
        
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:transform hover:-translate-y-0.5" style={{ 
          background: '#F9FAFB',
          color: '#1F2937',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          boxShadow: '0 1px 2px rgba(124, 58, 237, 0.05)'
        }}>
          <Bookmark className="w-4 h-4" />
          <span>Save for later</span>
        </button>

        {/* Status Indicator */}
        {selectedJob.status === 'interview_scheduled' && selectedJob.matchConfidence >= 70 ? (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ 
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#10B981'
          }}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">
              Match Shared with HR • Awaiting Contact
            </span>
          </div>
        ) : selectedJob.status === 'interview_scheduled' && selectedJob.matchConfidence < 70 ? (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ 
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            color: '#FBBF24'
          }}>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-sm font-medium">
              Under Review • Low Match Score
            </span>
          </div>
        ) : selectedJob.matchConfidence >= 70 ? (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ 
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            color: '#7C3AED'
          }}>
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-sm font-medium">
              Strong Match • Pending HR Review
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ 
            background: 'rgba(107, 114, 128, 0.1)',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            color: '#6B7280'
          }}>
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-sm font-medium">
              Match Pending Review ({selectedJob.matchConfidence}% match)
            </span>
          </div>
        )}

      </div>
    </div>
  );
}