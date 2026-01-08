# Production API Verification Steps

After deployment, verify the following endpoints work correctly without redirects and with proper HTTPS/CORS.

## Critical: Database Connection & CORS Fix Verification

These steps verify that the production outage fixes are working:

## A) OPTIONS Preflight (CORS Headers on Error Responses)

```bash
curl -i -X OPTIONS "https://compgradtoolbox-production.up.railway.app/api/login" \
  -H "Origin: https://www.compgradtoolbox.online" \
  -H "Access-Control-Request-Method: POST"
```

**Expected:**
- Status: `200 OK` or `204 No Content` (NOT 500, 502, or 404)
- Headers must include:
  - `Access-Control-Allow-Origin: https://www.compgradtoolbox.online`
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Methods: POST` (or `*`)
  - `Access-Control-Allow-Headers: *` (or specific headers)

**Note:** Even if the endpoint would return an error, CORS headers must be present.

## B) Database Port Configuration Check

```bash
curl -s https://compgradtoolbox-production.up.railway.app/config-check | jq .
```

**Expected:**
- `db_port`: `3306` (or the actual MySQL port from MYSQLPORT env var)
- `db_port` must NOT be `8080` or equal to the app PORT
- `db_host`: Should be Railway MySQL hostname (e.g., `mysql.railway.internal` or similar)
- `db_name`: Database name
- `allowed_origins`: Array including `https://compgradtoolbox.online` and `https://www.compgradtoolbox.online`

## C) Login Endpoint (No 500 Errors)

```bash
curl -i -X POST "https://compgradtoolbox-production.up.railway.app/api/login" \
  -H "Origin: https://www.compgradtoolbox.online" \
  -H "Content-Type: application/json" \
  -d '{"username":"ta1","password":"<redacted>"}'
```

**Expected:**
- Status: `200 OK` (success) OR `401 Unauthorized` (wrong credentials)
- Status must NOT be `500 Internal Server Error`
- Response body: JSON with user data (200) or error message (401)
- CORS headers must be present

**If you see 500:**
- Check Railway logs for database connection errors
- Verify `db_port` from `/config-check` is correct (3306, not 8080)
- Verify database credentials are set correctly in Railway environment variables

## 1. Courses Endpoint (No Redirect)

```bash
curl -i https://compgradtoolbox-production.up.railway.app/api/courses
```

**Expected:**
- Status: `200 OK` (NOT 307, 301, or 404)
- No `Location:` header
- Response body: JSON array of courses

**Also verify backward compatibility:**
```bash
curl -i https://compgradtoolbox-production.up.railway.app/courses
```
Should also return `200 OK` (no redirect).

## 2. OPTIONS Preflight (CORS)

```bash
curl -i -X OPTIONS "https://compgradtoolbox-production.up.railway.app/api/login" \
  -H "Origin: https://compgradtoolbox.online" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

**Expected:**
- Status: `200 OK` or `204 No Content` (NOT 502, 404, or 405)
- Headers must include:
  - `Access-Control-Allow-Origin: https://compgradtoolbox.online`
  - `Access-Control-Allow-Methods: POST` (or `*`)
  - `Access-Control-Allow-Headers: content-type` (or `*`)
  - `Access-Control-Allow-Credentials: true`

## 3. Login POST Request

```bash
curl -i -X POST "https://compgradtoolbox-production.up.railway.app/api/login" \
  -H "Origin: https://compgradtoolbox.online" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123"}'
```

**Expected:**
- Status: `200 OK` (NOT 502, 404, or CORS error)
- Response body: JSON with user data or error message
- CORS headers present if request includes `Origin` header

## 4. Verify HTTPS Scheme Preservation

Check that any redirects (if they occur) use `https://` not `http://`:

```bash
curl -I https://compgradtoolbox-production.up.railway.app/api/courses 2>&1 | grep -i location
```

**Expected:**
- No `Location:` header (since we disabled redirects)
- If `Location:` header exists, it MUST start with `https://`

## A) OPTIONS Preflight (CORS Headers on Error Responses)

```bash
curl -i -X OPTIONS "https://compgradtoolbox-production.up.railway.app/api/login" \
  -H "Origin: https://www.compgradtoolbox.online" \
  -H "Access-Control-Request-Method: POST"
```

**Expected:**
- Status: `200 OK` or `204 No Content` (NOT 500, 502, or 404)
- Headers must include:
  - `Access-Control-Allow-Origin: https://www.compgradtoolbox.online`
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Methods: POST` (or `*`)
  - `Access-Control-Allow-Headers: *` (or specific headers)

**Note:** Even if the endpoint would return an error, CORS headers must be present.

## B) Database Port Configuration Check

```bash
curl -s https://compgradtoolbox-production.up.railway.app/config-check | jq .
```

**Expected:**
- `db_port`: `3306` (or the actual MySQL port from MYSQLPORT env var)
- `db_port` must NOT be `8080` or equal to the app PORT
- `db_host`: Should be Railway MySQL hostname (e.g., `mysql.railway.internal` or similar)
- `db_name`: Database name
- `allowed_origins`: Array including `https://compgradtoolbox.online` and `https://www.compgradtoolbox.online`

## C) Login Endpoint (No 500 Errors)

```bash
curl -i -X POST "https://compgradtoolbox-production.up.railway.app/api/login" \
  -H "Origin: https://www.compgradtoolbox.online" \
  -H "Content-Type: application/json" \
  -d '{"username":"ta1","password":"<redacted>"}'
```

**Expected:**
- Status: `200 OK` (success) OR `401 Unauthorized` (wrong credentials)
- Status must NOT be `500 Internal Server Error`
- Response body: JSON with user data (200) or error message (401)
- CORS headers must be present

**If you see 500:**
- Check Railway logs for database connection errors
- Verify `db_port` from `/config-check` is correct (3306, not 8080)
- Verify database credentials are set correctly in Railway environment variables

## Common Issues

- **502 Bad Gateway**: Check that uvicorn is running with `--proxy-headers --forwarded-allow-ips="*"`
- **307 Redirect with http://**: ProxyHeadersMiddleware not working, check middleware order
- **404 on /api/courses**: Router not included with `/api/courses` prefix
- **CORS errors**: Check `ALLOWED_ORIGINS` environment variable includes production domain
- **500 on login**: Database connection issue - check `db_port` is 3306, not app PORT (8080)
- **"Can't connect to MySQL server"**: Verify Railway MySQL service is running and credentials are correct
- **"Can't connect to MySQL server on 'mysql.railway.internal:8080'"**: This means DB_PORT is using app PORT - check config.py uses DB_PORT not PORT
- **500 on login**: Database connection issue - check `db_port` is 3306, not app PORT (8080)
- **"Can't connect to MySQL server"**: Verify Railway MySQL service is running and credentials are correct

