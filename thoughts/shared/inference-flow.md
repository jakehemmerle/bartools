# BarBack: Photo-to-Report Inference Flow

## End-to-End Architecture

```
                            MOBILE                                          BACKEND                                              EXTERNAL
 +-----------------------------------------+    +------------------------------------------------------------------------+    +-------------------+
 |                                         |    |                                                                        |    |                   |
 |  +-------------+    +--------------+    |    |   +----------+    +---------------+    +--------+    +-----------+     |    |  +-------------+ |
 |  |   Camera    |--->| useBatchQueue|    |    |   |  Hono    |    | report-service|    | queue  |    | inference |     |    |  | LangSmith   | |
 |  | Capture     |    |              |    |    |   |  Router  |    |               |    |        |    |           |     |    |  | (prompts)   | |
 |  +-------------+    |  QueuedPhoto |    |    |   +----------+    +---------------+    +--------+    +-----------+     |    |  +-------------+ |
 |                     |  { uri, id } |    |    |        |                |                  |              |            |    |        |          |
 |  +-------------+    |              |    |    |        v                v                  v              v            |    |        v          |
 |  |  Location   |    | addPhoto()   |    |    |   +----------+    +----------+    +-----------+    +----------+       |    |  +-------------+ |
 |  |  Selector   |    | removePhoto()|    |    |   | uploads  |    |  schema  |    |   Motia   |    | runtime  |       |    |  |  Claude API | |
 |  +-------------+    | clear()      |    |    |   | (files)  |    | (Drizzle)|    |  (queue)  |    | (agent)  |       |    |  | sonnet-4-6  | |
 |                     +--------------+    |    |   +----------+    +----------+    +-----------+    +----------+       |    |  +-------------+ |
 +-----------------------------------------+    +------------------------------------------------------------------------+    +-------------------+
```

## Detailed Flow (15 photos scenario)

