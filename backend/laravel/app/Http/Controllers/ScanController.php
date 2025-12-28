<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScanRequest;
use App\Jobs\RunScanJob;
use App\Services\SiteValidatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

class ScanController extends Controller
{
    public function __construct(private SiteValidatorService $siteValidator)
    {
    }

    public function startScan(ScanRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        if (!$this->siteValidator->validate($validated['url'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Site is not reachable or does not exist',
                'scan_id' => $validated['scan_id']
            ], 400);
        }

        $this->initializeResultFile($validated['scan_id']);
        RunScanJob::dispatch($validated);

        return response()->json([
            'status' => 'queued',
            'message' => 'Scan has been queued',
            'scan_id' => $validated['scan_id']
        ]);
    }

    private function initializeResultFile(string $scanId): void
    {
        Storage::put("results/{$scanId}.json", json_encode([
            'status' => 'pending',
            'data' => null,
            'message' => 'Scan is pending execution'
        ]));
    }

    public function checkStatus(string $scanId): JsonResponse
    {
        if (!Storage::exists("results/{$scanId}.json")) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Scan ID not found',
            ], 404);
        }

        $result = json_decode(Storage::get("results/{$scanId}.json"), true);

        return response()->json([
            'status' => $result['status'] ?? 'unknown',
            'scan_id' => $scanId,
            // 'data' => $result['data'] ?? null,
            'progress' => $result['progress'] ?? 0,
            'message' => $result['message'] ?? null,
        ]);
    }
        public function completeResult(string $scanId): JsonResponse
    {
        if (!Storage::exists("results/{$scanId}.json")) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Scan ID not found',
            ], 404);
        }

        $result = json_decode(Storage::get("results/{$scanId}.json"), true);
        if ($result['status'] === 'running') {
            return response()->json([
                'status' => 'running',
                'message' => 'Scan is still in progress',
            ], 202);
        } elseif ($result['status'] === 'failed') {
            return response()->json([
                'status' => 'failed',
                'message' => $result['message'] ?? 'Scan failed',
            ], 500);
        } elseif ($result['status'] === 'pending') {
            return response()->json([
                'status' => 'pending',
                'message' => 'Scan is still pending',
            ], 202);
        } elseif ($result['status'] === 'cancelled') {
            return response()->json([
                'status' => 'cancelled',
                'message' => 'Scan has been cancelled',
            ], 200);
        } elseif ($result['status'] === 'completed') {
            return response()->json([
                'status' => $result['status'] ?? 'unknown',
                'scan_id' => $scanId,
                'message' => $result['message'] ?? null,
                'analysis' => $result['analysis'] ?? null,
                'completed_at' => $result['completed_at'] ?? null,
            ]);
        }
    }

    public function cancelScan(string $scanId): JsonResponse
    {
        if (!Storage::exists("results/{$scanId}.json")) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Scan ID not found',
            ], 404);
        }

        $cancelled = RunScanJob::cancel($scanId);

        if ($cancelled) {
            $result = json_decode(Storage::get("results/{$scanId}.json"), true);
            $result['status'] = 'cancelled';
            Storage::put("results/{$scanId}.json", json_encode($result));
        }

        return response()->json([
            'status' => $cancelled ? 'cancellation_requested' : 'cancellation_failed',
            'scan_id' => $scanId,
            'message' => $cancelled 
                ? 'Scan cancellation has been requested' 
                : 'Failed to cancel scan',
        ]);
    }
}