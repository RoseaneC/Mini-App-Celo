type FlameIconProps = {
  className?: string;
  title?: string;
};

export function FlameIcon({ className = "h-5 w-4", title }: FlameIconProps) {
  return (
    <svg
      viewBox="0 0 32 44"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M15.7 42C8.1 37.7 4 31.5 4 24.9C4 16.8 9.4 11.2 14.2 7.4C16.5 5.5 17.9 2.2 18.2 1C24.7 7.1 27.8 13.9 26.3 21.3C28.3 19.5 29.7 17.2 30.2 14.8C32.1 25.9 27.3 36.1 15.7 42Z"
        fill="url(#inapay-flame)"
      />
      <path
        d="M16.1 39.1C12.1 35.5 10.2 31.1 10.6 26.7C11 22.2 13.9 18.6 17.2 15.7C17.5 20 20.4 24 18.2 30.8C20.4 28.9 21.6 26.3 21.9 23.5C24 29.4 21.6 35.6 16.1 39.1Z"
        fill="url(#inapay-flame-core)"
      />
      <defs>
        <linearGradient
          id="inapay-flame"
          x1="8"
          y1="42"
          x2="23"
          y2="3"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--brand-fire)" />
          <stop offset="0.68" stopColor="var(--brand-amber)" />
          <stop offset="1" stopColor="var(--brand-copper)" />
        </linearGradient>
        <linearGradient
          id="inapay-flame-core"
          x1="13"
          y1="39"
          x2="20"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--brand-copper)" />
          <stop offset="1" stopColor="var(--brand-amber)" stopOpacity="0.78" />
        </linearGradient>
      </defs>
    </svg>
  );
}