```
STEP 1: CREATE REPORT
======================

  Mobile App                        POST /reports                      PostgreSQL
  ---------                         -------------                      ----------
      |                                  |                                  |
      |  { userId, venueId,              |                                  |
      |    locationId }                  |                                  |
      |--------------------------------->|                                  |
      |                                  |  INSERT reports                  |
      |                                  |  status='created'               |
      |                                  |  photoCount=0                   |
      |                                  |  processedCount=0               |
      |                                  |--------------------------------->|
      |                                  |                                  |
      |          { id: "rpt-uuid" }      |                                  |
      |<---------------------------------|                                  |


STEP 2: UPLOAD PHOTOS (x15)
============================

  Mobile App              POST /reports/:id/photos            uploads/           PostgreSQL
  ---------               (multipart form data)               --------           ----------
      |                            |                              |                   |
      |  [15 photo files]          |                              |                   |
      |--------------------------->|                              |                   |
      |                            |                              |                   |
      |                            |  for each file:              |                   |
      |                            |  saveUploadedPhoto()         |                   |
      |                            |----------------------------->|                   |
      |                            |  writes: {reportId}-{uuid}.jpg                   |
      |                            |  returns: /uploads/{filename}|                   |
      |                            |                              |                   |
      |                            |  INSERT scans (x15)          |                   |
      |                            |  { reportId, photoUrl,       |                   |
      |                            |    sortOrder: 0..14 }        |                   |
      |                            |--------------------------------------------->|   |
      |                            |                              |                   |
      |                            |  UPDATE reports              |                   |
      |                            |  SET photoCount = 15         |                   |
      |                            |--------------------------------------------->|   |
      |                            |                              |                   |
      |  { reportId, photos: [{   |                              |                   |
      |    id, photoUrl,           |                              |                   |
      |    sortOrder }...] }       |                              |                   |
      |<---------------------------|                              |                   |


STEP 3: SUBMIT FOR PROCESSING
===============================

  Mobile App          POST /reports/:id/submit         PostgreSQL          Queue (Motia/local)
  ---------           ------------------------         ----------          -------------------
      |                        |                           |                       |
      |  (no body)             |                           |                       |
      |----------------------->|                           |                       |
      |                        |                           |                       |
      |                        |  BEGIN TRANSACTION        |                       |
      |                        |                           |                       |
      |                        |  Validate: status='created'                       |
      |                        |  SELECT scans (15 rows)   |                       |
      |                        |-------------------------->|                       |
      |                        |                           |                       |
      |                        |  INSERT reportRecords x15 |                       |
      |                        |  status='pending'         |                       |
      |                        |-------------------------->|                       |
      |                        |                           |                       |
      |                        |  INSERT inferenceJobs x15 |                       |
      |                        |  status='queued'          |                       |
      |                        |  provider='anthropic'     |                       |
      |                        |  jobKey='{rptId}:{scanId}'|                       |
      |                        |-------------------------->|                       |
      |                        |                           |                       |
      |                        |  UPDATE reports           |                       |
      |                        |  status='processing'      |                       |
      |                        |  processedCount=0         |                       |
      |                        |-------------------------->|                       |
      |                        |                           |                       |
      |                        |  COMMIT                   |                       |
      |                        |                           |                       |
      |                        |  enqueueReportInference() x15                     |
      |                        |  for each job:            |                       |
      |                        |  { jobId, reportId, scanId }                      |
      |                        |---------------------------------------------->|   |
      |                        |                           |    topic:             |
      |                        |                           |    'report.scan.      |
      |                        |                           |     inference'        |
      |                        |                           |    groupId: reportId  |
      |                        |                           |                       |
      |                        |  (if Motia fails:         |                       |
      |                        |   queueMicrotask fallback)|    OR                 |
      |                        |                           |    queueMicrotask()   |
      |                        |                           |                       |
      |  { reportId,           |                           |                       |
      |    enqueued: 15,       |                           |                       |
      |    queueModes:         |                           |                       |
      |    ['motia'|'local'] } |                           |                       |
      |<-----------------------|                           |                       |


STEP 4: INFERENCE (per photo, x15 in parallel)
================================================

  Queue               processQueuedInferenceJob()      PostgreSQL      LangSmith       Claude API
  -----               ----------------------------      ----------      ---------       ----------
    |                            |                          |               |                |
    |  { jobId, reportId,        |                          |               |                |
    |    scanId }                |                          |               |                |
    |--------------------------->|                          |               |                |
    |                            |                          |               |                |
    |                            |  SELECT inferenceJobs    |               |                |
    |                            |  WHERE id=jobId          |               |                |
    |                            |  (verify queued/running) |               |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  UPDATE inferenceJobs    |               |                |
    |                            |  SET status='running'    |               |                |
    |                            |  startedAt=now           |               |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  resolvePrompt()         |               |                |
    |                            |  (30s cache TTL)         |               |                |
    |                            |----------------------------------------->|                |
    |                            |  pullPromptTemplate()    |               |                |
    |                            |  { systemPrompt,         |               |                |
    |                            |    userPrompt,           |               |                |
    |                            |    commitHash }          |               |                |
    |                            |<-----------------------------------------|                |
    |                            |                          |               |                |
    |                            |  INSERT inferenceAttempts |               |                |
    |                            |  { promptName,           |               |                |
    |                            |    promptResolvedVersion, |               |                |
    |                            |    modelUsed }           |               |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  SELECT scans            |               |                |
    |                            |  (get photoUrl)          |               |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  SELECT bottles          |               |                |
    |                            |  (full catalog)          |               |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  Read photo file         |               |                |
    |                            |  from /data/uploads/     |               |                |
    |                            |                          |               |                |
    |                            |  runBottleInference()    |               |                |
    |                            |  +--MCP tool server------|------|------->|                |
    |                            |  | submit_answer(        |      |        |                |
    |                            |  |   name: string,       |      |        |                |
    |                            |  |   volume: number      |      |        |                |
    |                            |  | )                     |      |        |                |
    |                            |  +--Claude Agent SDK-----|------|------->|                |
    |                            |  | query({               |      |        |                |
    |                            |  |   system: systemPrompt|      |        |                |
    |                            |  |   user: [text+image], |      |        |                |
    |                            |  |   model: sonnet-4-6,  |      |        |                |
    |                            |  |   tools: [submit_answer]     |        |                |
    |                            |  | })                    |      |        |                |
    |                            |  |                       |      |------->|                |
    |                            |  |  (up to 4 attempts    |      |        |   Vision +     |
    |                            |  |   for valid answer)   |      |        |   Tool Use     |
    |                            |  |                       |      |<-------|                |
    |                            |  +--Validates name in    |      |        |                |
    |                            |  |  catalog + volume     |      |        |                |
    |                            |  |  in [0.0..1.0] grid   |      |        |                |
    |                            |  +--- returns:           |               |                |
    |                            |  { name, volume }        |               |                |
    |                            |                          |               |                |
    |                            |  Match bottle by name    |               |                |
    |                            |  fillTenths = round(vol*10)              |                |
    |                            |                          |               |                |
    |                            |  BEGIN TRANSACTION       |               |                |
    |                            |                          |               |                |
    |                            |  UPDATE inferenceAttempts|               |                |
    |                            |  SET latencyMs, rawResponse              |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  UPDATE scans            |               |                |
    |                            |  SET bottleId,           |               |                |
    |                            |  vlmFillTenths,          |               |                |
    |                            |  modelUsed, latencyMs    |               |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  UPDATE reportRecords    |               |                |
    |                            |  SET status='inferred',  |               |                |
    |                            |  originalBottleId,       |               |                |
    |                            |  originalBottleName,     |               |                |
    |                            |  originalFillTenths,     |               |                |
    |                            |  inferredAt              |               |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  UPDATE inferenceJobs    |               |                |
    |                            |  SET status='succeeded'  |               |                |
    |                            |------------------------->|               |                |
    |                            |                          |               |                |
    |                            |  COMMIT                  |               |                |
    |                            |                          |               |                |
    |                            |  syncReportProgress()    |               |                |
    |                            |  COUNT succeeded+failed  |               |                |
    |                            |  vs total scans          |               |                |
    |                            |  if all done:            |               |                |
    |                            |    status='unreviewed'   |               |                |
    |                            |------------------------->|               |                |


STEP 5: SSE STREAMING (concurrent with Step 4)
================================================

  Mobile App           GET /reports/:id/stream          PostgreSQL
  ---------            -----------------------          ----------
      |                        |                           |
      |  (SSE connection)      |                           |
      |----------------------->|                           |
      |                        |                           |
      |                        |  POLL every 750ms:        |
      |                        |  getReportStreamState()   |
      |                        |-------------------------->|
      |                        |  { report: {status,       |
      |                        |    processedCount},       |
      |                        |    records: [...] }       |
      |                        |                           |
      |  event: report.progress|                           |
      |  data: { status:       |                           |
      |    'processing',       |                           |
      |    processedCount: 3,  |                           |
      |    photoCount: 15 }    |                           |
      |<-----------------------|                           |
      |                        |                           |
      |  event: record.inferred|                           |
      |  data: { id, scanId,   |                           |
      |    bottleName,         |                           |
      |    fillTenths }        |                           |
      |<-----------------------|                           |
      |                        |                           |
      |  ... repeats until     |                           |
      |  processedCount == 15  |                           |
      |                        |                           |
      |  event:                |                           |
      |  report.ready_for_review                           |
      |  data: { reportId }    |                           |
      |<-----------------------|                           |
      |                        |                           |
      |  (connection closes)   |                           |


STEP 6: REVIEW
===============

  Mobile App          POST /reports/:id/review          PostgreSQL
  ---------           -----------------------          ----------
      |                        |                           |
      |  { userId,             |                           |
      |    records: [{         |                           |
      |      id: "rec-uuid",   |                           |
      |      bottleId: "b-uuid",                           |
      |      fillTenths: 7     |                           |
      |    }, ...x15] }        |                           |
      |----------------------->|                           |
      |                        |                           |
      |                        |  BEGIN TRANSACTION        |
      |                        |                           |
      |                        |  Validate report          |
      |                        |  status='unreviewed'      |
      |                        |                           |
      |                        |  UPDATE reportRecords x15 |
      |                        |  SET status='reviewed',   |
      |                        |  correctedBottleId,       |
      |                        |  correctedBottleName,     |
      |                        |  correctedFillTenths,     |
      |                        |  correctedByUserId        |
      |                        |-------------------------->|
      |                        |                           |
      |                        |  UPDATE reports           |
      |                        |  SET status='reviewed',   |
      |                        |  reviewedAt=now           |
      |                        |-------------------------->|
      |                        |                           |
      |                        |  COMMIT                   |
      |                        |                           |
      |  { report, records }   |                           |
      |<-----------------------|                           |
```

