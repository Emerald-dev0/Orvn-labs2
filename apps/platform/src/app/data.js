/**
 * Front-end demo data. Every screen renders from here until the database is wired.
 * Nothing in this file is fetched, and nothing on screen claims to be live.
 */

export const workspace = {
  id: 'ws_northaven',
  name: 'Northaven Property Group',
  handle: 'northaven',
  publicUrl: 'orvnlabs.com/w/northaven',
  plan: 'Private beta',
  owner: { name: 'Ada Bello', email: 'ada@northaven.example', initials: 'AB' },
};

export const stats = [
  { label: 'Site views', value: '1,284', delta: '+12%', trend: 'up', note: 'last 30 days' },
  { label: 'Property views', value: '3,120', delta: '+8%', trend: 'up', note: 'last 30 days' },
  { label: 'Inquiries', value: '6', delta: '+2', trend: 'up', note: 'last 30 days' },
  { label: 'Published', value: '2', delta: 'of 4', trend: 'flat', note: 'properties live' },
];

export const properties = [
  {
    id: 'halden-house',
    title: 'Halden House',
    place: 'Harbour district',
    type: 'Residential',
    price: '$480,000',
    priceVisibility: 'public',
    status: 'published',
    cover: '/images/interior-1.jpg',
    views: 412,
    inquiries: 3,
    updated: '2 hours ago',
    completeness: 92,
    nextAction: 'Nothing waiting. Last published 3 days ago.',
    facts: [
      { key: 'Asking price', value: '$480,000', source: 'Your brief', state: 'approved', public: true },
      { key: 'Bedrooms', value: '4', source: 'Your brief', state: 'approved', public: true },
      { key: 'Bathrooms', value: '3', source: 'Your brief', state: 'approved', public: true },
      { key: 'Internal area', value: '620 m²', source: 'Floor plan PDF', state: 'approved', public: true },
      { key: 'Lot size', value: '0.34 ha', source: 'Floor plan PDF', state: 'approved', public: true },
      { key: 'Parcel ID', value: '0042-118-07', source: 'Title document', state: 'approved', public: false },
      { key: 'Zoning', value: 'Residential low density', source: 'Council extract', state: 'unreviewed', public: false },
      { key: 'Service charge', value: '$4,200 per year', source: 'Developer note', state: 'approved', public: true },
    ],
  },
  {
    id: 'kestrel-row',
    title: 'Kestrel Row',
    place: 'Northbank',
    type: 'Residential',
    price: '$210,000',
    priceVisibility: 'public',
    status: 'needs_review',
    cover: '/images/prop-2.jpg',
    views: 0,
    inquiries: 0,
    updated: 'Yesterday',
    completeness: 74,
    nextAction: 'Two values disagree with your notes. Resolve them before publishing.',
    facts: [
      { key: 'Asking price', value: '$210,000', source: 'Your notes', state: 'approved', public: true },
      { key: 'Asking price (file)', value: '$215,000', source: 'Brochure.pdf', state: 'unreviewed', public: false },
      { key: 'Bedrooms', value: '3', source: 'Your notes', state: 'approved', public: true },
      { key: 'Bathrooms', value: '2', source: 'Your notes', state: 'approved', public: true },
      { key: 'Internal area', value: '184 m²', source: 'Brochure.pdf', state: 'approved', public: true },
      { key: 'Parcel ID', value: '0042-201-14', source: 'Title document', state: 'approved', public: false },
      { key: 'Flood zone', value: '', source: '—', state: 'unknown', public: false },
    ],
  },
  {
    id: 'elm-court',
    title: 'Elm Court',
    place: 'Old town',
    type: 'Residential',
    price: 'Price on request',
    priceVisibility: 'on_request',
    status: 'draft',
    cover: '/images/prop-4.jpg',
    views: 0,
    inquiries: 0,
    updated: '3 days ago',
    completeness: 41,
    nextAction: 'Add photographs and approve the description before publishing.',
    facts: [
      { key: 'Asking price', value: '', source: '—', state: 'unknown', public: false },
      { key: 'Bedrooms', value: '2', source: 'Your notes', state: 'approved', public: true },
      { key: 'Internal area', value: '96 m²', source: 'Your notes', state: 'unreviewed', public: false },
    ],
  },
  {
    id: 'harbour-point',
    title: 'Harbour Point',
    place: 'Riverside',
    type: 'Project',
    price: '$1,150,000',
    priceVisibility: 'public',
    status: 'published',
    cover: '/images/prop-5.jpg',
    views: 208,
    inquiries: 1,
    updated: '5 days ago',
    completeness: 88,
    nextAction: 'Nothing waiting.',
    facts: [
      { key: 'Asking price', value: '$1,150,000', source: 'Your brief', state: 'approved', public: true },
      { key: 'Units', value: '6', source: 'Your brief', state: 'approved', public: true },
      { key: 'Tenure', value: 'Freehold', source: 'Title document', state: 'approved', public: true },
    ],
  },
];

export const inquiries = [
  {
    id: 'inq_1',
    name: 'Marta Achebe',
    email: 'marta@example.com',
    propertyId: 'halden-house',
    property: 'Halden House',
    message:
      'Is the garden included in the lot size? I would like to see it this weekend if the owner can do Saturday morning.',
    when: '2 hours ago',
    status: 'new',
  },
  {
    id: 'inq_2',
    name: 'Daniel Osei',
    email: 'daniel@example.com',
    propertyId: 'harbour-point',
    property: 'Harbour Point',
    message: 'Could you send the unit schedule and service charge for the six units?',
    when: 'Yesterday',
    status: 'new',
  },
  {
    id: 'inq_3',
    name: 'Priya Raman',
    email: 'priya@example.com',
    propertyId: 'halden-house',
    property: 'Halden House',
    message: 'We are relocating in March. Is there flexibility on completion date?',
    when: '4 days ago',
    status: 'read',
  },
];

export const activity = [
  { id: 'a1', text: 'Halden House published', detail: 'Version 3 · by you', when: '3 days ago' },
  { id: 'a2', text: 'Kestrel Row needs review', detail: 'Price conflict in Brochure.pdf', when: 'Yesterday' },
  { id: 'a3', text: 'Inquiry received', detail: 'Marta Achebe · Halden House', when: '2 hours ago' },
  { id: 'a4', text: 'Harbour Point photo replaced', detail: 'Cover image', when: '5 days ago' },
];

export const weeklyViews = [
  { day: 'Mon', site: 42, property: 96 },
  { day: 'Tue', site: 51, property: 118 },
  { day: 'Wed', site: 38, property: 84 },
  { day: 'Thu', site: 64, property: 142 },
  { day: 'Fri', site: 58, property: 120 },
  { day: 'Sat', site: 71, property: 168 },
  { day: 'Sun', site: 46, property: 102 },
];

export const topProperties = [
  { id: 'halden-house', title: 'Halden House', views: 412, inquiries: 3, rate: '0.7%' },
  { id: 'harbour-point', title: 'Harbour Point', views: 208, inquiries: 1, rate: '0.5%' },
  { id: 'kestrel-row', title: 'Kestrel Row', views: 0, inquiries: 0, rate: '—' },
  { id: 'elm-court', title: 'Elm Court', views: 0, inquiries: 0, rate: '—' },
];

export function isEmpty(state) {
  return state === 'empty';
}
