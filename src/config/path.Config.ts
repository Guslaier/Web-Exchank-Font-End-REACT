import type { UserRole } from '../types/entities.ts';

export interface IMenu {
  title: string;
  path: string;
  roles: UserRole[];
}

const basePath = '/';

export const Path = {
  DASHBOARD: `${basePath}dashboard`,
  MANAGE_TRANSACTION: `${basePath}manage-transaction`,
  CASH_TRANSFER: `${basePath}cash-transfer`,
  MANAGE_BOOTH: `${basePath}booth`,
  MANAGE_USER: `${basePath}manage-user`,
  EDIT_RATE: `${basePath}edit-rate`,
  REPORT: `${basePath}report`,
  RECORD_TRADING: `${basePath}record-trading`,
  TRANSACTION_ENTRY: `${basePath}transaction-entry`,
  LOGOUT: `${basePath}logout`,
  LOGOUT_CLOSESHIFT: `${basePath}logout-closeshift`,
  LOGON: `${basePath}login`,
} as const;

export const menus: IMenu[] = [
  { title: 'Dashboard', path: Path.DASHBOARD, roles: ['MANAGER'] },
  { title: 'Transaction', path: Path.MANAGE_TRANSACTION, roles: ['MANAGER'] },
  { title: 'Cash Transfer', path: Path.CASH_TRANSFER, roles: ['MANAGER'] },
  { title: 'Manage  Booth', path: Path.MANAGE_BOOTH, roles: ['MANAGER'] },
  { title: 'Manage User', path: Path.MANAGE_USER, roles: ['MANAGER'] },
  { title: 'Edit Rate', path: Path.EDIT_RATE, roles: ['MANAGER'] },
  { title: 'Report & Audit', path: Path.REPORT, roles: ['MANAGER'] },
  { title: 'Record Trading', path: Path.RECORD_TRADING, roles: ['STAFF'] },
  { title: 'Transaction  Entry', path: Path.TRANSACTION_ENTRY, roles: ['STAFF'] },
];

export const menusLogout: IMenu[] = [
  { title: 'Logout', path: Path.LOGOUT, roles: ['MANAGER'] },
  { title: 'Logout and Closeshift', path: Path.LOGOUT_CLOSESHIFT, roles: ['STAFF'] },
];
