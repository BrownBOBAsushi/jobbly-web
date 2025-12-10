// app/onboarding/profile/page.tsx
'use client';

import { useOnboarding } from '../../../components/onboarding/OnboardingContext';
import { DragAndDropUpload } from '../../../components/onboarding/DragAndDropUpload';
import { FaCamera, FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useRef } from 'react';

// Max file size: 5MB for individual files, as specified
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function ProfilePage() {
  const router = useRouter();
  // Adjusted path: needs 3 levels up since it's inside /profile
  const { data, updateProfile, markStepComplete } = useOnboarding(); 
  const { profile } = data;
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Helper function to handle single file update
  const handleSingleFileChange = (field: 'resume' | 'coverLetter' | 'photo') => (files: File[]) => {
    updateProfile({ [field]: files.length > 0 ? files[0] : null });
  };
  
  // Helper function to handle multiple files (certificates)
  const handleCertificatesChange = (files: File[]) => {
    updateProfile({ certificates: files });
  };

  const handlePhotoUploadClick = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= MAX_SIZE_BYTES) {
      updateProfile({ photo: file });
    } else if (file) {
        alert("Profile photo exceeds 5MB limit.");
    }
  };

  const isStepComplete = !!(profile.resume && profile.coverLetter); // Minimal completion logic

  const handleAiAnalyze = () => {
    if (isStepComplete) {
      markStepComplete(1); // Mark step 1 complete
      router.push('/onboarding/preference'); // Go to the next step
    } else {
      alert("Please upload your Resume and Cover Letter to proceed.");
    }
  }


  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
      
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">Profile</h2>
        <p className="text-lg text-gray-500 mt-1">Upload your core application documents</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Resume Upload */}
        <DragAndDropUpload
          label="Resume Upload"
          subTitle="PDF, DOCX (max 5MB)"
          accept=".pdf,.docx"
          multiple={false}
          maxSize={MAX_SIZE_BYTES}
          currentFiles={profile.resume ? [profile.resume] : []}
          onFileChange={handleSingleFileChange('resume')}
        />

        {/* Cover Letter Upload */}
        <DragAndDropUpload
          label="Cover Letter Upload"
          subTitle="PDF, DOCX (max 5MB)"
          accept=".pdf,.docx"
          multiple={false}
          maxSize={MAX_SIZE_BYTES}
          currentFiles={profile.coverLetter ? [profile.coverLetter] : []}
          onFileChange={handleSingleFileChange('coverLetter')}
        />

        {/* Photo and Certificates Section */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center p-4 border border-gray-200 rounded-xl flex-shrink-0 lg:w-48 w-full">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Profile Photo</h3>
            <div className="relative w-24 h-24">
              {profile.photo ? (
                // In a real app, this would use URL.createObjectURL(file) for preview
                <div className="w-full h-full rounded-full bg-cover bg-center bg-gray-100" style={{ backgroundImage: `url(${URL.createObjectURL(profile.photo)})` }} />
              ) : (
                <FaUserCircle className="w-full h-full text-gray-300" />
              )}
              
              <button
                type="button"
                onClick={handlePhotoUploadClick}
                className="absolute bottom-0 right-0 p-1 bg-indigo-600 text-white rounded-full border-2 border-white hover:bg-indigo-700 transition-colors"
                title="Upload Photo"
              >
                <FaCamera className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">JPG, PNG (max 5MB)</p>
            
            {/* Hidden Input for Photo Upload */}
            <input 
                type="file" 
                ref={photoInputRef} 
                onChange={handlePhotoFileChange} 
                accept="image/jpeg,image/png"
                style={{ display: 'none' }} 
            />
          </div>

          {/* Additional Certificates Upload (Takes remaining space) */}
          <div className="flex-1 w-full">
            <DragAndDropUpload
                label="Additional Certificates (optional)"
                subTitle="PDF, JPG, PNG (multiple files allowed, max 5MB each)"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple={true}
                maxSize={MAX_SIZE_BYTES}
                currentFiles={profile.certificates}
                onFileChange={handleCertificatesChange}
            />
          </div>
        </div>

      </div>

      <footer className="mt-10 pt-6 border-t flex justify-end">
        <button
          onClick={handleAiAnalyze}
          disabled={!isStepComplete}
          className={`
            px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200
            ${isStepComplete
              ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Analyze Resume with AI
        </button>
      </footer>
    </div>
  );
}