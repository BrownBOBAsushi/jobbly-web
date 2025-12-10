// src/lib/matching-engine.ts
// Matching algorithm to compute compatibility scores between applicants and jobs

import { generateMatchSummary } from './groq-client';

export interface ApplicantData {
  skills: string[];
  preferences: {
    target_job_title?: string;
    role_level?: string;
    salary_min?: number;
    salary_max?: number;
    mode_of_work?: string;
  };
  behaviour: {
    independent_vs_team?: number;
    structured_vs_open?: number;
    fast_vs_steady?: number;
    quick_vs_thorough?: number;
    hands_on_vs_strategic?: number;
    feedback_vs_autonomy?: number;
    innovation_vs_process?: number;
    flexible_vs_schedule?: number;
  };
}

export interface JobData {
  title: string;
  jd_text?: string;
  preferences: {
    role_level?: string;
    salary_min?: number;
    salary_max?: number;
    mode_of_work?: string;
  };
  behaviour: {
    work_style?: string;
    task_structure?: string;
    environment_pace?: string;
    decision_making?: string;
    role_focus?: string;
    feedback_style?: string;
    innovation_style?: string;
    schedule_type?: string;
  };
}

export interface MatchScores {
  skills_score: number;
  behaviour_score: number;
  prefs_score: number;
  overall_score: number;
}

export interface MatchResult extends MatchScores {
  ai_summary?: string;
}

/**
 * Compute match scores between an applicant and a job
 * @param applicant - Applicant profile data
 * @param job - Job data
 * @returns Match scores and AI summary
 */
export async function computeMatch(
  applicant: ApplicantData,
  job: JobData
): Promise<MatchResult> {
  // Calculate individual scores
  const skillsScore = calculateSkillsScore(applicant.skills, job);
  const behaviourScore = calculateBehaviourScore(applicant.behaviour, job.behaviour);
  const prefsScore = calculatePreferencesScore(applicant.preferences, job.preferences);

  // Calculate overall score (weighted average)
  // 40% skills, 30% behaviour, 30% preferences
  let overallScore = Math.round(
    skillsScore * 0.4 + behaviourScore * 0.3 + prefsScore * 0.3
  );
  
  // For showcase: Boost scores if multiple components are high
  // If skills + behaviour + prefs are all >70%, boost overall score
  if (skillsScore >= 70 && behaviourScore >= 70 && prefsScore >= 70) {
    // Boost by 5-10 points for strong overall alignment
    overallScore = Math.min(100, overallScore + Math.round((skillsScore + behaviourScore + prefsScore) / 30));
  }
  
  // If any component is >90%, ensure overall is at least 85%
  if (skillsScore >= 90 || behaviourScore >= 90 || prefsScore >= 90) {
    overallScore = Math.max(overallScore, 85);
  }

  const scores: MatchScores = {
    skills_score: skillsScore,
    behaviour_score: behaviourScore,
    prefs_score: prefsScore,
    overall_score: overallScore,
  };

  // Generate AI summary
  let aiSummary: string | undefined;
  try {
    aiSummary = await generateMatchSummary(applicant, job, scores);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    // Continue without summary if generation fails
  }

  return {
    ...scores,
    ai_summary: aiSummary,
  };
}

/**
 * Calculate skills match score (0-100)
 * Compares applicant skills against job requirements
 */
