const PRIVACY_ITEMS = [
  {
    title: "Zero data collection",
    body: "No analytics, telemetry, or crash reports. There is no instrumentation code in Aero Studio — not a single event is tracked.",
  },
  {
    title: "Local storage only",
    body: "All files, thumbnails, and metadata are stored in your browser's IndexedDB. Nothing is ever transmitted to a server.",
  },
  {
    title: "No accounts required",
    body: "You don't need an account to use Aero Studio. There's nothing to sign up for and no credentials to protect.",
  },
  {
    title: "Fully open source",
    body: "The full source is on GitHub. Audit it, fork it, or self-host it. Our privacy is a technical property, not just a policy.",
  },
];

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="text-aero-accent"
  >
    <path
      d="M3 8 L6.5 11.5 L13 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function LandingPrivacy() {
  return (
    <div className="max-w-200 mx-auto">
      <div className="font-display text-[13px] text-aero-text-dim mb-6 uppercase tracking-[0.5px]">
        Privacy Policy
      </div>

      <h2 className="font-display text-[clamp(36px,5vw,52px)] font-bold text-aero-text mb-2.5 leading-[1.1]">
        We collect nothing
      </h2>

      <div className="text-[13px] text-aero-text-dim font-display mb-14">
        Last updated: June 2026
      </div>

      {/* 1px gap trick for the borders */}
      <div className="flex flex-col gap-px bg-aero-border mb-10">
        {PRIVACY_ITEMS.map((item, i) => (
          <div key={i} className="bg-aero-surface p-10 flex gap-7 items-start">
            <div className="w-9 h-9 rounded-full border-[0.5px] border-aero-accent-border bg-aero-accent-glow flex items-center justify-center shrink-0 mt-1">
              <CheckIcon />
            </div>

            <div>
              <div className="font-display font-bold text-base text-aero-text mb-2.5">
                {item.title}
              </div>
              <div className="text-[15px] text-aero-text-sub leading-[1.8]">
                {item.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
