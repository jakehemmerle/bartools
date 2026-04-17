## Summary

- 

## Validation

- [ ] `bun --filter @bartools/dashboard lint`
- [ ] `bun --filter @bartools/dashboard typecheck`
- [ ] `bun --filter @bartools/dashboard build`
- [ ] `bun run test`
- [ ] `bun --filter @bartools/dashboard build-storybook` if Storybook files changed

## Dashboard Anti-Slop Checklist

Complete this section if the PR touches `packages/dashboard`.

- [ ] No production source file exceeds the `500`-line cap
- [ ] Any file split created clearer ownership, not `utils`/`helpers` scatter
- [ ] No new dashboard dependency was added without an explicit justification and approval callout
- [ ] Storybook additions stay inside the approved primitive/stable-composite scope
- [ ] Review routes remain the source of truth for full-screen state families
- [ ] Boundary or architecture changes are called out in docs or the PR summary
- [ ] Tests and review evidence protect real behavior instead of snapshot theater
