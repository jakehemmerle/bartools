# PRD (Product Requirements Document)

> Ingested: 2026-04-09 | Source: Inline text
> Status: **Awaiting CP1 scope lock**

---

This is a greenfield project that will leverage bun in a monorepo. We'll be making a tool that uses a React Native mobile app to take photos of bottles of liquor in a bar, sends them to the backend to use a VLM to identify the brand, specific flavor/type, and how full the bottle is. The app will then return a ScrollView with two columns. The first column simply containes a thumbnail of the image sent to the backend. The second column contains all the identification information returned from the backend along with a slider set to represent how full the VLM thinks the bottle is. The user can then adjust any data point as needed including the slider before confirming the updates, sending an update to the backend with any changes, and then moving forward to a graph/viz screen of the data they just entered.
