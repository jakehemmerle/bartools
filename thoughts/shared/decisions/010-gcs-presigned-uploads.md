# ADR-010: GCS Pre-Signed PUT Uploads (Replaces Backend Multipart-to-Disk)

**Date:** 2026-04-17
**Status:** Accepted
**Deciders:** Jake

## Context

Current photo upload flow: mobile posts `multipart/form-data` to `POST /reports/:reportId/photos`, backend parses the body and writes the JPEG to `packages/backend/data/uploads/` on local disk, then stores a relative `photoUrl` on `scans`.

This does not work on Cloud Run:
- Cloud Run is serverless — no persistent disk; `data/uploads/` disappears between revisions and is not shared across instances.
- Backend sits in the bytes path: every upload costs request memory + multipart parsing for no product reason.
- Uploads are serial with the rest of the request — mobile waits on backend I/O.

We are staying all-GCP (no new AWS surface area), and the staging environment can be hard-cut (existing `scans.photoUrl` rows are throwaway).

## Decision

Replace the single multipart endpoint with a **two-step presigned flow**:

1. `POST /reports/:reportId/photos/presign` — backend generates a GCS V4 pre-signed PUT URL and returns `{ url, bucket, object, expiresAt }`. Object key format: `reports/{reportId}/{uuid}.jpg`.
2. Mobile PUTs the JPEG bytes directly to the returned URL with `Content-Type: image/jpeg` (V4 signing binds the header — client and signer must agree).
3. `POST /reports/:reportId/photos/complete` — backend writes a `scans` row recording `photoGcsBucket` + `photoGcsObject`. Inference then reads the bytes via the Node SDK (`bucket.file(object).download()`) — no presigned GET needed.

Hard cut on staging: the old multipart endpoint and `GET /uploads/:filename` are deleted in the same PR. No dual-write, no migration.

## Alternatives considered

- **Backend proxies bytes to GCS.** Solves the disk problem but keeps backend in the bytes path — same memory/CPU cost as today, just with a different sink. Rejected.
- **AWS S3 + presigned PUT.** Mature, but adds a second cloud (IAM, billing, VPC egress) for zero product benefit. Rejected.
- **Keep disk + attach a persistent volume (GCE VM or GKE).** Abandons Cloud Run's operational model for a storage problem that object storage already solves. Rejected.

## Consequences

Improves:
- Backend is out of the bytes path — no multipart parsing, no per-upload memory spike.
- Works natively on Cloud Run; no disk assumption.
- Mobile can upload in parallel with other work → faster perceived UX.
- Uniform bucket-level access + public access prevention means objects are private by default.

Trade-offs:
- Two round-trips before the upload (presign, then PUT) vs. one today. Acceptable — presign is a cheap signed-URL generation.
- V4 signing binds `Content-Type`; a client mismatch is a 403. Mitigated by pinning `image/jpeg` in both the signer and the mobile PUT.
- Orphaned objects if a client presigns but never completes. Accepted for MVP (see follow-ups).

Out of scope for this ADR:
- Auth on any of the three endpoints.
- Prod cut-over and prod CORS tightening.
- GCS object lifecycle / orphan cleanup.

## Auth model

- Cloud Run service account holds `roles/storage.objectAdmin` scoped to `bartools-uploads-{staging,prod}` only.
- Same service account holds `roles/iam.serviceAccountTokenCreator` **on itself** so the Node SDK can call IAM Credentials `signBlob` to mint V4 signatures.
- No JSON key files in the container. ADC resolves the service account at runtime.

## Bucket layout

- `bartools-uploads-staging` and `bartools-uploads-prod`, region `us-east1` (matches Cloud Run).
- Uniform bucket-level access on, public access prevention enforced, versioning off.
- Force-destroy enabled on staging only.

## Env contract

Plain env vars (not secrets):
- `GCS_BUCKET` — bucket name for the current env.
- `GCS_PRESIGNED_PUT_TTL_SECONDS=300` — 5-minute PUT TTL.

## Schema

On `scans`:
- Drop `photoUrl`.
- Add `photoGcsBucket text not null`.
- Add `photoGcsObject text not null`.

## Open questions / follow-ups

- **Orphan cleanup.** Presign-but-never-complete leaves dangling objects. Candidates: GCS lifecycle rule (delete objects older than N days under `reports/`), or a reconciliation job against `scans`. Deferred.
- **Prod CORS.** Staging will start permissive to unblock; prod should restrict `Origin` to the mobile app and tighten allowed headers/methods. Deferred.
- **Auth on presign.** The presign endpoint currently mints a signed URL for any caller who knows a `reportId`. Once auth lands, presign should require a session and verify the caller owns the report.
