<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScanRequest extends FormRequest
{
    public function rules()
    {
        return [
            'url' => 'required|url',
            'scan_type' => 'required|in:full,fast,custom',
            'scan_id' => 'required|string',
            'callback_url' => 'nullable|url',
            'custom_options' => 'nullable|array',
            'custom_options.network' => 'nullable|boolean',
            'custom_options.firewall' => 'nullable|boolean',
            'custom_options.ssl' => 'nullable|boolean',
            'custom_options.http' => 'nullable|boolean',
            'custom_options.waf' => 'nullable|boolean',
            'custom_options.headers' => 'nullable|boolean',
            'custom_options.ports' => 'nullable|in:common,all',
            'custom_options.intensity' => 'nullable|in:low,medium,high'
        ];
    }
}