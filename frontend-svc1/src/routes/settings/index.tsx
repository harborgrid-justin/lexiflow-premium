/**
 * Settings Page - Redirects to Profile
 *
 * This page provides a redirect from /settings to /profile
 * to maintain backwards compatibility while avoiding duplicate route IDs.
 */

import { redirect } from 'react-router';
import type { Route } from './+types/index';

export async function loader(_args: Route.LoaderArgs) {
  // Redirect /settings to /profile
  return redirect('/profile');
}

export default function SettingsRedirect() {
  // This component should never render due to the redirect
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: 'Settings - LexiFlow' },
];
