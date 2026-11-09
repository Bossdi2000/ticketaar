"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, QrCode, Search, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { checkInTicket, useDb } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { DashboardHeader, Panel, StatCard } from "@/components/dashboard/ui";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@/lib/types";

type ScanResult =
  | { result: "valid"; ticket: Ticket }
  | { result: "used"; ticket: Ticket }
  | { result: "invalid"; ticket?: Ticket }
  | null;

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
}
type BarcodeDetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorLike;

export function VerificationPage() {
  const db = useDb();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manual, setManual] = useState("");
  const [scan, setScan] = useState<ScanResult>(null);

  const checkedIn = db.tickets.filter((ticket) => ticket.checkedInAt).length;

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);

      const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
        .BarcodeDetector;
      if (Detector) {
        const detector = new Detector({ formats: ["qr_code"] });
        const tick = async () => {
          if (!streamRef.current || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && codes[0].rawValue) {
              handleCode(codes[0].rawValue);
              stopCamera();
              return;
            }
          } catch {
            /* frame not ready */
          }
          if (streamRef.current) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    } catch {
      setCameraError(
        "Camera access was blocked. Allow camera permission in your browser, or verify with the ticket number below.",
      );
      setCameraOn(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function handleCode(raw: string) {
    const value = raw.includes("/tickets/") ? raw.split("/tickets/").pop() ?? raw : raw;
    const byId = db.tickets.find((ticket) => ticket.id === value);
    if (byId) {
      const outcome = checkInTicket(byId.code);
      setScan(outcome as ScanResult);
      return;
    }
    setScan(checkInTicket(value) as ScanResult);
  }

  const sample = db.tickets.find((ticket) => ticket.status === "valid");

  return (
    <div>
      <DashboardHeader
        title="Ticket verification"
        description="Scan a QR code or type the ticket number. Each ticket can only be checked in once."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Tickets issued" value={db.tickets.length.toLocaleString()} icon={<QrCode className="size-4" />} />
        <StatCard label="Checked in" value={checkedIn.toLocaleString()} icon={<CheckCircle2 className="size-4" />} tone="brand" />
        <StatCard label="Awaiting entry" value={Math.max(0, db.tickets.length - checkedIn).toLocaleString()} icon={<RefreshCw className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <Panel title="Camera scanner" description="Point the camera at the attendee's QR code">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-950">
            <video ref={videoRef} playsInline muted className="size-full object-cover" />
            {!cameraOn ? (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <div>
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10 text-brand-100">
                    <Camera className="size-7" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-white">Camera is off</p>
                  <p className="mt-1 text-xs text-brand-200">
                    QR scanning works in Chrome, Edge and Safari 17+.
                  </p>
                </div>
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="size-48 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            )}
          </div>
          {cameraError ? (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-danger">
              {cameraError}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            {cameraOn ? (
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-brand-50"
              >
                <CameraOff className="size-4" />
                Stop camera
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Camera className="size-4" />
                Start camera
              </button>
            )}
          </div>
          {sample ? (
            <button
              type="button"
              onClick={() => handleCode(sample.code)}
              className="mt-2 w-full text-center text-xs font-semibold text-brand-700 hover:underline"
            >
              Simulate a scan with your latest ticket
            </button>
          ) : null}
        </Panel>

        <div className="space-y-4">
          <Panel title="Manual verification" description="Use when the camera is unavailable">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!manual.trim()) return;
                handleCode(manual.trim());
                setManual("");
              }}
              className="space-y-3"
            >
              <Input
                value={manual}
                onChange={(event) => setManual(event.target.value)}
                placeholder="TKAAR-XXXX-XXXX-XXXX"
                className="font-mono"
                aria-label="Ticket number"
              />
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Search className="size-4" />
                Verify ticket
              </button>
            </form>
          </Panel>

          {scan ? (
            <div
              className={`rounded-2xl border p-4 ${
                scan.result === "valid"
                  ? "border-green-200 bg-green-50"
                  : scan.result === "used"
                    ? "border-amber-200 bg-amber-50"
                    : "border-red-200 bg-red-50"
              }`}
              role="status"
              aria-live="polite"
            >
              <p className="flex items-center gap-2 text-sm font-bold">
                {scan.result === "valid" ? (
                  <>
                    <CheckCircle2 className="size-5 text-success" />
                    Valid ticket
                  </>
                ) : scan.result === "used" ? (
                  <>
                    <AlertTriangle className="size-5 text-warning" />
                    Already checked in
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-danger" />
                    Invalid ticket
                  </>
                )}
              </p>
              {scan.ticket ? (
                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="flex justify-between gap-3">
                    <span className="text-muted">Attendee</span>
                    <span className="font-semibold text-ink">{scan.ticket.attendeeName}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-muted">Event</span>
                    <span className="max-w-[60%] truncate text-right font-semibold text-ink">
                      {scan.ticket.eventTitle}
                    </span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-muted">Type</span>
                    <span className="font-semibold text-ink">{scan.ticket.ticketTypeName}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-muted">Ticket</span>
                    <span className="font-mono text-ink">{scan.ticket.code}</span>
                  </p>
                  {scan.result === "used" && scan.ticket.checkedInAt ? (
                    <p className="flex justify-between gap-3">
                      <span className="text-muted">Checked in</span>
                      <span className="font-semibold text-ink">
                        {formatDateTime(scan.ticket.checkedInAt)}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-xs text-danger">
                  That code does not match any ticket. Check for a missing character or ask for the
                  booking reference.
                </p>
              )}
            </div>
          ) : null}

          <Panel title="Checked-in log" padded={false}>
            {db.tickets.filter((ticket) => ticket.checkedInAt).length === 0 ? (
              <p className="p-4 text-sm text-muted">No check-ins recorded on this device yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {db.tickets
                  .filter((ticket) => ticket.checkedInAt)
                  .slice(0, 6)
                  .map((ticket) => (
                    <li key={ticket.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{ticket.attendeeName}</p>
                        <p className="truncate text-xs text-muted">{ticket.eventTitle}</p>
                      </div>
                      <Badge tone="success">In</Badge>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
