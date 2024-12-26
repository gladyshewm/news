import { SVGAttributes } from 'react';

export function ChevronLeftIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      fill="none"
      width={24}
      height={24}
      strokeWidth={1.5}
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5 8.25 12l7.5-7.5"
      />
    </svg>
  );
}
