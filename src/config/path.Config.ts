import type { UserRole } from '../types/entities.ts';
import dashboardIcon from "../assets/svg/dashboard-svgrepo-com.svg";
import transactionIcon from "../assets/svg/exchange-svgrepo-com.svg";
import cashTransferIcon from "../assets/svg/transfer-fee-svgrepo-com.svg";
import manageBoothIcon from "../assets/svg/booth-svgrepo-com.svg";
import manageUserIcon from "../assets/svg/user-svgrepo-com.svg";
import editRateIcon from "../assets/svg/exchange-rate-svgrepo-com.svg";
import reportIcon from "../assets/svg/dashboard-svgrepo-com.svg";
import recordTradingIcon from "../assets/svg/dashboard-svgrepo-com.svg";
import transactionEntryIcon from "../assets/svg/dashboard-svgrepo-com.svg";
import openShiftIcon from "../assets/svg/dashboard-svgrepo-com.svg";
import logoutIcon from "../assets/svg/logout.svg";  

export interface IMenu {
  icon: string;
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
  OPEN_SHIFT: `${basePath}open-shift`,
  LOGOUT: `${basePath}logout`,
  LOGOUT_CLOSESHIFT: `${basePath}logout-closeshift`,
  LOGIN: `${basePath}login`,
  RESET_PASSWORD: `${basePath}reset-password`,
  PROFILE: `${basePath}profile`,
} as const;

export const menus: IMenu[] = [
  { icon: dashboardIcon, title: 'Dashboard', path: Path.DASHBOARD, roles: ['ADMIN','MANAGER'] },
  { icon: transactionIcon, title: 'Transaction', path: Path.MANAGE_TRANSACTION, roles: ['ADMIN','MANAGER'] },
  { icon: cashTransferIcon, title: 'Transfer', path: Path.CASH_TRANSFER, roles: ['ADMIN','MANAGER'] },
  { icon: manageBoothIcon, title: 'Booth', path: Path.MANAGE_BOOTH, roles: ['ADMIN','MANAGER'] },
  { icon: manageUserIcon, title: 'User', path: Path.MANAGE_USER, roles: ['ADMIN','MANAGER'] },
  { icon: editRateIcon, title: 'Currency Rate', path: Path.EDIT_RATE, roles: ['ADMIN','MANAGER'] },
  { icon: reportIcon, title: 'Report & Audit', path: Path.REPORT, roles: ['ADMIN','MANAGER'] },
  { icon: openShiftIcon, title: 'Open / Close Shift', path: Path.OPEN_SHIFT, roles: ['ADMIN','MANAGER'] },
  { icon: recordTradingIcon, title: 'Record Trading', path: Path.RECORD_TRADING, roles: ['EMPLOYEE'] },
  { icon: transactionEntryIcon, title: 'Transaction  Entry', path: Path.TRANSACTION_ENTRY, roles: ['EMPLOYEE'] },
];

export const menusLogout: IMenu[] = [
  { icon: logoutIcon, title: 'Logout', path: Path.LOGOUT, roles: ['ADMIN','MANAGER'] },
  { icon: logoutIcon, title: 'Logout and Closeshift', path: Path.LOGOUT_CLOSESHIFT, roles: ['EMPLOYEE'] },
];
