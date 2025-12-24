#!/usr/bin/env bash
# Usage: 
#   export RENDER_API_KEY="<your-render-api-key>"
#   export RENDER_SERVICE_ID="<your-backend-service-id>"
#   ./tools/set_render_env.sh server/.env.rotate

if [ -z "$RENDER_API_KEY" ] || [ -z "$RENDER_SERVICE_ID" ]; then
  echo "Please set RENDER_API_KEY and RENDER_SERVICE_ID environment variables." >&2
  exit 1
fi

ENV_FILE=${1:-server/.env.rotate}
if [ ! -f "$ENV_FILE" ]; then
  echo "Env file $ENV_FILE not found" >&2
  exit 1
fi

API="https://api.render.com/v1/services/$RENDER_SERVICE_ID/env-vars"

while IFS= read -r line; do
  # skip comments and empty lines
  [[ "$line" =~ ^# ]] && continue
  [[ -z "$line" ]] && continue
  KEY=$(echo "$line" | cut -d'=' -f1)
  VALUE=$(echo "$line" | cut -d'=' -f2-)
  echo "Setting $KEY..."
  curl -s -X POST "$API" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{ \"key\": \"$KEY\", \"value\": \"$VALUE\", \"secure\": true }" \
    | jq .
done < "$ENV_FILE"

echo "Done. Review env vars in Render dashboard and trigger deploy." 
