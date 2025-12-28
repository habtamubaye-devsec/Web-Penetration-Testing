<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class ScannerService
{
    private const SCAN_MODES = [
        'full' => [
            'network' => true,
            'firewall' => true,
            'ssl' => true,
            'http' => true,
            'waf' => true,
            'headers' => true,
            'ports' => 'all',
            'intensity' => 'high'
        ],
        'fast' => [
            'network' => true,
            'firewall' => true,
            'ssl' => false,
            'http' => true,
            'waf' => false,
            'headers' => true,
            'ports' => 'common',
            'intensity' => 'medium'
        ],
        'custom' => [
            // Custom options will be determined by user selection
        ]
    ];

    public function runScan(array $scanData): array
    {
        $scanId = $scanData['scan_id'];
        $url = $scanData['url'];
        $scanType = $scanData['scan_type'];
        $customOptions = $scanData['custom_options'] ?? [];
        
        $this->initializeResultFile($scanId);
        
        $results = [];
        $totalSteps = 0;
        $completedSteps = 0;
        
        try {
            $scanMode = self::SCAN_MODES[$scanType];
            
            if ($scanType === 'custom') {
                $scanMode = array_merge(self::SCAN_MODES['custom'], $customOptions);
            }
            
            // Calculate total steps first
            $totalSteps = array_sum(array_map(function($val) {
                return $val ? 1 : 0;
            }, array_intersect_key($scanMode, array_flip(['ssl', 'http', 'network', 'firewall', 'waf', 'headers']))));
            
            // If no steps (shouldn't happen), set to 1 to avoid division by zero
            $totalSteps = max($totalSteps, 1);
            
            $updateProgress = function($stepName) use (&$completedSteps, $totalSteps, $scanId) {
                $completedSteps++;
                $progress = (int) min(100, round(($completedSteps / $totalSteps) * 100));
                $this->updateResultFile($scanId, [
                    'status' => 'running',
                    'progress' => $progress,
                    'message' => ucfirst($stepName) . ' scan completed'
                ]);
                return $progress;
            };
            
            if ($scanMode['ssl'] ?? false) {
                $results['ssl'] = $this->runSslScan($url, $scanId, $scanMode['intensity']);
                $results['progress'] = $updateProgress('ssl');
            }
            
            if ($scanMode['http'] ?? false) {
                $results['http'] = $this->runHttpScan($url, $scanMode['intensity']);
                $results['progress'] = $updateProgress('http');
            }
            
            if ($scanMode['network'] ?? false) {
                $results['network'] = $this->runNetworkScan($url, $scanId, $scanMode);
                $results['progress'] = $updateProgress('network');
            }
            
            if ($scanMode['firewall'] ?? false) {
                $results['firewall'] = $this->runFirewallScan($url, $scanId, $scanMode['intensity']);
                $results['progress'] = $updateProgress('firewall');
            }
            
            if ($scanMode['waf'] ?? false) {
                $results['waf'] = $this->runWafScan($url);
                $results['progress'] = $updateProgress('waf');
            }
            
            if ($scanMode['headers'] ?? false) {
                $results['headers'] = $this->runHeadersScan($url);
                $results['progress'] = $updateProgress('headers');
            }
            
            $this->updateResultFile($scanId, [
                'status' => 'completed',
                'data' => $results,
                'progress' => 100,
                'message' => 'Scan completed successfully'
            ]);
            
            return $results;
        } catch (\Exception $e) {
            $this->updateResultFile($scanId, [
                'status' => 'failed',
                'progress' => $results['progress'] ?? 0,
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }
        
    private function runSslScan(string $url, string $scanId, string $intensity): array
    {
        $scriptPath = base_path('resources/scripts/ssl_scanner.sh');
        $domain = parse_url($url, PHP_URL_HOST);
        
        $pidFile = $this->createPidFile($scanId);
        
        $args = [$scriptPath, $domain];
        if ($intensity === 'high') {
            $args[] = '--full';
        }
        
        $process = new Process($args);
        $process->setTimeout($intensity === 'high' ? 600 : 300);
        
        $this->startProcess($process, $pidFile);
        
        return $this->handleProcessOutput($process, $pidFile, 'SSL');
    }
    
    private function runHttpScan(string $url, string $intensity): array
    {
        $scriptPath = base_path('resources/scripts/http_scanner.sh');
        
        $args = [$scriptPath, $url];
        if ($intensity === 'high') {
            $args[] = '--detailed';
        }
        
        $process = new Process($args);
        $process->setTimeout($intensity === 'high' ? 300 : 120);
        
        $process->run();
        
        if (!$process->isSuccessful()) {
            throw new \RuntimeException("HTTP scan failed: " . $process->getErrorOutput());
        }
        
        return json_decode($process->getOutput(), true);
    }

    private function runNetworkScan(string $url, string $scanId, array $scanMode): array
    {
        try {
            $scriptPath = base_path('resources/scripts/network_scanner.sh');
            $domain = parse_url($url, PHP_URL_HOST);
            
            $pidFile = $this->createPidFile($scanId);
            
            $args = [$scriptPath, $domain];
            
            if ($scanMode['ports'] === 'all') {
                $args[] = '--all-ports';
            }
            if ($scanMode['intensity'] === 'high') {
                $args[] = '--aggressive';
            }
            $process = new Process($args);
            $process->setTimeout($scanMode['intensity'] === 'high' ? 1800 : 600);
            
            $this->startProcess($process, $pidFile);
            
            return $this->handleProcessOutput($process, $pidFile, 'Network');
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'status' => 'failed'
            ];
        }
    }
    
    private function runFirewallScan(string $url, string $scanId, string $intensity): array
    {
        $scriptPath = base_path('resources/scripts/firewall_scanner.sh');
        $domain = parse_url($url, PHP_URL_HOST);
        
        $pidFile = $this->createPidFile($scanId);
        
        $args = [$scriptPath, $domain];
        if ($intensity === 'high') {
            $args[] = '--evasion';
        }
        
        $process = new Process($args);
        $process->setTimeout($intensity === 'high' ? 600 : 300);
        
        $this->startProcess($process, $pidFile);
        
        return $this->handleProcessOutput($process, $pidFile, 'Firewall');
    }
    
    private function runWafScan(string $url): array
    {
        $scriptPath = base_path('resources/scripts/waf_scanner.sh');
        
        $process = new Process([$scriptPath, $url]);
        $process->setTimeout(300);
        $process->run();
        
        if (!$process->isSuccessful()) {
            throw new \RuntimeException("WAF scan failed: " . $process->getErrorOutput());
        }
        
        return json_decode($process->getOutput(), true);
    }
    
    private function runHeadersScan(string $url): array
    {
        $scriptPath = base_path('resources/scripts/headers_scanner.sh');
        
        $process = new Process([$scriptPath, $url]);
        $process->setTimeout(120);
        $process->run();
        
        if (!$process->isSuccessful()) {
            throw new \RuntimeException("Headers scan failed: " . $process->getErrorOutput());
        }
        
        return json_decode($process->getOutput(), true);
    }
    
    private function createPidFile(string $scanId): string
    {
        $pidFile = storage_path("app/processes/{$scanId}.pid");
        
        if (!file_exists(dirname($pidFile))) {
            mkdir(dirname($pidFile), 0755, true);
        }
        
        file_put_contents($pidFile, '');
        return $pidFile;
    }
    
    private function startProcess(Process $process, string $pidFile): void
    {
        $process->start();
        file_put_contents($pidFile, $process->getPid());
    }
    
    private function handleProcessOutput(Process $process, string $pidFile, string $scanType): array
    {
        $process->wait();
        
        if (file_exists($pidFile)) {
            unlink($pidFile);
        }
        
        if (!$process->isSuccessful()) {
            throw new \RuntimeException("{$scanType} scan failed: " . $process->getErrorOutput());
        }
        
        $output = $process->getOutput();
        $decoded = json_decode($output, true);
        
        // Return empty array if output can't be decoded
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'error' => 'Invalid JSON output',
                'raw_output' => $output
            ];
        }
        
        return $decoded ?: [];
    }
    
    private function initializeResultFile(string $scanId): void
    {
        Storage::put("results/{$scanId}.json", json_encode([
            'status' => 'running',
            'data' => null,
            'message' => 'Scan is in progress'
        ]));
    }
    
    private function updateResultFile(string $scanId, array $data): void
    {
        if (Storage::exists("results/{$scanId}.json")) {
            $current = json_decode(Storage::get("results/{$scanId}.json"), true);
            $updated = array_merge($current, $data);
            Storage::put("results/{$scanId}.json", json_encode($updated));
        }
    }

    public function terminateScan(string $scanId): bool
    {
        $pidFile = storage_path("app/processes/{$scanId}.pid");
        
        if (file_exists($pidFile)) {
            $pid = file_get_contents($pidFile);
            
            if ($pid && posix_kill($pid, SIGTERM)) {
                unlink($pidFile);
                return true;
            }
        }
        
        return false;
    }
}