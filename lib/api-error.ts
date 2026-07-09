import { NextResponse } from "next/server";

export function logApiError(scope: string, error: unknown) {
  console.error(
    JSON.stringify({
      level: "error",
      scope,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
  );
}

export function apiErrorResponse(scope: string, message: string, status = 500, error?: unknown) {
  if (error !== undefined) {
    logApiError(scope, error);
  }

  return NextResponse.json({ message }, { status });
}
