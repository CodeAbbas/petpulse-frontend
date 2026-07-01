export default function EhrNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Link unavailable
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This health record link has expired, been revoked, or is invalid.
          Please ask the clinic to issue a new share link if you still need
          access.
        </p>
        <div className="mt-8 text-xs text-muted-foreground/60">
          PetPulse — Smart Pet Care & Monitoring Ecosystem
        </div>
      </div>
    </div>
  )
}