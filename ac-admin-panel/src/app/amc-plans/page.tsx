import { redirect } from 'next/navigation';

// AMC Plans is not part of the current service flow.
// Redirecting to dashboard to keep navigation clean.
export default function AmcPlansPage() {
  redirect('/dashboard');
}