## State Machines

```
REPORT STATUS                  RECORD STATUS                 JOB STATUS
=============                  =============                 ==========

  created                        pending                      queued
    |                              |                            |
    | POST /submit                 | inference runs             | dequeued
    v                              v                            v
  processing ----+              inferred ----+                running
    |            |                 |         |                  |   |
    | all done   | (some fail)    | review   | (inference      |   | error
    v            v                v          |  fails)         v   v
  unreviewed   unreviewed       reviewed     v              succeeded  failed
    |                                      failed
    | POST /review
    v
  reviewed
```

## Database Tables Hit (in order)

```
  reports          scans          reportRecords     inferenceJobs     inferenceAttempts    bottles
  --------         ------         -------------     -------------     -----------------    -------
  1. INSERT        2. INSERT x15  3. INSERT x15     3. INSERT x15     4. INSERT            4. SELECT all
     (created)        (photos)       (pending)         (queued)          (per attempt)        (catalog)
  2. UPDATE        4. UPDATE      4. UPDATE          4. UPDATE         4. UPDATE
     (photoCount)     (bottleId,     (inferred,         (running)         (latency,
  3. UPDATE           fillTenths)    originalBottle*)   (succeeded)       rawResponse)
     (processing)  
  4. UPDATE                      6. UPDATE x15      
     (unreviewed)                   (reviewed,
  6. UPDATE                         corrected*)
     (reviewed)
```

