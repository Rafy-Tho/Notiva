# ai/change-workflow.md

Change Workflow
===============

Standard Procedure
------------------
```
1. Understand request
        ↓
2. Find relevant feature spec in specs/
        ↓
3. Inspect implementation in backend/src/ and frontend/src/
        ↓
4. Inspect related tests (backend/src/services/notes.service.test.js)
        ↓
5. Identify dependencies (database, API, external services)
        ↓
6. Plan smallest safe change
        ↓
7. Implement
        ↓
8. Run tests
        ↓
9. Check for regressions
        ↓
10. Update docs/specs if behavior changed
```

Step Details
------------
**1. Understand request**
- Clarify scope and expected behavior
- Check for existing specs

**2. Find relevant feature spec**
- Look in specs/ directory
- Review auth/, notes/, notebooks/, tags/, profile/

**3. Inspect implementation**
- Read backend controllers/services
- Read frontend components/pages
- Note patterns being used

**4. Inspect related tests**
- Check existing test coverage
- Understand mocking patterns

**5. Identify dependencies**
- Database schema changes?
- API changes?
- Frontend component changes?
- External service changes?

**6. Plan smallest safe change**
- Modify existing code, don't rewrite
- Preserve API contracts
- Maintain database compatibility

**7. Implement**
- Follow existing conventions
- Add tests if adding features

**8. Run tests**
- `npm test` or `vitest run`

**9. Check for regressions**
- Verify existing features still work
- Check API contracts

**10. Update docs/specs**
- Update docs/ for behavior changes
- Update specs/ for feature changes