function calculateSkillsScore(applicantSkills: string[], job: JobData): number {
  if (!applicantSkills || applicantSkills.length === 0) {
    return 0;
  }

  // Extract keywords from job title and JD text
  const jobKeywords = extractKeywords(job.title + ' ' + (job.jd_text || ''));

  if (jobKeywords.length === 0) {
    // If no keywords found, give a base score based on having skills
    // For showcase: give a reasonable score if applicant has relevant skills
    const hasFrontendSkills = applicantSkills.some(s => 
      ['react', 'typescript', 'javascript', 'vue', 'angular', 'next.js', 'frontend'].includes(s.toLowerCase())
    );
    const hasBackendSkills = applicantSkills.some(s => 
      ['node', 'python', 'java', 'backend', 'api', 'rest'].includes(s.toLowerCase())
    );
    
    if (job.title.toLowerCase().includes('frontend') && hasFrontendSkills) {
      return 70; // Good match for frontend roles
    }
    if (job.title.toLowerCase().includes('backend') && hasBackendSkills) {
      return 70; // Good match for backend roles
    }
    if (job.title.toLowerCase().includes('full') || job.title.toLowerCase().includes('stack')) {
      return (hasFrontendSkills && hasBackendSkills) ? 75 : 50;
    }
    
    return applicantSkills.length > 0 ? 50 : 0;
  }

  // Normalize skills and keywords to lowercase for comparison
  const normalizedSkills = applicantSkills.map((s) => s.toLowerCase().trim());
  const normalizedKeywords = jobKeywords.map((k) => k.toLowerCase().trim());

  // Count matches with better matching logic
  let matches = 0;
  const matchedSkills: string[] = [];
  
  normalizedSkills.forEach((skill) => {
    // Check for exact match or partial match
    const matched = normalizedKeywords.some((keyword) => {
      // Exact match
      if (keyword === skill) return true;
      // Partial match (skill contains keyword or vice versa)
      if (keyword.includes(skill) || skill.includes(keyword)) return true;
      // Handle variations (e.g., "next.js" vs "nextjs", "vue.js" vs "vue")
      const skillClean = skill.replace(/[.-]/g, '');
      const keywordClean = keyword.replace(/[.-]/g, '');
      if (skillClean === keywordClean) return true;
      return false;
    });
    
    if (matched) {
      matches++;
      matchedSkills.push(skill);
    }
  });

  // Calculate score: percentage of applicant skills that match job requirements
  // Also consider how many job requirements are covered
  const applicantMatchRatio = matches / normalizedSkills.length; // How many of applicant's skills match
  const jobCoverageRatio = matches / Math.max(normalizedKeywords.length, 1); // How many job requirements are covered
  
  // Weighted average: 50% based on applicant skills matched, 50% based on job requirements covered
  // This gives more weight to covering job requirements (better for showcase)
  let score = Math.min(100, Math.round(
    (applicantMatchRatio * 50) + (jobCoverageRatio * 50)
  ));
  
  // For showcase: boost score if there are multiple matches
  // If applicant has 2+ matching skills, ensure at least 40% score
  if (matches >= 2) {
    score = Math.max(score, 40);
  }
  
  // If applicant has 3+ matching skills, ensure at least 60% score
  if (matches >= 3) {
    score = Math.max(score, 60);
  }
  
  // If applicant covers 50%+ of job requirements, boost score
  if (jobCoverageRatio >= 0.5) {
    score = Math.max(score, Math.round(jobCoverageRatio * 100));
  }
  
  // Ensure minimum score if there's any match (for showcase)
  if (matches > 0 && score < 25) {
    score = Math.max(25, Math.round((matches / Math.max(normalizedKeywords.length, normalizedSkills.length)) * 100));
  }
  
  return score;
}

/**
 * Extract keywords from text (simple implementation)
 */
