import {
  IconBriefcase,
  IconCalendarEvent,
  IconFileText,
  IconListCheck,
  IconShieldLock,
  IconSparkles
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export interface FeatureItem {
  icon: ComponentType<{ size?: number }>;
  title: string;
  text: string;
}

// The six main features (used on the home page and the features page)
export const MAIN_FEATURES: FeatureItem[] = [
  {
    icon: IconBriefcase,
    title: "Post jobs in minutes",
    text: "Write the role, list the skills you need, set a deadline and publish. Save a draft first if you are not ready."
  },
  {
    icon: IconSparkles,
    title: "Skill match with evidence",
    text: "See which required skills appear in each CV, with the sentence they were found in. Missing and unclear skills are listed too."
  },
  {
    icon: IconListCheck,
    title: "A clear hiring pipeline",
    text: "Move every application from Applied to Offered. Each status change is recorded, so you always know what happened."
  },
  {
    icon: IconFileText,
    title: "PDF CVs, read for you",
    text: "Candidates upload a PDF once. The text is read on the server and the skills found are shown, so people can check them."
  },
  {
    icon: IconCalendarEvent,
    title: "Interviews in one place",
    text: "Schedule an interview with a time and a meeting link. The candidate sees it on their own page. Feedback stays private."
  },
  {
    icon: IconShieldLock,
    title: "Private by design",
    text: "CV files are never in a public folder. Candidates see only their own data, and recruiters see only their own company."
  }
];
