// src/lib/groq-client.ts
// Groq API client wrapper for skill extraction and match summary generation

import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * Extract skills from resume text/PDF content
 * @param resumeText - The text content extracted from the resume
 * @returns Array of skill strings
 */
export async function extractSkillsFromResume(resumeText: string): Promise<string[]> {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not set, returning mock skills');
    // Return mock skills for development/testing
    return ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL'];
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a resume parser. Extract technical skills, programming languages, frameworks, tools, and technologies from the resume text. 
Return ONLY a JSON array of skill strings, nothing else. Example: ["React", "TypeScript", "Node.js", "PostgreSQL"]`,
        },
        {
          role: 'user',
          content: `Extract skills from this resume:\n\n${resumeText.substring(0, 5000)}`, // Limit to 5000 chars
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }

    // Parse JSON response
    const parsed = JSON.parse(response);
    
    // Handle different response formats
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed.skills && Array.isArray(parsed.skills)) {
      return parsed.skills;
    } else if (typeof parsed === 'object') {
      // Try to find any array in the response
      const values = Object.values(parsed);
      const arrayValue = values.find((v) => Array.isArray(v));
      if (arrayValue) {
        return arrayValue as string[];
      }
    }

    // Fallback: return empty array
    return [];
  } catch (error) {
    console.error('Error extracting skills from resume:', error);
    // Return mock skills on error
    return ['React', 'TypeScript', 'Next.js'];
  }
}

/**
 * Generate AI summary for a match between applicant and job
 * @param applicantData - Applicant profile, preferences, and behaviour data
 * @param jobData - Job details, preferences, and behaviour data
 * @param scores - Match scores (skills, behaviour, preferences, overall)
 * @returns AI-generated summary string
 */
export async function generateMatchSummary(
  applicantData: {
    skills: string[];
    preferences: {
      target_job_title?: string;
      role_level?: string;
      salary_min?: number;
      salary_max?: number;
      mode_of_work?: string;
    };
    behaviour?: Record<string, any>;
  },
  jobData: {
    title: string;
    jd_text?: string;
    preferences: {
      role_level?: string;
      salary_min?: number;
      salary_max?: number;
      mode_of_work?: string;
    };
    behaviour?: Record<string, any>;
  },
  scores: {
    skills_score: number;
    behaviour_score: number;
    prefs_score: number;
    overall_score: number;
  }
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not set, returning mock summary');
    return `Strong match! ${scores.overall_score}% compatibility. Skills align well with ${jobData.title} requirements.`;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a job matching assistant. Generate a concise, professional summary (2-3 sentences) explaining why this applicant is a good match for this job.
Focus on: skills alignment, work style compatibility, and preference matches. Be specific and positive.`,
        },
        {
          role: 'user',
          content: `Generate a match summary:

Applicant Skills: ${applicantData.skills.join(', ')}
Applicant Preferences: ${applicantData.preferences.target_job_title || 'N/A'} role, ${applicantData.preferences.role_level || 'N/A'} level, ${applicantData.preferences.mode_of_work || 'N/A'} work mode

Job Title: ${jobData.title}
Job Requirements: ${jobData.preferences.role_level || 'N/A'} level, ${jobData.preferences.mode_of_work || 'N/A'} work mode

Match Scores:
- Skills: ${scores.skills_score}%
- Behaviour/Culture: ${scores.behaviour_score}%
- Preferences: ${scores.prefs_score}%
- Overall: ${scores.overall_score}%

Generate a 2-3 sentence summary:`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 200,
    });

    const summary = completion.choices[0]?.message?.content;
    return summary || `Strong match with ${scores.overall_score}% compatibility.`;
  } catch (error) {
    console.error('Error generating match summary:', error);
    return `Match score: ${scores.overall_score}%. Skills and preferences align well with this role.`;
  }
}

/**
 * Extract preferences from cover letter text
 * @param coverLetterText - The text content from the cover letter
 * @returns Object with suggested preferences (job title, role level, salary range, work mode)
 */