## Key Interfaces

```typescript
// --- Queue Payload ---
type ReportScanInferencePayload = {
  jobId: string     // uuid
  reportId: string  // uuid
  scanId: string    // uuid
}

// --- Inference Result ---
type InferenceResult = {
  name: string      // bottle name (verbatim from catalog)
  volume: number    // 0.0 to 1.0 in 0.1 steps
  error?: string
}

// --- MCP Tool (given to Claude) ---
tool submit_answer = {
  name: string      // bottle name
  volume: number    // fill level
}

// --- SSE Events ---
'report.progress'       → { id, status, photoCount, processedCount }
'record.inferred'       → { id, scanId, bottleName, fillTenths, ... }
'record.failed'         → { id, scanId, errorCode, errorMessage }
'record.reviewed'       → { id, scanId, correctedBottleName, ... }
'report.ready_for_review' → { reportId }

// --- Review Input ---
type ReviewInput = {
  userId: string
  records: Array<{
    id: string          // reportRecord id
    bottleId: string    // corrected bottle
    fillTenths: number  // 0-10
  }>
}
```

## Parallelism & Queuing

```
                    15 photos uploaded
                           |
                    POST /submit
                           |
              +------------+------------+
              |            |            |
         Job 1 queued  Job 2 queued ... Job 15 queued
              |            |            |
              v            v            v
        +-----------+ +-----------+ +-----------+
        |  Motia    | |  Motia    | |  Motia    |
        |  Worker   | |  Worker   | |  Worker   |   (message group = reportId)
        +-----------+ +-----------+ +-----------+
              |            |            |
              | Claude API | Claude API | Claude API
              | (vision)   | (vision)   | (vision)
              |            |            |
              v            v            v
        succeeded     succeeded     succeeded
              |            |            |
              +-----+------+------+-----+
                    |             |
            syncReportProgress() x15
                    |
            status = 'unreviewed'
                    |
            SSE: report.ready_for_review

  NOTE: If Motia is unavailable, jobs run via queueMicrotask()
        (in-process, event-loop scheduled, effectively sequential)
```
