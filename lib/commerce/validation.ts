import type { CheckoutDraft, ShippingAddress } from "./types";

export type FieldErrors = Partial<Record<string, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PINCODE = /^[1-9][0-9]{5}$/;

/** Indian mobile numbers: 10 digits starting 6-9, with optional +91 / 0 prefix. */
export function normalisePhone(raw: string): string {
  return raw.replace(/[^\d]/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

export function validatePincode(value: string): string | undefined {
  if (!value.trim()) return "PIN code is required.";
  if (!PINCODE.test(value.trim())) return "Enter a valid 6-digit PIN code.";
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  const digits = normalisePhone(value);
  if (!digits) return "Phone number is required.";
  if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit mobile number.";
  return undefined;
}

export function validateAddress(address: ShippingAddress): FieldErrors {
  const errors: FieldErrors = {};

  if (!address.fullName.trim()) errors.fullName = "Name is required.";
  else if (address.fullName.trim().length < 3) errors.fullName = "Enter your full name.";

  const phoneError = validatePhone(address.phone);
  if (phoneError) errors.phone = phoneError;

  if (!address.line1.trim()) errors.line1 = "Address is required.";
  else if (address.line1.trim().length < 6) errors.line1 = "Enter the full street address.";

  const pincodeError = validatePincode(address.pincode);
  if (pincodeError) errors.pincode = pincodeError;

  if (!address.city.trim()) errors.city = "City is required.";
  if (!address.state.trim()) errors.state = "State is required.";

  return errors;
}

/** Everything the Place order button gates on. */
export function validateDraft(draft: CheckoutDraft): FieldErrors {
  const errors: FieldErrors = { ...validateAddress(draft.address) };
  const emailError = validateEmail(draft.email);
  if (emailError) errors.email = emailError;
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;
