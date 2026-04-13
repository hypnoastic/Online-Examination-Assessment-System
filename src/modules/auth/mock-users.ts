import type { AuthUserRecord } from "@/modules/auth/types";

export const sharedDemoPassword = "OeasDemo@123";

const sharedDemoPasswordHash =
  "$2b$10$vrDadlT5U74biZ9Dk.xGi.Hm/uBdRtU1mjTmoYuGhZdtonSPC2Awm";

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
