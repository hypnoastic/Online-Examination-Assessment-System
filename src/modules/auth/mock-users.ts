import type { AuthUserRecord } from "@/modules/auth/types";

const sharedDemoPasswordHash =
  "$2b$10$rIFYh6g1J9yf6vl3ddSeeuGhjM99EoQ/8WEHxQpIq3GXjKuuYgwHS";

export const mockUsers: AuthUserRecord[] = [
  {
    id: "user_admin_001",
    name: "Aarav Sharma",
    email: "admin@oeas.local",
    role: "ADMIN",
    status: "ACTIVE",
    passwordHash: sharedDemoPasswordHash,
  },
  {
    id: "user_examiner_001",
    name: "Meera Verma",
    email: "examiner@oeas.local",
    role: "EXAMINER",
    status: "ACTIVE",
    passwordHash: sharedDemoPasswordHash,
  },
  {
    id: "user_student_001",
    name: "Rohan Gupta",
    email: "student@oeas.local",
    role: "STUDENT",
    status: "ACTIVE",
    passwordHash: sharedDemoPasswordHash,
  },
  {
    id: "user_student_002",
    name: "Priya Nair",
    email: "inactive.student@oeas.local",
    role: "STUDENT",
    status: "INACTIVE",
    passwordHash: sharedDemoPasswordHash,
  },
];
