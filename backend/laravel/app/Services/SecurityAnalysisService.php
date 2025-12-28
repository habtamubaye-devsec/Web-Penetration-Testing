<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class SecurityAnalysisService
{
public function analyzeResults(array $scanResults): array
{
    if (empty(config('gemini.api_key'))) {
        return $this->failedAnalysis('Gemini API key not configured');
    }

    if (RateLimiter::tooManyAttempts('gemini-requests', 30)) {
        return $this->failedAnalysis('Analysis rate limit exceeded');
    }

    RateLimiter::hit('gemini-requests', 60);

    try {
        $response = Http::timeout(config('gemini.timeout'))
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($this->getApiUrl(), [
                'contents' => [
                    'parts' => [
                        ['text' => $this->buildSystemPrompt()],
                        ['text' => $this->buildAnalysisPrompt($scanResults)]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.2, // Lower for more deterministic output
                    'maxOutputTokens' => 3000,
                    'responseMimeType' => 'application/json'
                ],
                'safetySettings' => config('gemini.safety_settings')
            ]);

        if ($response->failed()) {
            throw new \RuntimeException($response->json()['error']['message'] ?? 'API request failed');
        }

        $responseData = $response->json();
        
        if (!isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \RuntimeException('Invalid response structure from Gemini');
        }

        return $this->parseAnalysis($responseData['candidates'][0]['content']['parts'][0]['text']);
        
    } catch (\Exception $e) {
        Log::error('Gemini analysis failed: '.$e->getMessage());
        return $this->failedAnalysis($e->getMessage());
    }
}

protected function buildSystemPrompt(): string
{
    return <<<PROMPT
You are a professional cybersecurity analyst. Analyze these scan results and provide:
1. Detailed vulnerability findings in strict JSON format
2. Comprehensive overall security assessment

Output Requirements:
- Use exactly this JSON structure:
{
    "vulnerabilities": [
        {
            "title": "Vulnerability Name",
            "risk": "Low/Medium/High/Critical",
            "description": "Detailed explanation",
            "remediation": "Step-by-step fixes",
            "evidence": "Specific findings from scan"
        }
    ],
    "overall_assessment": {
        "total_vulnerabilities": 0,
        "risk_distribution": {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        },
        "security_score": 0-100,
        "summary": "Overall security posture",
        "strengths": ["List of secure configurations"],
        "recommendations": ["Prioritized action items"]
    }
}

Important Rules:
- Never invent vulnerabilities not present in scan data
- Risk levels must reflect industry standards (OWASP, NIST)
- Remediations must be actionable and specific
- Security score should consider both quantity and severity of findings
PROMPT;
}

protected function buildAnalysisPrompt(array $scanResults): string
{
    $formattedResults = json_encode($scanResults, JSON_PRETTY_PRINT);
    
    return <<<PROMPT
Here are the security scan results to analyze:

{$formattedResults}

Provide the analysis in the exact JSON format specified in the system prompt. Pay special attention to:

1. For each vulnerability:
   - Clear technical title
   - Accurate risk assessment
   - Concise but complete description
   - Practical remediation steps
   - Specific evidence from scan data

2. For overall assessment:
   - Precise vulnerability counts by severity
   - Realistic security score (0-100)
   - Balanced summary highlighting both risks and strengths
   - Actionable prioritized recommendations

Important: Maintain strict JSON validity in your response.
PROMPT;
}



    private function getApiUrl(): string
    {
        return sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
            config('gemini.model'),
            config('gemini.api_key')
        );
    }

   
protected function parseAnalysis(string $responseText): array
{
    $analysis = json_decode($responseText, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new \RuntimeException('Invalid JSON response from Gemini');
    }
    
    // Validate the structure
    $requiredKeys = ['vulnerabilities', 'overall_assessment'];
    foreach ($requiredKeys as $key) {
        if (!isset($analysis[$key])) {
            throw new \RuntimeException("Missing required key in analysis: {$key}");
        }
    }
    
    return $analysis;
}
   
protected function failedAnalysis(string $message): array
{
    return [
        'vulnerabilities' => [],
        'overall_assessment' => [
            'total_vulnerabilities' => 0,
            'risk_distribution' => [
                'critical' => 0,
                'high' => 0,
                'medium' => 0,
                'low' => 0
            ],
            'security_score' => 0,
            'summary' => 'Analysis failed: '.$message,
            'strengths' => [],
            'recommendations' => [
                'Investigate analysis failure reason',
                'Retry the analysis later'
            ]
        ]
    ];
}

  
}