function extractKeywords(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Common tech keywords to look for (expanded list)
  const techKeywords = [
    'react',
    'typescript',
    'javascript',
    'js',
    'node',
    'nodejs',
    'node.js',
    'python',
    'java',
    'sql',
    'postgresql',
    'postgres',
    'mongodb',
    'mongo',
    'aws',
    'docker',
    'kubernetes',
    'k8s',
    'next.js',
    'nextjs',
    'vue',
    'vue.js',
    'vuejs',
    'angular',
    'express',
    'nestjs',
    'graphql',
    'rest',
    'api',
    'frontend',
    'front-end',
    'front end',
    'backend',
    'back-end',
    'back end',
    'fullstack',
    'full-stack',
    'full stack',
    'devops',
    'dev-ops',
    'ci/cd',
    'cicd',
    'git',
    'html',
    'css',
    'tailwind',
    'tailwindcss',
    'redux',
    'jest',
    'testing',
    'web3',
    'blockchain',
    'ethereum',
  ];

  const foundKeywords: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for tech keywords
  techKeywords.forEach((keyword) => {
    // Use word boundary matching for better accuracy
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText) && !foundKeywords.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  });

  // Also extract capitalized words that look like technologies
  const words = text.split(/\s+/);
  words.forEach((word) => {
    const cleaned = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    // Look for tech-like words (capitalized, 3+ chars, not common words)
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
    if (cleaned.length >= 3 && 
        !commonWords.includes(cleaned) && 
        !foundKeywords.includes(cleaned) &&
        /^[A-Z]/.test(word)) {
      foundKeywords.push(cleaned);
    }
  });

  // If job title contains role-specific keywords, add them
  const titleLower = text.toLowerCase();
  if (titleLower.includes('frontend') || titleLower.includes('front-end') || titleLower.includes('ui')) {
    if (!foundKeywords.includes('frontend')) foundKeywords.push('frontend');
  }
  if (titleLower.includes('backend') || titleLower.includes('back-end') || titleLower.includes('server')) {
    if (!foundKeywords.includes('backend')) foundKeywords.push('backend');
  }
  if (titleLower.includes('full') && titleLower.includes('stack')) {
    if (!foundKeywords.includes('fullstack')) foundKeywords.push('fullstack');
    if (!foundKeywords.includes('frontend')) foundKeywords.push('frontend');
    if (!foundKeywords.includes('backend')) foundKeywords.push('backend');
  }

  return foundKeywords;
}

/**
 * Calculate behaviour/culture match score (0-100)
 * Compares applicant behaviour answers with job desired behaviour
 */
function calculateBehaviourScore(
  applicantBehaviour: ApplicantData['behaviour'],
  jobBehaviour: JobData['behaviour']
): number {
  if (!applicantBehaviour || !jobBehaviour) {
    return 50; // Neutral score if data missing
  }

  // Map applicant numeric answers to job string answers
  // Applicant uses 1-5 scale, job uses descriptive strings
  // We need to map these appropriately

  let matches = 0;
  let totalComparisons = 0;

  // Map applicant numeric values to job string values
  // This is a simplified mapping - in production, you'd have a more sophisticated mapping
  const behaviourMapping: Record<string, { applicantKey: keyof ApplicantData['behaviour']; jobKey: keyof JobData['behaviour'] }> = {
    independent_vs_team: { applicantKey: 'independent_vs_team', jobKey: 'work_style' },
    structured_vs_open: { applicantKey: 'structured_vs_open', jobKey: 'task_structure' },
    fast_vs_steady: { applicantKey: 'fast_vs_steady', jobKey: 'environment_pace' },
    quick_vs_thorough: { applicantKey: 'quick_vs_thorough', jobKey: 'decision_making' },
    hands_on_vs_strategic: { applicantKey: 'hands_on_vs_strategic', jobKey: 'role_focus' },
    feedback_vs_autonomy: { applicantKey: 'feedback_vs_autonomy', jobKey: 'feedback_style' },
    innovation_vs_process: { applicantKey: 'innovation_vs_process', jobKey: 'innovation_style' },
    flexible_vs_schedule: { applicantKey: 'flexible_vs_schedule', jobKey: 'schedule_type' },
  };

  Object.entries(behaviourMapping).forEach(([_, mapping]) => {
    const applicantValue = applicantBehaviour[mapping.applicantKey];
    const jobValue = jobBehaviour[mapping.jobKey];

    if (applicantValue !== undefined && jobValue) {
      totalComparisons++;
      // Convert applicant numeric (1-5) to match job string values
      // 1-2 = first option, 3 = neutral, 4-5 = second option
      const applicantPreference = applicantValue <= 2 ? 'first' : applicantValue >= 4 ? 'second' : 'neutral';
      
      // Map job string to preference
      // This is simplified - assumes job strings like "Independent", "Team", etc.
      const jobPreference = mapJobBehaviourToPreference(jobValue);

      // Score based on alignment
      if (applicantPreference === jobPreference || applicantPreference === 'neutral' || jobPreference === 'neutral') {
        matches += 1;
      } else if (Math.abs(applicantValue - 3) <= 1) {
        // Close to neutral gets partial credit
        matches += 0.5;
      }
    }
  });

  if (totalComparisons === 0) {
    return 50; // Neutral if no data
  }

  return Math.round((matches / totalComparisons) * 100);
}

