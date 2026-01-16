/**
 * Case Parties Route
 */

import { CaseParties } from "@/routes/cases/components/detail/CaseParties";
import { useLoaderData } from "react-router";
import { caseDetailLoader } from "./detail-loader";

export default function CasePartiesRoute() {
  // Option 1: Use parent loader data
  // Option 2: Component uses context. 
  // CaseParties likely uses Context or Props. 
  // Let's check the component signature.
  return <CaseParties />;
}

export function meta() {
  return [{ title: "Case - Parties" }];
}
