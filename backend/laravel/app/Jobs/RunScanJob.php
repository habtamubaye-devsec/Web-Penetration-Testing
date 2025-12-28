<?php

namespace App\Jobs;

use App\Services\ScannerService;
use App\Services\SecurityAnalysisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

class RunScanJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $maxExceptions = 3;
    public $timeout = 300;
    
    public $scanId;
    private $scanData;

    public function __construct(array $scanData)
    {
        $this->scanData = $scanData;
        $this->scanId = $scanData['scan_id'];
    }

    public function handle(ScannerService $scanner, SecurityAnalysisService $analyzer): void
    {
        $this->markJobAsRunning();
        
        if ($this->isCancelled()) {
            $this->markJobAsCancelled();
            return;
        }

        try {
            // Run the actual scan
            $rawResults = $scanner->runScan($this->scanData);
            
            // Analyze results with AI
            $analysis = $analyzer->analyzeResults($rawResults);
            
            // Prepare complete results package
            $completeResults = [
                'status' => 'completed',
                'scan_id' => $this->scanId,
                'raw_data' => $rawResults,
                'analysis' => $analysis,
                'security_score' => $analysis['security_score'] ?? null,
                'summary' => $analysis['summary'] ?? 'No analysis available',
                'completed_at' => now()->toDateTimeString()
            ];

            // Save results
            $this->updateResultFile($completeResults);
            
            // Send callback if configured
            $this->sendCallbackIfExists($completeResults);

        } catch (\Exception $e) {
            Log::error("Scan failed: " . $e->getMessage());
            
            if ($this->attempts() === $this->tries) {
                $errorData = [
                    'status' => 'failed',
                    'scan_id' => $this->scanId,
                    'message' => $e->getMessage(),
                    'failed_at' => now()->toDateTimeString()
                ];
                
                $this->sendCallbackIfExists($errorData);
                $this->updateResultFile($errorData);
            }
            
            throw $e;
        }
    }

    public static function cancel(string $scanId): bool
    {
        try {
            Cache::put("scan_cancel:{$scanId}", true, 3600);
            
            $jobId = Cache::get("scan_job:{$scanId}");
            if ($jobId) {
                $connection = config('queue.default');
                $queue = config("queue.connections.{$connection}.queue", 'default');
                
                Redis::connection()->lrem("queues:{$queue}:delayed", 0, $jobId);
                Redis::connection()->lrem("queues:{$queue}", 0, $jobId);
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error("Cancellation failed: " . $e->getMessage());
            return false;
        }
    }

    public static function getJobId(string $scanId): ?string
    {
        return Cache::get("scan_job:{$scanId}");
    }

    private function markJobAsRunning(): void
    {
        Cache::put("scan_job:{$this->scanId}", $this->job->getJobId(), 3600);
        $this->updateResultFile([
            'status' => 'running',
            'scan_id' => $this->scanId,
            'started_at' => now()->toDateTimeString(),
            'message' => 'Scan is in progress'
        ]);
    }

    private function markJobAsCancelled(): void
    {
        $this->updateResultFile([
            'status' => 'cancelled',
            'scan_id' => $this->scanId,
            'cancelled_at' => now()->toDateTimeString(),
            'message' => 'Scan was cancelled by user'
        ]);
        Cache::forget("scan_job:{$this->scanId}");
        Cache::forget("scan_cancel:{$this->scanId}");
    }

    private function isCancelled(): bool
    {
        return Cache::has("scan_cancel:{$this->scanId}");
    }

    private function sendCallbackIfExists(array $data): void
    {
        if (!empty($this->scanData['callback_url'])) {
            try {
                $client = new \GuzzleHttp\Client([
                    'timeout' => 15,
                    'connect_timeout' => 5
                ]);
                
                $client->post($this->scanData['callback_url'], [
                    'json' => $data,
                    'headers' => [
                        'User-Agent' => 'PentestEngine/1.0',
                        'Accept' => 'application/json'
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error("Callback failed for scan {$this->scanId}: " . $e->getMessage());
                // Store failed callback attempt
                $this->logFailedCallback($data, $e->getMessage());
            }
        }
    }

    private function logFailedCallback(array $data, string $error): void
    {
        $logData = [
            'scan_id' => $this->scanId,
            'attempted_at' => now()->toDateTimeString(),
            'payload' => $data,
            'error' => $error
        ];
        
        Storage::append("callbacks/failed_{$this->scanId}.log", json_encode($logData));
    }

    private function updateResultFile(array $data): void
    {
        try {
            $filePath = "results/{$this->scanId}.json";
            
            // Merge with existing data if available
            $current = Storage::exists($filePath) 
                ? json_decode(Storage::get($filePath), true) 
                : [];
                
            $completeData = array_merge($current, $data);
            
            // Ensure directory exists
            if (!Storage::exists('results')) {
                Storage::makeDirectory('results');
            }
            
            Storage::put($filePath, json_encode($completeData, JSON_PRETTY_PRINT));
            
        } catch (\Exception $e) {
            Log::error("Failed to update result file for scan {$this->scanId}: " . $e->getMessage());
        }
    }

    public function failed(\Throwable $exception): void
    {
        $errorData = [
            'status' => 'failed',
            'scan_id' => $this->scanId,
            'message' => $exception->getMessage(),
            'failed_at' => now()->toDateTimeString(),
            'exception' => get_class($exception),
            'trace' => $exception->getTraceAsString()
        ];
        
        $this->updateResultFile($errorData);
        $this->sendCallbackIfExists($errorData);
        Cache::forget("scan_job:{$this->scanId}");
    }
}