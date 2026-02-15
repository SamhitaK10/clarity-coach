import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { RecordingPage } from "./pages/recording-page";
import { ProcessingPage } from "./pages/processing-page";
import { ResultsPage } from "./pages/results-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/record",
    Component: RecordingPage,
  },
  {
    path: "/processing",
    Component: ProcessingPage,
  },
  {
    path: "/results",
    Component: ResultsPage,
  },
]);
