import Fuse from "fuse.js";

  // Canonical headers represent the internal fields the rest of the app expects.
const canonicalHeaders = ["firstName", "lastName", "email", "company", "checkedIn"];

  // Fuse.js performs fuzzy searching so we do not have to curate a huge list of synonyms.
const fuse = new Fuse(canonicalHeaders, {
  includeScore: true,
  threshold: 0.4,
  distance: 100,
});

const TRUTHY_CHECKED_IN_VALUES = new Set(["true", "1", "yes"]);

const cleanHeader = (header) => {
  if (typeof header !== "string") return "";
  return header.trim().toLowerCase();
};

const toTrimmedString = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
};

const parseCheckedInValue = (value) => {
  if (typeof value === "boolean") return value;
  const normalized = toTrimmedString(value).toLowerCase();
  if (!normalized) return false;
  return TRUTHY_CHECKED_IN_VALUES.has(normalized);
};

export const normalizeHeader = (header) => {
  const cleaned = cleanHeader(header);
  if (!cleaned) return null;

  // Fuse returns matches sorted by similarity. We keep the top hit if it is confident enough.
  const [match] = fuse.search(cleaned);
  if (match && match.score <= 0.5) {
    return match.item;
  }

  return null;
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

export const normalizeRow = (row = {}, normalizedHeaders = {}) => {
  const normalizedRow = {
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    checkedIn: false,
  };

  Object.entries(row).forEach(([originalHeader, rawValue]) => {
    const canonicalField = normalizedHeaders[originalHeader];
    if (!canonicalField) return;

    if (canonicalField === "checkedIn") {
      normalizedRow.checkedIn = parseCheckedInValue(rawValue);
      return;
    }

    const value = toTrimmedString(rawValue);
    if (value && canonicalField in normalizedRow) {
      normalizedRow[canonicalField] = value;
    }
  });

  return normalizedRow;
};
