import { describe, expect, it } from 'vitest';

import type { CvResponse } from '@/contracts/responses';

import { cvSchema, fromCvResponse, toUpdateCvRequest } from './cv';

const t = (key: string) => key;

const fullCv: CvResponse = {
  id: '018f4a2b-9c1d-7e3f-8a4b-000000000001',
  jobSeekerId: '018f4a2b-9c1d-7e3f-8a4b-000000000002',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.test',
  dateOfBirth: '1990-12-10',
  information: 'Backend geliştirici.',
  imageUrl: 'https://cdn.example/ada.png',
  hobbies: 'Satranç',
  skills: ['C#', 'PostgreSQL'],
  socialMedia: { github: 'https://github.com/ada', linkedin: null, webSite: null },
  educations: [
    {
      id: 'e1',
      school: 'ODTÜ',
      major: 'Bilgisayar Mühendisliği',
      grade: '3.4',
      startYear: 2008,
      endYear: 2012,
      isGraduated: true,
    },
  ],
  jobExperiences: [
    {
      id: 'x1',
      companyName: 'Kuzey Yazılım',
      department: 'Platform',
      position: 'Senior Developer',
      startYear: 2015,
      endYear: null,
      description: 'Ödeme servisleri.',
    },
  ],
  languages: [{ id: 'l1', name: 'İngilizce', level: 'Advanced' }],
  projects: [{ id: 'p1', name: 'hrms', description: null }],
  files: [],
  createdAt: '2026-01-01T00:00:00Z',
};

describe('the full-replacement round trip', () => {
  it('should_PreserveEverySection_WhenLoadedAndSavedUnchanged', () => {
    const parsed = cvSchema(t).parse(fromCvResponse(fullCv));
    const request = toUpdateCvRequest(parsed, fullCv);

    expect(request.educations).toHaveLength(1);
    expect(request.jobExperiences).toHaveLength(1);
    expect(request.languages).toHaveLength(1);
    expect(request.projects).toHaveLength(1);
    expect(request.skills).toEqual(['C#', 'PostgreSQL']);

    expect(request.educations[0]).toMatchObject({
      school: 'ODTÜ',
      major: 'Bilgisayar Mühendisliği',
      grade: '3.4',
      startYear: 2008,
      endYear: 2012,
      isGraduated: true,
    });

    expect(request.jobExperiences[0]).toMatchObject({
      companyName: 'Kuzey Yazılım',
      position: 'Senior Developer',
      startYear: 2015,
      endYear: null,
    });
  });

  it('should_CarryTheImageUrlThrough_EvenThoughNoFieldShowsIt', () => {
    const parsed = cvSchema(t).parse(fromCvResponse(fullCv));

    expect(toUpdateCvRequest(parsed, fullCv).imageUrl).toBe('https://cdn.example/ada.png');
  });

  it('should_SendEmptyStringsAsNull_NotAsEmptyStrings', () => {
    const parsed = cvSchema(t).parse(fromCvResponse(fullCv));
    const request = toUpdateCvRequest(parsed, fullCv);

    expect(request.socialMedia).toEqual({
      github: 'https://github.com/ada',
      linkedin: null,
      webSite: null,
    });
    expect(request.projects[0]?.description).toBeNull();
  });

  it('should_RoundTripAnEmptyCv', () => {
    const bare: CvResponse = {
      ...fullCv,
      information: null,
      imageUrl: null,
      hobbies: null,
      skills: [],
      socialMedia: null,
      educations: [],
      jobExperiences: [],
      languages: [],
      projects: [],
    };

    const request = toUpdateCvRequest(cvSchema(t).parse(fromCvResponse(bare)), bare);

    expect(request).toMatchObject({
      information: null,
      hobbies: null,
      skills: [],
      educations: [],
      jobExperiences: [],
    });
  });
});

describe('cvSchema', () => {
  const parse = (overrides: Record<string, unknown>) =>
    cvSchema(t).safeParse({ ...fromCvResponse(fullCv), ...overrides });

  it('should_RejectAnEducationWithoutASchool', () => {
    const result = parse({
      educations: [{ school: '', major: 'x', grade: '', startYear: '', endYear: '', isGraduated: false }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.required');
  });

  it('should_RejectAnEndYearBeforeTheStartYear', () => {
    const result = parse({
      educations: [
        { school: 'x', major: 'y', grade: '', startYear: '2015', endYear: '2010', isGraduated: false },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['educations', 0, 'endYear']);
  });

  it('should_AcceptAnOpenEndedExperience', () => {
    expect(
      parse({
        jobExperiences: [
          { companyName: 'x', department: '', position: 'y', startYear: '2015', endYear: '', description: '' },
        ],
      }).success,
    ).toBe(true);
  });

  it('should_RejectANonNumericYear', () => {
    const result = parse({
      educations: [
        { school: 'x', major: 'y', grade: '', startYear: 'iki bin', endYear: '', isGraduated: false },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('should_CoerceYearStringsToNumbers', () => {
    const result = parse({
      educations: [
        { school: 'x', major: 'y', grade: '', startYear: '2008', endYear: '2012', isGraduated: true },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data?.educations[0]?.startYear).toBe(2008);
  });
});
