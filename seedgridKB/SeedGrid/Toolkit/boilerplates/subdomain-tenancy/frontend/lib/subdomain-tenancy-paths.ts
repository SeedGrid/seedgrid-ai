export const SubdomainTenancyPaths = {
  signup: {
    base: "/public/tenants",
    confirmEmail: "/public/tenants/validate-email",
    resendEmail: "/public/tenants/resend-email",
  },
} as const;
