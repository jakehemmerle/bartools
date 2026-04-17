| Screen | Route | Reference Basis | Screenshot | Visual Verdict | Semantic Verdict | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Reports List | `/reports` | `screen-composition-spec.md` narrow rules | `screens/02-reports-list.png` | `pass-with-notes` | `pass` | Rows now preserve report identity and field meaning at phone width instead of collapsing into generic status cards. |
| Report Reviewed | `/__review/report/reviewed` | `screen-composition-spec.md` narrow rules | `screens/07-report-reviewed.png` | `pass-with-notes` | `pass` | Metadata and title scale are calmer on mobile, though the comparison card remains tall because the reviewed schema is still information-dense. |
| Report Failed | `/__review/report/failed` | `screen-composition-spec.md` narrow rules | `screens/09-report-failed.png` | `pass-with-notes` | `pass` | Failed cards stack cleanly and preserve recovery controls; placeholder media is still louder than final imagery will be. |
