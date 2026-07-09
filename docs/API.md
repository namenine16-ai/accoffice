# API Reference

AccOffice exposes a small REST-style API under `app/api/` for customer and workflow operations.

## Customers

### GET /api/customers

Fetch all customers.

Response: `200`
```json
[
  {
    "id": 1,
    "code": "CUST-001",
    "companyName": "บริษัทตัวอย่าง",
    "taxId": "1234567890123"
  }
]
```

### POST /api/customers

Create a new customer.

Request body:
- `code` (string)
- `companyName` (string)
- `taxId` (string)
- optional customer fields such as `businessType`, `address`, `phone`, `email`, `serviceFee`, `status`

Response: `201`

### GET /api/customers/:id

Load a single customer by ID.

Response: `200`

### PUT /api/customers/:id

Update an existing customer by ID. Accepts the same fields as the create endpoint and returns the updated object.

Response: `200`

### DELETE /api/customers/:id

Delete a customer by ID.

Response: `200`
```json
{ "success": true }
```

## Workflow

### GET /api/workflow

Fetch workflow overview data.

Query parameters:
- `month` — numeric month filter
- `year` — numeric year filter
- `status` — task status filter
- `customerId` — customer filter
- `employeeId` — assigned employee filter
- `query` — text search over customer name, task remarks, or similar fields

Response: `200`

The workflow API returns aggregated overview payloads used by the monthly workflow page.
