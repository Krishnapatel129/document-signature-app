- [ ] Implement signer accept/reject-with-reason for signature requests
  - [x] Update SignatureRequest model to support rejected status (and optional rejectionReason)

  - [x] Add token-based endpoints: PUT /api/signature-requests/:token/accept and PUT /api/signature-requests/:token/reject
  - [x] Implement controller logic to set Signature statuses + rejectionReason for reject, and Signed for accept

  - [x] Add audit log entries for accept/reject actions

  - [x] Update PublicSignPage to render Accept/Reject UI and send reason to reject endpoint

  - [x] Update PDF finalization to skip rejected signatures when drawing

- [ ] Run the app and do manual end-to-end verification
  - [ ] Create signature request, open /sign/:token
  - [ ] Place signature fields
  - [ ] Reject with reason, verify stored + status
  - [ ] Accept, verify status
  - [ ] Finalize and ensure rejected signatures are not rendered

