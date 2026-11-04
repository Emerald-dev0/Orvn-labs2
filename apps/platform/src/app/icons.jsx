'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  AiMagicIcon,
  Alert02Icon,
  Analytics01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Attachment01Icon,
  Building06Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkBadge01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Copy01Icon,
  DashboardSquare02Icon,
  Delete01Icon,
  Download01Icon,
  Edit02Icon,
  FileEditIcon,
  File02Icon,
  FilterHorizontalIcon,
  Globe02Icon,
  Image01Icon,
  InformationCircleIcon,
  Layers01Icon,
  Link01Icon,
  Location01Icon,
  Mail01Icon,
  MapsLocation01Icon,
  Menu01Icon,
  MessageMultiple01Icon,
  MoreHorizontalIcon,
  Notification01Icon,
  PrinterIcon,
  RefreshIcon,
  Search01Icon,
  Settings01Icon,
  Share01Icon,
  Shield01Icon,
  SquareLock02Icon,
  Tick02Icon,
  Upload01Icon,
  UserIcon,
  ViewIcon,
  Wallet01Icon,
  Logout01Icon,
  HelpCircleIcon,
} from '@hugeicons/core-free-icons';

/**
 * One icon module for the product surface. Hugeicons free set, stroke drawn to match the
 * site's line weight. Swapping families means editing this file, not every component.
 */
const ICONS = {
  dashboard: DashboardSquare02Icon,
  properties: Building06Icon,
  website: Globe02Icon,
  inquiries: MessageMultiple01Icon,
  analytics: Analytics01Icon,
  settings: Settings01Icon,

  search: Search01Icon,
  add: Add01Icon,
  more: MoreHorizontalIcon,
  menu: Menu01Icon,
  close: Cancel01Icon,
  filter: FilterHorizontalIcon,

  arrowRight: ArrowRight01Icon,
  arrowUpRight: ArrowUpRight01Icon,
  arrowLeft: ArrowLeft01Icon,
  arrowUp: ArrowUp01Icon,
  arrowDown: ArrowDown01Icon,

  check: Tick02Icon,
  checkCircle: CheckmarkCircle02Icon,
  badge: CheckmarkBadge01Icon,
  alert: Alert02Icon,
  info: InformationCircleIcon,
  help: HelpCircleIcon,

  upload: Upload01Icon,
  image: Image01Icon,
  camera: Image01Icon,
  file: File02Icon,
  fileEdit: FileEditIcon,
  attachment: Attachment01Icon,
  printer: PrinterIcon,
  download: Download01Icon,
  refresh: RefreshIcon,
  trash: Delete01Icon,

  link: Link01Icon,
  copy: Copy01Icon,
  share: Share01Icon,
  view: ViewIcon,
  edit: Edit02Icon,

  clock: Clock01Icon,
  calendar: Calendar03Icon,
  location: Location01Icon,
  map: MapsLocation01Icon,
  layers: Layers01Icon,
  tag: SquareLock02Icon,
  wallet: Wallet01Icon,
  shield: Shield01Icon,
  bell: Notification01Icon,

  mail: Mail01Icon,
  magic: AiMagicIcon,
  user: UserIcon,
  logout: Logout01Icon,
};

export function Icon({ name, size = 18, strokeWidth = 1.6, className, color = 'currentColor' }) {
  const glyph = ICONS[name];
  if (!glyph) return null;
  return (
    <HugeiconsIcon
      icon={glyph}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
      aria-hidden="true"
    />
  );
}

export default Icon;
