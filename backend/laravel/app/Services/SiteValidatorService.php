<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class SiteValidatorService
{
    public function validate(string $url): bool
    {
        try {
            $client = new Client([
                'timeout' => 10,
                'allow_redirects' => true,
                'verify' => false,
            ]);

            $response = $client->head($url, [
                'headers' => [
                    'User-Agent' => 'PentestEngine/1.0',
                ]
            ]);

            return in_array($response->getStatusCode(), [200, 301, 302]);
        } catch (RequestException $e) {
            return false;
        }
    }
}