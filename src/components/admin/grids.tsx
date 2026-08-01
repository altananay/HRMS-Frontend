'use client';

import { useRouter } from 'next/navigation';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import type { GridColDef } from '@mui/x-data-grid';
import { useFormatter, useTranslations } from 'next-intl';

import type {
  ContactResponse,
  CvResponse,
  EmployerResponse,
  JobAdvertisementResponse,
  JobApplicationResponse,
  JobSeekerResponse,
  SystemStaffResponse,
  UserSummaryResponse,
} from '@/contracts/responses';

import { ContactHandledToggle } from './ContactHandledToggle';
import { DeleteRecordButton } from './DeleteRecordButton';
import { ServerDataGrid } from './ServerDataGrid';

type Page<T> = { items: T[]; totalCount: number; page: number; pageSize: number };

function useCommon() {
  const t = useTranslations('admin');
  const columns = useTranslations('admin.columns');
  const format = useFormatter();

  return { t, columns, format };
}

function dateColumn<Row extends object>(
  field: keyof Row & string,
  headerName: string,
  format: ReturnType<typeof useFormatter>,
): GridColDef<Row> {
  return {
    field,
    headerName,
    width: 140,
    renderCell: ({ row }) => {
      const value = row[field as keyof Row];
      return typeof value === 'string' ? format.dateTime(new Date(value), 'short') : '';
    },
  };
}

function StatusChip({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <Chip
      label={active ? activeLabel : inactiveLabel}
      size="small"
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
    />
  );
}

export function UsersGrid({ page }: { page: Page<UserSummaryResponse> }) {
  const { t, columns, format } = useCommon();

  const cols: GridColDef<UserSummaryResponse>[] = [
    { field: 'email', headerName: columns('email'), flex: 1, minWidth: 220 },
    { field: 'userType', headerName: columns('userType'), width: 130 },
    {
      field: 'isActive',
      headerName: columns('status'),
      width: 110,
      renderCell: ({ row }) => (
        <StatusChip active={row.isActive} activeLabel={t('active')} inactiveLabel={t('inactive')} />
      ),
    },
    dateColumn<UserSummaryResponse>('createdAt', columns('createdAt'), format),
  ];

  return (
    <ServerDataGrid
      rows={page.items}
      columns={cols}
      rowCount={page.totalCount}
      page={page.page}
      pageSize={page.pageSize}
    />
  );
}

export function JobSeekersGrid({ page }: { page: Page<JobSeekerResponse> }) {
  const { t, columns, format } = useCommon();

  const cols: GridColDef<JobSeekerResponse>[] = [
    {
      field: 'firstName',
      headerName: columns('name'),
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => `${row.firstName} ${row.lastName}`,
    },
    { field: 'email', headerName: columns('email'), flex: 1, minWidth: 220 },
    {
      field: 'isActive',
      headerName: columns('status'),
      width: 110,
      renderCell: ({ row }) => (
        <StatusChip active={row.isActive} activeLabel={t('active')} inactiveLabel={t('inactive')} />
      ),
    },
    dateColumn<JobSeekerResponse>('createdAt', columns('createdAt'), format),
    {
      field: 'id',
      headerName: columns('actions'),
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <DeleteRecordButton
          path={`JobSeekers/deletebyid/${row.id}`}
          label={`${row.firstName} ${row.lastName}`}
        />
      ),
    },
  ];

  return (
    <ServerDataGrid
      rows={page.items}
      columns={cols}
      rowCount={page.totalCount}
      page={page.page}
      pageSize={page.pageSize}
    />
  );
}

export function EmployersGrid({ page }: { page: Page<EmployerResponse> }) {
  const { t, columns } = useCommon();
  const router = useRouter();

  const cols: GridColDef<EmployerResponse>[] = [
    { field: 'companyName', headerName: columns('company'), flex: 1, minWidth: 200 },
    { field: 'email', headerName: columns('email'), flex: 1, minWidth: 200 },
    { field: 'numberOfEmployees', headerName: columns('employees'), width: 110 },
    {
      field: 'sectors',
      headerName: columns('sectors'),
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
          {row.sectors.slice(0, 2).map((sector) => (
            <Chip key={sector} label={sector} size="small" variant="outlined" />
          ))}
        </Stack>
      ),
    },
    {
      field: 'isActive',
      headerName: columns('status'),
      width: 110,
      renderCell: ({ row }) => (
        <StatusChip active={row.isActive} activeLabel={t('active')} inactiveLabel={t('inactive')} />
      ),
    },
    {
      field: 'id',
      headerName: columns('actions'),
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <DeleteRecordButton path={`Employers/deletebyid/${row.id}`} label={row.companyName} />
      ),
    },
  ];

  return (
    <ServerDataGrid
      rows={page.items}
      columns={cols}
      rowCount={page.totalCount}
      page={page.page}
      pageSize={page.pageSize}
      onRowClick={(row) => router.push(`/companies/${row.id}`)}
    />
  );
}

