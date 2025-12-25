const EXT_BASE = 'https://yourapp.com/fhir/StructureDefinition';

const EXT = {
  engagement: `${EXT_BASE}/engagement`,
  media: `${EXT_BASE}/media`,
  consultationFee: `${EXT_BASE}/consultation-fee`,
  specialties: `${EXT_BASE}/specialties`,
  isPopular: `${EXT_BASE}/isPopular`,
  isTopDoctor: `${EXT_BASE}/isTopDoctor`,
  amenities: `${EXT_BASE}/amenities`,
  languages: `${EXT_BASE}/languages`,
  experienceYears: `${EXT_BASE}/experienceYears`
};

function getExtension(resource, url) {
  const exts = resource?.extension || [];
  return exts.find((e) => e.url === url);
}

function upsertExtension(resource, extObj) {
  if (!resource.extension) resource.extension = [];
  const idx = resource.extension.findIndex((e) => e.url === extObj.url);
  if (idx >= 0) resource.extension[idx] = extObj;
  else resource.extension.push(extObj);
}

function ensureEngagement(resource) {
  let engagement = getExtension(resource, EXT.engagement);
  if (!engagement) {
    engagement = { url: EXT.engagement, extension: [] };
    upsertExtension(resource, engagement);
  }
  if (!engagement.extension) engagement.extension = [];
  return engagement;
}

function setEngagementCounters(resource, { likesCount, commentsCount, viewsCount, averageRating, ratingsCount }) {
  const engagement = ensureEngagement(resource);
  const map = new Map(engagement.extension.map((e) => [e.url, e]));

  const write = (key, valueField, value) => {
    if (value === undefined) return;
    const url = key;
    const obj = { url, [valueField]: value };
    map.set(url, obj);
  };

  write('likesCount', 'valueUnsignedInt', likesCount);
  write('commentsCount', 'valueUnsignedInt', commentsCount);
  write('viewsCount', 'valueUnsignedInt', viewsCount);
  write('averageRating', 'valueDecimal', averageRating);
  write('ratingsCount', 'valueUnsignedInt', ratingsCount);

  engagement.extension = Array.from(map.values());
}

module.exports = { EXT, getExtension, upsertExtension, setEngagementCounters };
