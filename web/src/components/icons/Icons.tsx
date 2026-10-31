export interface IconProps {
    size?: number;
}

function StrokeIcon({ size = 20, path, strokeWidth = 2 }: { size?: number; path: string; strokeWidth?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={path} />
        </svg>
    );
}

export function ChecklistIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M9 11.5 12 14.5 20 6.5M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />;
}

export function BasketIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M5.5 9h13l-1.2 10.2a2 2 0 0 1-2 1.8H8.7a2 2 0 0 1-2-1.8L5.5 9ZM9 9V7a3 3 0 0 1 6 0v2" />;
}

export function BookIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5v-14ZM5 19.5A2.5 2.5 0 0 0 7.5 22H19v-5M9 7.5h6" />;
}

export function CalendarIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7ZM4 10h16M8 3v4M16 3v4" />;
}

export function PlusIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M12 5v14M5 12h14" strokeWidth={2.25} />;
}

export function CheckIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="m5 12.5 4.5 4.5L19 7.5" strokeWidth={3} />;
}

export function CloseIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M6 6l12 12M18 6 6 18" />;
}

export function TrashIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M4 7h16M10 11v6M14 11v6M6 7l.9 11.2a2 2 0 0 0 2 1.8h6.2a2 2 0 0 0 2-1.8L18 7M9 7V4.5h6V7" />;
}

export function PencilIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />;
}

export function ChevronLeftIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="m15 5-7 7 7 7" strokeWidth={2.25} />;
}

export function ChevronRightIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="m9 5 7 7-7 7" strokeWidth={2.25} />;
}

export function ArrowLeftIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M20 12H5M11 6l-6 6 6 6" />;
}

export function ExternalIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M8 16 17 7M9 7h8v8" />;
}

export function SearchIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4" />;
}

export function PinIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />;
}

export function ClockIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2" />;
}

export function SignOutIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" />;
}

export function ChevronDownIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="m6 9 6 6 6-6" strokeWidth={2.25} />;
}

export function RepeatIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M4 11.5V10a4 4 0 0 1 4-4h11M16 3l3 3-3 3M20 12.5V14a4 4 0 0 1-4 4H5M8 21l-3-3 3-3" />;
}

export function CameraIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M4 8.5a2 2 0 0 1 2-2h1.8L9.3 4.5h5.4l1.5 2H18a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />;
}

export function HouseIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" />;
}

export function TagIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3.5 13.5V4.5a1 1 0 0 1 1-1h9l7.1 7.1a2 2 0 0 1 0 2.8ZM8 8h.01" strokeWidth={2.25} />;
}

export function ChevronUpIcon({ size }: IconProps) {
    return <StrokeIcon size={size} path="m6 15 6-6 6 6" strokeWidth={2.25} />;
}