export async function extractPreferencesFromCoverLetter(
  coverLetterText: string
): Promise<{
  job_title?: string;
  role_level?: 'Intern' | 'Junior' | 'Senior' | 'Lead';
  salary_min?: number;
  salary_max?: number;
  mode_of_work?: 'Work from Home' | 'On site' | 'Hybrid';
}> {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not set, returning empty preferences');
    return {};
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a cover letter analyzer. Extract job preferences from the cover letter text.

IMPORTANT RULES:
1. If the job title contains a role level (e.g., "Senior Full-Stack Engineer", "Junior Developer"), extract BOTH:
   - job_title: The full job title as mentioned (e.g., "Full-Stack Engineer" or "Full Stack Engineer")
   - role_level: Extract the level from the title ("Senior", "Junior", "Lead", "Intern")

2. If role level is mentioned separately from job title, use that.

3. Look for phrases like:
   - "Senior [Job Title]" → job_title: "[Job Title]", role_level: "Senior"
   - "Junior [Job Title]" → job_title: "[Job Title]", role_level: "Junior"
   - "Lead [Job Title]" → job_title: "[Job Title]", role_level: "Lead"

4. For job titles, normalize common variations:
   - "Full-Stack Engineer" = "Full Stack Engineer"
   - "Frontend Engineer" = "Frontend Engineer"
   - "Backend Developer" = "Backend Developer"

Return a JSON object with these fields:
- job_title: The job title/position WITHOUT the role level prefix (e.g., "Full-Stack Engineer", "Frontend Engineer")
- role_level: One of "Intern", "Junior", "Senior", or "Lead" (extract from job title or context)
- salary_min: Minimum expected salary per month (as a number, extract if mentioned)
- salary_max: Maximum expected salary per month (as a number, extract if mentioned)
- mode_of_work: One of "Work from Home", "On site", or "Hybrid" (infer from mentions of remote/onsite/hybrid)

Return ONLY valid JSON, nothing else. Example: {"job_title": "Full-Stack Engineer", "role_level": "Senior", "salary_min": 5000, "salary_max": 8000, "mode_of_work": "Hybrid"}`,
        },
        {
          role: 'user',
          content: `Extract preferences from this cover letter:\n\n${coverLetterText.substring(0, 5000)}`, // Limit to 5000 chars
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }

    const parsed = JSON.parse(response);
    
    // Log extracted data for debugging
    console.log('📋 Groq extracted preferences:', parsed);
    
    // Post-process: If job_title contains role level, extract it
    let jobTitle = parsed.job_title || '';
    let roleLevel = parsed.role_level;
    
    // If role level is in job title but not extracted separately, extract it
    if (jobTitle && !roleLevel) {
      const titleLower = jobTitle.toLowerCase();
      if (titleLower.includes('senior')) {
        roleLevel = 'Senior';
        jobTitle = jobTitle.replace(/senior\s+/i, '').trim();
      } else if (titleLower.includes('junior')) {
        roleLevel = 'Junior';
        jobTitle = jobTitle.replace(/junior\s+/i, '').trim();
      } else if (titleLower.includes('lead')) {
        roleLevel = 'Lead';
        jobTitle = jobTitle.replace(/lead\s+/i, '').trim();
      } else if (titleLower.includes('intern')) {
        roleLevel = 'Intern';
        jobTitle = jobTitle.replace(/intern\s+/i, '').trim();
      }
    }
    
    // If role level is in job title and also extracted, prefer the extracted one but clean the title
    if (jobTitle && roleLevel) {
      // Remove role level from job title if it's still there
      jobTitle = jobTitle
        .replace(new RegExp(`^${roleLevel}\\s+`, 'i'), '')
        .replace(new RegExp(`\\s+${roleLevel}$`, 'i'), '')
        .trim();
    }
    
    const result = {
      job_title: jobTitle || undefined,
      role_level: roleLevel || undefined,
      salary_min: parsed.salary_min ? Number(parsed.salary_min) : undefined,
      salary_max: parsed.salary_max ? Number(parsed.salary_max) : undefined,
      mode_of_work: parsed.mode_of_work || undefined,
    };
    
    console.log('✅ Processed preferences:', result);
    return result;
  } catch (error) {
    console.error('Error extracting preferences from cover letter:', error);
    return {};
  }
}

/**
 * Extract text from PDF file (helper function)
 * Note: This is a placeholder - in production, you'd use a PDF parsing library
 * For now, we'll assume the frontend extracts text before sending
 */
export async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  // TODO: Implement PDF text extraction
  // For now, return empty string - frontend should extract text before calling
  console.warn('PDF text extraction not implemented - frontend should extract text');
  return '';
}