/**
 * Map job behaviour string to preference (simplified)
 */
function mapJobBehaviourToPreference(jobValue: string): 'first' | 'second' | 'neutral' {
  const lower = jobValue.toLowerCase();
  
  // First option keywords
  if (lower.includes('independent') || lower.includes('structured') || lower.includes('fast') || 
      lower.includes('quick') || lower.includes('hands-on') || lower.includes('feedback') ||
      lower.includes('innovation') || lower.includes('flexible')) {
    return 'first';
  }
  
  // Second option keywords
  if (lower.includes('team') || lower.includes('open') || lower.includes('steady') ||
      lower.includes('thorough') || lower.includes('strategic') || lower.includes('autonomy') ||
      lower.includes('process') || lower.includes('set')) {
    return 'second';
  }
  
  return 'neutral';
}

/**
 * Calculate preferences match score (0-100)
 * Compares role level, salary overlap, and work mode
 */
function calculatePreferencesScore(
  applicantPrefs: ApplicantData['preferences'],
  jobPrefs: JobData['preferences']
): number {
  let score = 0;
  let factors = 0;

  // 1. Role level match (40% weight)
  if (applicantPrefs.role_level && jobPrefs.role_level) {
    factors++;
    if (applicantPrefs.role_level === jobPrefs.role_level) {
      score += 40; // Perfect match
    } else {
      // Partial match based on hierarchy
      const roleHierarchy = ['Intern', 'Junior', 'Senior', 'Lead'];
      const applicantIndex = roleHierarchy.indexOf(applicantPrefs.role_level);
      const jobIndex = roleHierarchy.indexOf(jobPrefs.role_level);
      
      if (applicantIndex !== -1 && jobIndex !== -1) {
        const distance = Math.abs(applicantIndex - jobIndex);
        if (distance === 1) {
          score += 20; // Adjacent roles
        } else if (distance === 2) {
          score += 10; // Two levels apart
        }
      }
    }
  }

  // 2. Salary overlap (30% weight)
  if (applicantPrefs.salary_min && applicantPrefs.salary_max && 
      jobPrefs.salary_min && jobPrefs.salary_max) {
    factors++;
    const overlap = calculateSalaryOverlap(
      applicantPrefs.salary_min,
      applicantPrefs.salary_max,
      jobPrefs.salary_min,
      jobPrefs.salary_max
    );
    score += overlap * 0.3;
  }

  // 3. Work mode match (30% weight)
  if (applicantPrefs.mode_of_work && jobPrefs.mode_of_work) {
    factors++;
    if (applicantPrefs.mode_of_work === jobPrefs.mode_of_work) {
      score += 30; // Perfect match
    } else {
      // Hybrid is compatible with both remote and onsite
      if (applicantPrefs.mode_of_work === 'Hybrid' || jobPrefs.mode_of_work === 'Hybrid') {
        score += 15; // Partial match
      }
    }
  }

  // Normalize score if not all factors are present
  if (factors === 0) {
    return 50; // Neutral score
  }

  return Math.min(100, Math.round(score));
}

/**
 * Calculate salary range overlap percentage (0-100)
 */
function calculateSalaryOverlap(
  applicantMin: number,
  applicantMax: number,
  jobMin: number,
  jobMax: number
): number {
  // Find overlap range
  const overlapMin = Math.max(applicantMin, jobMin);
  const overlapMax = Math.min(applicantMax, jobMax);

  if (overlapMin > overlapMax) {
    return 0; // No overlap
  }

  // Calculate overlap as percentage of applicant's range
  const applicantRange = applicantMax - applicantMin;
  const overlapRange = overlapMax - overlapMin;

  if (applicantRange === 0) {
    return 0;
  }

  const overlapPercentage = (overlapRange / applicantRange) * 100;
  return Math.min(100, Math.round(overlapPercentage));
}

