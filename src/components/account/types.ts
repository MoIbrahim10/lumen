export type AccountSurfaceStyle = {
  buttonClass: string;
  panelClass: string;
  panelInnerClass: string;
};

export type AccountProfile = {
  name: string;
  email: string;
  bio: string;
  role: string;
};

export type WorkspaceAccount = {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Plus" | "Pro";
};

export type WorkspacePlan = "Free" | "Plus" | "Pro";
