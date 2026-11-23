// Holidays & festivals (India). Fixed-date ones work for every year, Easter/Good Friday
// are calculated, and lunar festivals are listed per year (2026-2027).
// To add a year: copy a block in LUNAR below and change the dates.
// Islamic dates depend on moon sighting and can shift by +/- 1 day.
(function () {
  const REL = {
    national:  { label: 'National',  color: '#0d9488' },
    hindu:     { label: 'Hindu',     color: '#ea580c' },
    muslim:    { label: 'Muslim',    color: '#16a34a' },
    christian: { label: 'Christian', color: '#2563eb' },
    sikh:      { label: 'Sikh',      color: '#ca8a04' },
    buddhist:  { label: 'Buddhist',  color: '#9333ea' },
    jain:      { label: 'Jain',      color: '#db2777' },
    parsi:     { label: 'Parsi',     color: '#0891b2' },
  };

  // [MM-DD, name, religion] same every year
  const FIXED = [
    ['01-01', "New Year's Day", 'national'],
    ['01-23', 'Parakram Divas', 'national'],
    ['01-26', 'Republic Day', 'national'],
    ['04-14', 'Ambedkar Jayanti', 'national'],
    ['05-01', 'Labour Day', 'national'],
    ['08-15', 'Independence Day', 'national'],
    ['10-02', 'Gandhi Jayanti', 'national'],
    ['12-24', 'Christmas Eve', 'christian'],
    ['12-25', 'Christmas', 'christian'],
  ];

  // [MM-DD, name, religion] per year
  const LUNAR = {
    2026: [
      ['01-13', 'Lohri', 'hindu'],
      ['01-14', 'Makar Sankranti / Pongal', 'hindu'],
      ['01-15', 'Guru Gobind Singh Jayanti', 'sikh'],
      ['01-23', 'Basant Panchami', 'hindu'],
      ['02-01', 'Guru Ravidas Jayanti', 'sikh'],
      ['02-15', 'Maha Shivratri', 'hindu'],
      ['03-03', 'Holika Dahan', 'hindu'],
      ['03-04', 'Holi', 'hindu'],
      ['03-19', 'Ugadi / Gudi Padwa / Navratri', 'hindu'],
      ['03-21', 'Eid-ul-Fitr', 'muslim'],
      ['03-26', 'Ram Navami', 'hindu'],
      ['03-31', 'Mahavir Jayanti', 'jain'],
      ['04-02', 'Hanuman Jayanti', 'hindu'],
      ['04-14', 'Baisakhi', 'sikh'],
      ['05-01', 'Buddha Purnima', 'buddhist'],
      ['05-28', 'Eid-ul-Adha (Bakrid)', 'muslim'],
      ['06-17', 'Islamic New Year', 'muslim'],
      ['06-26', 'Muharram / Ashura', 'muslim'],
      ['07-16', 'Rath Yatra', 'hindu'],
      ['07-29', 'Guru Purnima', 'hindu'],
      ['08-16', 'Parsi New Year (Navroz)', 'parsi'],
      ['08-26', 'Eid-e-Milad', 'muslim'],
      ['08-26', 'Onam', 'hindu'],
      ['08-28', 'Raksha Bandhan', 'hindu'],
      ['09-04', 'Janmashtami', 'hindu'],
      ['09-14', 'Ganesh Chaturthi', 'hindu'],
      ['10-11', 'Navratri begins', 'hindu'],
      ['10-18', 'Durga Ashtami', 'hindu'],
      ['10-20', 'Dussehra', 'hindu'],
      ['10-29', 'Karwa Chauth', 'hindu'],
      ['11-06', 'Dhanteras', 'hindu'],
      ['11-08', 'Diwali', 'hindu'],
      ['11-09', 'Govardhan Puja', 'hindu'],
      ['11-11', 'Bhai Dooj', 'hindu'],
      ['11-15', 'Chhath Puja', 'hindu'],
      ['11-24', 'Guru Nanak Jayanti', 'sikh'],
    ],
    2027: [
      ['01-14', 'Makar Sankranti', 'hindu'],
      ['01-15', 'Pongal', 'hindu'],
      ['01-15', 'Guru Gobind Singh Jayanti', 'sikh'],
      ['03-06', 'Maha Shivratri', 'hindu'],
      ['03-10', 'Eid-ul-Fitr', 'muslim'],
      ['03-21', 'Holika Dahan', 'hindu'],
      ['03-22', 'Holi', 'hindu'],
      ['04-07', 'Ugadi / Gudi Padwa / Navratri', 'hindu'],
      ['04-14', 'Baisakhi', 'sikh'],
      ['04-15', 'Ram Navami', 'hindu'],
      ['04-19', 'Mahavir Jayanti', 'jain'],
      ['04-20', 'Hanuman Jayanti', 'hindu'],
      ['05-17', 'Eid-ul-Adha (Bakrid)', 'muslim'],
      ['05-20', 'Buddha Purnima', 'buddhist'],
      ['06-16', 'Muharram / Ashura', 'muslim'],
      ['07-18', 'Guru Purnima', 'hindu'],
      ['08-15', 'Eid-e-Milad', 'muslim'],
      ['08-17', 'Raksha Bandhan', 'hindu'],
      ['08-25', 'Janmashtami', 'hindu'],
      ['09-04', 'Ganesh Chaturthi', 'hindu'],
      ['09-12', 'Onam', 'hindu'],
      ['09-30', 'Navratri begins', 'hindu'],
      ['10-07', 'Durga Ashtami', 'hindu'],
      ['10-09', 'Dussehra', 'hindu'],
      ['10-29', 'Diwali', 'hindu'],
      ['11-04', 'Chhath Puja', 'hindu'],
      ['11-14', 'Guru Nanak Jayanti', 'sikh'],
    ],
  };

  const pad = (n) => String(n).padStart(2, '0');

  // Western Easter (Anonymous Gregorian algorithm)
  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }

  const cache = {};
  function build(y) {
    const map = {};
    const add = (md, name, rel) => { (map[`${y}-${md}`] = map[`${y}-${md}`] || []).push({ name, rel }); };
    FIXED.forEach(([md, n, r]) => add(md, n, r));
    (LUNAR[y] || []).forEach(([md, n, r]) => add(md, n, r));
    const e = easter(y);
    const gf = new Date(e); gf.setDate(e.getDate() - 2);
    add(`${pad(gf.getMonth() + 1)}-${pad(gf.getDate())}`, 'Good Friday', 'christian');
    add(`${pad(e.getMonth() + 1)}-${pad(e.getDate())}`, 'Easter', 'christian');
    return map;
  }

  window.HOLIDAY_RELIGIONS = REL;
  window.holidaysOn = function (isoDate) {
    const y = +isoDate.slice(0, 4);
    if (!cache[y]) cache[y] = build(y);
    return cache[y][isoDate] || [];
  };
})();