export function SystemStaffGrid({ page }: { page: Page<SystemStaffResponse> }) {
  const { t, columns, format } = useCommon();

  const cols: GridColDef<SystemStaffResponse>[] = [
    {
      field: 'firstName',
      headerName: columns('name'),
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => `${row.firstName} ${row.lastName}`,
    },
    { field: 'email', headerName: columns('email'), flex: 1, minWidth: 220 },
    {
      field: 'isActive',
      headerName: columns('status'),
      width: 110,
      renderCell: ({ row }) => (
        <StatusChip active={row.isActive} activeLabel={t('active')} inactiveLabel={t('inactive')} />
      ),
    },
    dateColumn<SystemStaffResponse>('createdAt', columns('createdAt'), format),
    {
      field: 'id',
      headerName: columns('actions'),
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <DeleteRecordButton
          path={`SystemStaffs/deletebyid/${row.id}`}
          label={`${row.firstName} ${row.lastName}`}
        />
      ),
    },
  ];

  return (
    <ServerDataGrid
      rows={page.items}
      columns={cols}
      rowCount={page.totalCount}
      page={page.page}
      pageSize={page.pageSize}
    />
  );
}

export function JobAdvertisementsGrid({ page }: { page: Page<JobAdvertisementResponse> }) {
  const { t, columns, format } = useCommon();
  const router = useRouter();

  const cols: GridColDef<JobAdvertisementResponse>[] = [
    { field: 'title', headerName: columns('title'), flex: 1, minWidth: 200 },
    { field: 'companyName', headerName: columns('company'), flex: 1, minWidth: 160 },
    { field: 'jobPositionName', headerName: columns('position'), width: 160 },
    { field: 'city', headerName: columns('city'), width: 120 },
    {
      field: 'deadline',
      headerName: columns('deadline'),
      width: 130,
      renderCell: ({ row }) => format.dateTime(new Date(row.deadline), 'short'),
    },
    {
      field: 'isActive',
      headerName: columns('status'),
      width: 110,
      renderCell: ({ row }) => (
        <StatusChip active={row.isActive} activeLabel={t('active')} inactiveLabel={t('inactive')} />
      ),
    },
    {
      field: 'id',
      headerName: columns('actions'),
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <DeleteRecordButton path={`JobAdvertisements/deletebyid/${row.id}`} label={row.title} />
      ),
    },
  ];

  return (
    <ServerDataGrid
      rows={page.items}
      columns={cols}
      rowCount={page.totalCount}
      page={page.page}
      pageSize={page.pageSize}
      onRowClick={(row) => router.push(`/jobs/${row.id}`)}
    />
  );
}

export function JobApplicationsGrid({ page }: { page: Page<JobApplicationResponse> }) {
  const { columns, format } = useCommon();
  const status = useTranslations('applications.status');

  const cols: GridColDef<JobApplicationResponse>[] = [
    { field: 'jobSeekerFullName', headerName: columns('applicant'), flex: 1, minWidth: 180 },
    { field: 'jobAdvertisementTitle', headerName: columns('advertisement'), flex: 1, minWidth: 200 },
    {
      field: 'status',
      headerName: columns('status'),
      width: 160,
      renderCell: ({ row }) => <Chip label={status(row.status)} size="small" />,
    },
    dateColumn<JobApplicationResponse>('createdAt', columns('appliedAt'), format),
    {
      field: 'id',
      headerName: columns('actions'),
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <DeleteRecordButton
          path={`JobApplications/deletebyid/${row.id}`}
          label={`${row.jobSeekerFullName} · ${row.jobAdvertisementTitle}`}
        />
      ),
    },
  ];

  return (
    <ServerDataGrid
      rows={page.items}
      columns={cols}
      rowCount={page.totalCount}
      page={page.page}
      pageSize={page.pageSize}
    />
  );
}

export function CvsGrid({ page }: { page: Page<CvResponse> }) {
  const { columns, format } = useCommon();

  const cols: GridColDef<CvResponse>[] = [
    {
      field: 'firstName',
      headerName: columns('owner'),
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => `${row.firstName} ${row.lastName}`,
    },
    { field: 'email', headerName: columns('email'), flex: 1, minWidth: 200 },
    {
      field: 'skills',
      headerName: columns('skills'),
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
          {row.skills.slice(0, 3).map((skill) => (
            <Chip key={skill} label={skill} size="small" variant="outlined" />
          ))}
        </Stack>
      ),
    },
    dateColumn<CvResponse>('createdAt', columns('createdAt'), format),
    {
      field: 'id',
      headerName: columns('actions'),
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <DeleteRecordButton
          path={`Cvs/deletecv/${row.id}`}
          label={`${row.firstName} ${row.lastName}`}
        />
      ),
    },
  ];

  return (
    <ServerDataGrid
      rows={page.items}
      columns={cols}
      rowCount={page.totalCount}
      page={page.page}
      pageSize={page.pageSize}
    />
  );
}

export function ContactsGrid({ page }: { page: Page<ContactResponse> }) {
  const { columns, format } = useCommon();

  const cols: GridColDef<ContactResponse>[] = [
    { field: 'subject', headerName: columns('subject'), flex: 1, minWidth: 200 },
    {
      field: 'firstName',
      headerName: columns('sender'),
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => `${row.firstName} ${row.lastName} · ${row.email}`,
    },
    dateColumn<ContactResponse>('createdAt', columns('sentAt'), format),
    {
      field: 'isHandled',
      headerName: columns('status'),
      width: 190,
      sortable: false,
      renderCell: ({ row }) => <ContactHandledToggle contact={row} />,
    },
    {
      field: 'id',
      headerName: columns('actions'),
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <DeleteRecordButton path={`Contacts/${row.id}`} label={row.subject} />
      ),
    },
  ];

  return (
    <ServerDataGrid
      rows={page.items}
      columns={cols}
      rowCount={page.totalCount}
      page={page.page}
      pageSize={page.pageSize}
    />
  );
}
