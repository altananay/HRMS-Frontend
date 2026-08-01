import 'server-only';

export type AllowedMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type Entry = readonly [AllowedMethod, string];

const ALLOWED: readonly Entry[] = [
  ['GET', 'JobAdvertisements/getall'],
  ['GET', 'JobAdvertisements/getbyid/:guid'],
  ['POST', 'JobAdvertisements/add'],
  ['PUT', 'JobAdvertisements/update'],
  ['DELETE', 'JobAdvertisements/deletebyid/:guid'],

  ['GET', 'JobApplications/getall'],
  ['GET', 'JobApplications/getbyid/:guid'],
  ['POST', 'JobApplications/add'],
  ['PUT', 'JobApplications/update'],
  ['DELETE', 'JobApplications/deletebyid/:guid'],

  ['GET', 'Cvs/getall'],
  ['GET', 'Cvs/getbyjobseekerid/:guid'],
  ['POST', 'Cvs/add'],
  ['PUT', 'Cvs/update'],
  ['DELETE', 'Cvs/deletecv/:guid'],
  ['POST', 'Cvs/uploadfile'],
  ['GET', 'Cvs/files/:guid'],
  ['DELETE', 'Cvs/files/:guid'],

  ['GET', 'Employers/public'],
  ['GET', 'Employers/getbyemployerid/:guid'],
  ['GET', 'Employers/getall'],
  ['GET', 'Employers/getbyemail'],
  ['PUT', 'Employers/update'],
  ['DELETE', 'Employers/deletebyid/:guid'],

  ['GET', 'JobSeekers/getall'],
  ['GET', 'JobSeekers/getbyid/:guid'],
  ['GET', 'JobSeekers/getbyemail'],
  ['PUT', 'JobSeekers/update'],
  ['DELETE', 'JobSeekers/deletebyid/:guid'],

  ['GET', 'SystemStaffs/getall'],
  ['GET', 'SystemStaffs/:guid'],
  ['PUT', 'SystemStaffs/update'],
  ['DELETE', 'SystemStaffs/deletebyid/:guid'],

  ['GET', 'JobPosition/getall'],
  ['GET', 'JobPosition/getbyid/:guid'],
  ['POST', 'JobPosition/addjobposition'],
  ['PUT', 'JobPosition/update'],
  ['DELETE', 'JobPosition/deletebyid/:guid'],

  ['GET', 'Contacts'],
  ['GET', 'Contacts/:guid'],
  ['POST', 'Contacts'],
  ['PUT', 'Contacts/:guid'],
  ['DELETE', 'Contacts/:guid'],

  ['GET', 'Users/getall'],
] as const;

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isAllowed(method: string, segments: readonly string[]): boolean {
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    return false;
  }

  return ALLOWED.some(([allowedMethod, pattern]) => {
    if (allowedMethod !== method) return false;

    const expected = pattern.split('/');
    if (expected.length !== segments.length) return false;

    return expected.every((part, index) => {
      const actual = segments[index] ?? '';
      return part === ':guid' ? GUID.test(actual) : part === actual;
    });
  });
}

export const allowedEntries = ALLOWED;
