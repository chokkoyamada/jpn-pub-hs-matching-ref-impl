import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { GET as getStudents, POST as postStudents } from '../../src/app/api/students/route';
import { GET as getSchools, POST as postSchools } from '../../src/app/api/schools/route';
import { GET as getSessions } from '../../src/app/api/admin/sessions/route';
import { GET as getStudentById } from '../../src/app/api/students/[id]/route';
import { GET as getSchoolById } from '../../src/app/api/schools/[id]/route';
import { GET as getSessionById } from '../../src/app/api/admin/sessions/[id]/route';

async function json(response) {
  return await response.json();
}

describe('API smoke', () => {
  it('returns 200 on key collection APIs', async () => {
    await expect(getStudents()).resolves.toHaveProperty('status', 200);
    await expect(getSchools()).resolves.toHaveProperty('status', 200);
    await expect(getSessions()).resolves.toHaveProperty('status', 200);
  });

  it('returns validation errors on invalid IDs', async () => {
    const studentRes = await getStudentById(
      new NextRequest('http://localhost/api/students/not-a-number'),
      { params: Promise.resolve({ id: 'not-a-number' }) }
    );
    const schoolRes = await getSchoolById(
      new NextRequest('http://localhost/api/schools/not-a-number'),
      { params: Promise.resolve({ id: 'not-a-number' }) }
    );
    const sessionRes = await getSessionById(
      new NextRequest('http://localhost/api/admin/sessions/not-a-number'),
      { params: Promise.resolve({ id: 'not-a-number' }) }
    );

    expect(studentRes.status).toBe(400);
    expect(schoolRes.status).toBe(400);
    expect(sessionRes.status).toBe(400);
  });

  it('returns not found for non-existing IDs', async () => {
    const studentRes = await getStudentById(
      new NextRequest('http://localhost/api/students/999999'),
      { params: Promise.resolve({ id: '999999' }) }
    );
    const schoolRes = await getSchoolById(
      new NextRequest('http://localhost/api/schools/999999'),
      { params: Promise.resolve({ id: '999999' }) }
    );
    const sessionRes = await getSessionById(
      new NextRequest('http://localhost/api/admin/sessions/999999'),
      { params: Promise.resolve({ id: '999999' }) }
    );

    expect(studentRes.status).toBe(404);
    expect(schoolRes.status).toBe(404);
    expect(sessionRes.status).toBe(404);
  });

  it('validates payload constraints', async () => {
    const invalidSchoolReq = new NextRequest('http://localhost/api/schools', {
      method: 'POST',
      body: JSON.stringify({ name: 'x', capacity: 0 }),
      headers: { 'content-type': 'application/json' },
    });
    const invalidStudentReq = new NextRequest('http://localhost/api/students', {
      method: 'POST',
      body: JSON.stringify({ contact_info: 'only-contact' }),
      headers: { 'content-type': 'application/json' },
    });

    const schoolRes = await postSchools(invalidSchoolReq);
    const studentRes = await postStudents(invalidStudentReq);

    expect(schoolRes.status).toBe(400);
    expect(studentRes.status).toBe(400);

    const schoolBody = await json(schoolRes);
    const studentBody = await json(studentRes);
    expect(schoolBody.success).toBe(false);
    expect(studentBody.success).toBe(false);
  });
});
