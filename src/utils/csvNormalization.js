export const HEADER_MAP = {
  firstName: [
    "firstname",
    "first name",
    "first_name",
    "fname",
    "f name",
    "firsname",
    "firtsname",
  ],
  lastName: [
    "lastname",
    "last name",
    "last_name",
    "surname",
    "lname",
    "l name",
  ],
  email: ["email", "e-mail", "mail"],
  company: ["company", "company name", "organization", "org"],
  checkedIn: [
    "checkedin",
    "checked in",
    "checkin",
    "check in",
    "ischeckedin",
  ],
};

const HEADER_LOOKUP = (() => {
  const lookup = new Map();

  const normalizeKey = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

  Object.entries(HEADER_MAP).forEach(([field, variations]) => {
    [field, ...variations].forEach((variant) => {
      const normalized = normalizeKey(variant);
      if (normalized) {
        lookup.set(normalized, field);
      }
    });
  });

  return lookup;
})();

const sanitizeHeader = (header) => {
  if (typeof header !== "string") return "";
  return header.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
};

const TRUTHY_CHECKED_IN_VALUES = new Set(["true", "1", "yes"]);

const toTrimmedString = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
};

export const normalizeHeader = (header) => {
  const sanitized = sanitizeHeader(header);
  if (!sanitized) return null;
  return HEADER_LOOKUP.get(sanitized) || null;
};

export const buildHeaderMapping = (headers = []) => {
  return headers.reduce((mapping, header) => {
    const normalized = normalizeHeader(header);
    if (normalized) {
      mapping[header] = normalized;
    }
    return mapping;
  }, {});
};

const parseCheckedInValue = (value) => {
  if (typeof value === "boolean") return value;
  const normalized = toTrimmedString(value).toLowerCase();
  if (!normalized) return false;
  return TRUTHY_CHECKED_IN_VALUES.has(normalized);
};

export const normalizeRow = (row = {}, headerMapping = {}) => {
  const normalized = {
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    checkedIn: false,
  };

  Object.entries(headerMapping).forEach(([originalHeader, fieldName]) => {
    const rawValue = row[originalHeader];

    if (fieldName === "checkedIn") {
      normalized.checkedIn = parseCheckedInValue(rawValue);
      return;
    }

    const value = toTrimmedString(rawValue);
    if (!value) return;

    if (fieldName in normalized) {
      normalized[fieldName] = value;
    }
  });

  return normalized;
};
