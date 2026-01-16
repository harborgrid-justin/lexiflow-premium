/**
 * Case Timeline Route
 */

import { CaseTimeline } from "@/routes/cases/components/detail/CaseTimeline";

export default function CaseTimelineRoute() {
  return <CaseTimeline />;
}

export function meta() {
  return [{ title: "Case - Timeline" }];
}
