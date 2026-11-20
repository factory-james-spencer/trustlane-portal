# TrustLane Portal

> **Fictional demo application.** TrustLane Portal, its programs, the FedCollect payment
> service, and every name, number, and endpoint in this repository are made up for a product
> demo. Nothing here is affiliated with any real agency, program, or payment system.

TrustLane Portal is the public-facing portal where members of the TrustLane Air, TrustLane Land,
and TrustLane Commercial programs apply, renew, pay fees, and check application status.

## Services

| Service | Path | Owner |
|---|---|---|
| portal-web | `services/portal-web/` | portal-app |
| renewals-api | `services/renewals-api/` | portal-app |
| status-api | `services/status-api/` | portal-app |
| fees-api | `services/fees-api/` | portal-app |
| identity-gateway | `services/identity-gateway/` | identity |
| renewals-batch | `services/renewals-batch/` | portal-app |

Shared infrastructure (portal-db) and external dependencies (FedCollect, the sign-in provider)
are listed with their owning teams in [`ownership.yaml`](ownership.yaml). Use it to route
incidents and issues.

## fees-api

`fees-api` prices program fees from `FEE_SCHEDULE`, applies surcharges (expedite, late renewal),
and submits the payment to FedCollect. FedCollect accepts amounts as decimal strings with at most
two decimal places, for example `"138.00"`.

## Development

Requires Node.js 24 or later. There are no npm dependencies; TypeScript runs directly through
Node's type stripping.

```sh
npm test
```
