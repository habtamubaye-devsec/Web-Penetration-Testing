<?php

use App\Http\Controllers\ScanController;
use Illuminate\Support\Facades\Route;


Route::post('/scan', [ScanController::class, 'startScan']);
Route::get('/scan/result/{scanId}', [ScanController::class, 'completeResult']);
Route::get('/scan/status/{scanId}', [ScanController::class, 'checkStatus']);
Route::post('/scan/cancel/{scanId}', [ScanController::class, 'cancelScan']);


Route::prefix('v1')->group(function () {
    Route::post('/scan', [ScanController::class, 'startScan']);
    Route::get('/scan/result/{scanId}', [ScanController::class, 'completeResult']);
    Route::get('/scan/status/{scanId}', [ScanController::class, 'checkStatus']);
    Route::post('/scan/cancel/{scanId}', [ScanController::class, 'cancelScan']);
});