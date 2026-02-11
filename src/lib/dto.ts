import type { School, SelectionSession, Student } from '@/lib/types';

type RowLike = Record<string, unknown>;

export function toStudentDto(row: RowLike): Student {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    contact_info: row.contact_info ? String(row.contact_info) : null,
  };
}

export function toSchoolDto(row: RowLike): School {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    location: row.location ? String(row.location) : null,
    capacity: Number(row.capacity ?? 0),
  };
}

export function toSelectionSessionDto(row: RowLike): SelectionSession {
  return {
    id: Number(row.id),
    created_at: String(row.created_at ?? ''),
    status: row.status === 'completed' ? 'completed' : 'pending',
  };
}
