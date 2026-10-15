#!/usr/bin/env bash
API_URL="https://99mr1udul5.execute-api.us-east-1.amazonaws.com/dev/contact"

echo "=== TEST 1: Datos v?lidos (espera 200) ==="
curl -s -i -X POST "$API_URL" -H "Content-Type: application/json" -d '{"name":"Mar?a","email":"maria@ejemplo.com"}'
echo ""

echo "=== TEST 2: Datos incompletos (espera 400) ==="
curl -s -i -X POST "$API_URL" -H "Content-Type: application/json" -d '{"name":"Mar?a"}'
echo ""

echo "=== TEST 3: Preflight OPTIONS (espera 200 y CORS) ==="
curl -s -i -X OPTIONS "$API_URL"
echo ""