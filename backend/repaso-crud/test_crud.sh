#!/usr/bin/env bash
API_URL="https://5mvivpiwak.execute-api.us-east-1.amazonaws.com/dev"

echo "=== 1. GET /items/25 ==="
curl -s -X GET "$API_URL/items/25"
echo ""

echo "=== 2. POST /items ==="
curl -s -X POST "$API_URL/items" -H "Content-Type: application/json" -d '{"name":"Teclado","price":25}'
echo ""

echo "=== 3. PUT /items/25 ==="
curl -s -X PUT "$API_URL/items/25" -H "Content-Type: application/json" -d '{"name":"Teclado Pro","price":35}'
echo ""

echo "=== 4. PATCH /items/25 ==="
curl -s -X PATCH "$API_URL/items/25" -H "Content-Type: application/json" -d '{"price":30}'
echo ""

echo "=== 5. DELETE /items/25 ==="
curl -s -X DELETE "$API_URL/items/25"
echo ""