'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Users, Loader2, CheckCircle, Trash2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  jd_text: string | null;
  jd_url: string | null;
  status: string;
  created_at: string;
  match_count: number;
  preferences: {
    role_level: string;
    salary_min: number;
    salary_max: number;
    mode_of_work: string;
  } | null;
}

interface MatchedApplicant {
  id: string;
  overall_score: number;
  skills_score: number;
  behaviour_score: number;
  prefs_score: number;
  ai_summary: string | null;
  status: string;
  interview_scheduled_at: string | null;
  created_at: string;
  applicant: {
    user: {
      id: string;
      email: string;
      full_name: string | null;
    };
    profile: {
      resume_url: string | null;
      cover_letter_url: string | null;
      photo_url: string | null;
      skills: string[];
    } | null;
    preferences: {
      target_job_title: string | null;
      role_level: string | null;
      salary_min: number | null;
      salary_max: number | null;
      mode_of_work: string | null;
    } | null;
  };
}

export default function HrDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [matchedApplicants, setMatchedApplicants] = useState<MatchedApplicant[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch matched applicants when job is selected
  useEffect(() => {
    if (selectedJobId) {
      fetchMatchedApplicants(selectedJobId);
    } else {
      setMatchedApplicants([]);
      setSelectedApplicantId(null);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const response = await fetch('/api/hr/jobs', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      
      // Auto-select first job if available
      if (data.jobs && data.jobs.length > 0) {
        setSelectedJobId(data.jobs[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      alert('Error fetching jobs: ' + error.message);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const fetchMatchedApplicants = async (jobId: string) => {
    setIsLoadingApplicants(true);
    try {
      const response = await fetch(`/api/hr/jobs/${jobId}/matches`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch matched applicants');
      }

      const data = await response.json();
      setMatchedApplicants(data.matches || []);
      
      // Auto-select first applicant if available
      if (data.matches && data.matches.length > 0) {
        setSelectedApplicantId(data.matches[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching matched applicants:', error);
      alert('Error fetching matched applicants: ' + error.message);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleScheduleInterview = async (matchId: string) => {
    if (!selectedJobId) return;
    
    setIsScheduling(true);
    try {
      const response = await fetch(`/api/hr/jobs/${selectedJobId}/schedule-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          match_id: matchId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule interview');
      }

      // Refresh matched applicants to show updated status
      await fetchMatchedApplicants(selectedJobId);
      alert('Interview scheduled successfully!');
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      alert('Error scheduling interview: ' + error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(jobId);
    try {
      const response = await fetch(`/api/hr/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete job');
      }

      await fetchJobs();
      
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setMatchedApplicants([]);
        setSelectedApplicantId(null);
      }
      
      alert('Job deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting job:', error);
      alert('Error deleting job: ' + error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selectedApplicant = matchedApplicants.find(a => a.id === selectedApplicantId);

  return (
    <div className="min-h-screen" style={{ background: '#FAF5FF', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: 'rgba(124, 58, 237, 0.1)', padding: '24px 32px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}>
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#5B21B6' }}>HR Dashboard</h1>
          </div>
          <button
            onClick={() => router.push('/hr/onboarding')}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:transform hover:-translate-y-0.5"
            style={{ 
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.25)';
            }}
          >
            Post New Job
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-12 gap-6">
          
          {/* LEFT: Jobs List */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full overflow-y-auto">
            <div className="bg-white rounded-3xl h-full flex flex-col p-6" style={{ boxShadow: '0 2px 12px rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#5B21B6' }}>Your Jobs ({jobs.length})</h2>

              {isLoadingJobs && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7C3AED' }} />
                </div>
              )}

              {!isLoadingJobs && jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-2xl h-full" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', color: '#6B7280' }}>
                  <Briefcase className="w-12 h-12 mb-4" style={{ color: '#A78BFA' }} />
                  <p className="mb-2">No jobs posted yet.</p>
                  <button
                    onClick={() => router.push('/hr/onboarding')}
                    className="mt-4 px-6 py-3 rounded-xl font-semibold text-white transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                    }}
                  >
                    Post Your First Job
                  </button>
                </div>
              )}

              {!isLoadingJobs && jobs.length > 0 && (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                        selectedJobId === job.id
                          ? 'border-purple-500'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      style={{
                        background: selectedJobId === job.id ? 'rgba(124, 58, 237, 0.05)' : '#FFFFFF',
                        boxShadow: selectedJobId === job.id ? '0 2px 12px rgba(124, 58, 237, 0.06)' : 'none'
                      }}
                    >
                      <button
                        onClick={(e) => handleDeleteJob(job.id, e)}
                        disabled={isDeleting === job.id}
                        className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors disabled:opacity-50 hover:bg-red-50"
                        style={{ color: '#EF4444' }}
                        title="Delete job"
                      >
                        {isDeleting === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                      <h3 className="font-semibold pr-8 mb-1" style={{ color: '#1F2937' }}>{job.title}</h3>
                      <p className="text-sm mb-1" style={{ color: '#6B7280' }}>
                        {job.match_count} match{job.match_count !== 1 ? 'es' : ''}
                      </p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE: Matched Applicants List */}
          <div className={`col-span-12 md:col-span-4 lg:col-span-3 h-full overflow-y-auto ${
            selectedJobId ? 'block' : 'hidden md:block'
          }`}>
            <div className="bg-white rounded-3xl h-full flex flex-col p-6" style={{ boxShadow: '0 2px 12px rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#5B21B6' }}>
                Matched Applicants ({matchedApplicants.length})
              </h2>

              {isLoadingApplicants && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7C3AED' }} />
                </div>
              )}

              {!isLoadingApplicants && matchedApplicants.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-2xl h-full" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', color: '#6B7280' }}>
                  <Users className="w-12 h-12 mb-4" style={{ color: '#A78BFA' }} />
                  <p className="mb-1">No matched applicants yet.</p>
                  <p className="text-sm">Complete job setup to start matching.</p>
                </div>
              )}

              {!isLoadingApplicants && matchedApplicants.length > 0 && (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  {matchedApplicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      onClick={() => setSelectedApplicantId(applicant.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedApplicantId === applicant.id
                          ? 'border-purple-500'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      style={{
                        background: selectedApplicantId === applicant.id ? 'rgba(124, 58, 237, 0.05)' : '#FFFFFF',
                        boxShadow: selectedApplicantId === applicant.id ? '0 2px 12px rgba(124, 58, 237, 0.06)' : 'none'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold" style={{ color: '#1F2937' }}>
                          {applicant.applicant.user.full_name || applicant.applicant.user.email}
                        </h3>
                        <span className="px-3 py-1.5 rounded-xl font-bold text-lg" style={{
                          background: applicant.overall_score >= 80
                            ? 'rgba(16, 185, 129, 0.1)'
                            : applicant.overall_score >= 60
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'rgba(107, 114, 128, 0.1)',
                          color: applicant.overall_score >= 80
                            ? '#10B981'
                            : applicant.overall_score >= 60
                            ? '#FBBF24'
                            : '#6B7280'
                        }}>
                          {applicant.overall_score}%
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        {applicant.applicant.preferences?.target_job_title || 'No title specified'}
                      </p>
                      {applicant.status === 'interview_scheduled' && (
                        <div className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: '#10B981' }}>
                          <CheckCircle className="w-4 h-4" />
                          <span>Interview Scheduled</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Applicant Detail */}
          <div className={`col-span-12 md:col-span-4 lg:col-span-6 h-full overflow-y-auto ${
            selectedApplicantId ? 'block' : 'hidden md:block'
          }`}>
            {selectedApplicant ? (
              <div className="bg-white rounded-3xl h-full flex flex-col p-8" style={{ boxShadow: '0 2px 12px rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#5B21B6' }}>
                      {selectedApplicant.applicant.user.full_name || 'Applicant'}
                    </h2>
                    <p className="text-base" style={{ color: '#6B7280' }}>
                      {selectedApplicant.applicant.user.email}
                    </p>
                  </div>
                  <div className="px-6 py-3 rounded-2xl font-bold text-2xl" style={{
                    background: selectedApplicant.overall_score >= 80
                      ? 'rgba(16, 185, 129, 0.1)'
                      : selectedApplicant.overall_score >= 60
                      ? 'rgba(251, 191, 36, 0.1)'
                      : 'rgba(107, 114, 128, 0.1)',
                    color: selectedApplicant.overall_score >= 80
                      ? '#10B981'
                      : selectedApplicant.overall_score >= 60
                      ? '#FBBF24'
                      : '#6B7280'
                  }}>
                    {selectedApplicant.overall_score}% Match
                  </div>
                </div>

                {/* Match Breakdown */}
                <div className="p-6 rounded-2xl mb-6" style={{ background: 'rgba(124, 58, 237, 0.02)' }}>
                  <h3 className="font-semibold mb-4" style={{ color: '#5B21B6' }}>Match Breakdown</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm mb-1" style={{ color: '#6B7280' }}>Skills</div>
                      <div className="font-bold text-2xl" style={{ color: '#1F2937' }}>{selectedApplicant.skills_score}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm mb-1" style={{ color: '#6B7280' }}>Culture</div>
                      <div className="font-bold text-2xl" style={{ color: '#1F2937' }}>{selectedApplicant.behaviour_score}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm mb-1" style={{ color: '#6B7280' }}>Prefs</div>
                      <div className="font-bold text-2xl" style={{ color: '#1F2937' }}>{selectedApplicant.prefs_score}%</div>
                    </div>
                  </div>
                  {selectedApplicant.ai_summary && (
                    <p className="text-sm italic" style={{ color: '#6B7280', lineHeight: '1.6' }}>
                      "{selectedApplicant.ai_summary}"
                    </p>
                  )}
                </div>

                {/* Applicant Details */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3" style={{ color: '#5B21B6' }}>Preferences</h3>
                  <div className="space-y-2 text-base" style={{ color: '#1F2937' }}>
                    <p>
                      <span className="font-medium">Target Role:</span>{' '}
                      {selectedApplicant.applicant.preferences?.target_job_title || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Role Level:</span>{' '}
                      {selectedApplicant.applicant.preferences?.role_level || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Salary Range:</span>{' '}
                      {selectedApplicant.applicant.preferences?.salary_min && selectedApplicant.applicant.preferences?.salary_max
                        ? `$${selectedApplicant.applicant.preferences.salary_min} - $${selectedApplicant.applicant.preferences.salary_max}`
                        : 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Work Mode:</span>{' '}
                      {selectedApplicant.applicant.preferences?.mode_of_work || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {selectedApplicant.applicant.profile?.skills && selectedApplicant.applicant.profile.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3" style={{ color: '#5B21B6' }}>Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.applicant.profile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3" style={{ color: '#5B21B6' }}>Documents</h3>
                  <div className="space-y-2">
                    {selectedApplicant.applicant.profile?.resume_url && (
                      <a
                        href={selectedApplicant.applicant.profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:transform hover:-translate-y-0.5"
                        style={{ 
                          background: '#F9FAFB',
                          color: '#1F2937',
                          boxShadow: '0 1px 2px rgba(124, 58, 237, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F9FAFB';
                        }}
                      >
                        📄 View Resume
                      </a>
                    )}
                    {selectedApplicant.applicant.profile?.cover_letter_url && (
                      <a
                        href={selectedApplicant.applicant.profile.cover_letter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:transform hover:-translate-y-0.5"
                        style={{ 
                          background: '#F9FAFB',
                          color: '#1F2937',
                          boxShadow: '0 1px 2px rgba(124, 58, 237, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F9FAFB';
                        }}
                      >
                        📝 View Cover Letter
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-6 border-t" style={{ borderColor: 'rgba(124, 58, 237, 0.1)' }}>
                  {selectedApplicant.status === 'interview_scheduled' ? (
                    <div className="flex items-center gap-2" style={{ color: '#10B981' }}>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Interview Scheduled</span>
                      {selectedApplicant.interview_scheduled_at && (
                        <span className="text-sm ml-auto" style={{ color: '#6B7280' }}>
                          {new Date(selectedApplicant.interview_scheduled_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleScheduleInterview(selectedApplicant.id)}
                        disabled={isScheduling || selectedApplicant.overall_score < 70}
                        className={`w-full px-6 py-4 rounded-xl font-semibold transition-all ${
                          selectedApplicant.overall_score < 70
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:transform hover:-translate-y-0.5'
                        }`}
                        style={{
                          background: selectedApplicant.overall_score >= 70
                            ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                            : '#E5E7EB',
                          color: selectedApplicant.overall_score >= 70 ? '#FFFFFF' : '#9CA3AF',
                          boxShadow: selectedApplicant.overall_score >= 70
                            ? '0 4px 12px rgba(124, 58, 237, 0.25)'
                            : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedApplicant.overall_score >= 70) {
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.35)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedApplicant.overall_score >= 70) {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.25)';
                          }
                        }}
                      >
                        {isScheduling ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Scheduling...
                          </span>
                        ) : (
                          'Schedule Interview'
                        )}
                      </button>
                      {selectedApplicant.overall_score < 70 && (
                        <p className="text-xs text-center mt-2" style={{ color: '#9CA3AF' }}>
                          Match score must be ≥70% to schedule interview
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl h-full flex items-center justify-center p-8" style={{ boxShadow: '0 2px 12px rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                <div className="text-center" style={{ color: '#6B7280' }}>
                  <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#A78BFA' }} />
                  <p>Select an applicant to view details</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
