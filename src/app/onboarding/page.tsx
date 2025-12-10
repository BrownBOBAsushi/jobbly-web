// app/onboarding/page.tsx
import { redirect } from 'next/navigation';

export default function OnboardingRootPage() {
  // Always start the flow at the first step
  redirect('/onboarding/profile');
}