# Task: Admin User Management UI Upgrade

## Goal
Upgrade the frontend user management page for admins so it supports:
- viewing patients, caregivers, and doctors in one polished screen
- removing the legacy assigned/unassigned filter UI
- assigning both a caregiver and a doctor to each patient from a dialog
- creating a new user with role-specific fields for patient, caregiver, or doctor

## Scope
- Refactor frontend user-management data loading
- Add admin tabs/sections for patients, caregivers, and doctors
- Replace "Add New Patient" with "Add New User"
- Add assignment dialog with caregiver and doctor dropdowns
- Improve page and dialog styling

## Notes
- Prefer existing patient-service and auth endpoints where possible
- If backend changes become necessary, report required docker rebuild/restart steps explicitly

## Progress
- [x] Reviewed current patient list frontend implementation
- [x] Reviewed existing patient-service assignment and user lookup endpoints
- [x] Update Angular models/services for combined user-management view
- [x] Implement redesigned list and dialogs
- [x] Run frontend verification
- [x] Improve registration conflict feedback for duplicate email/username
- [x] Fix patient view/edit/delete flow from admin user management

## Verification
- `npx tsc -p tsconfig.app.json --noEmit` ✅
- `npm run build` hit an environment-level `esbuild` deadlock before returning Angular diagnostics
