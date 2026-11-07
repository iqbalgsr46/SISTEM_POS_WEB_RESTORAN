<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class SignedIdentity {
 public function handle(Request $request, Closure $next) {
  $secret = config('staff.secret');
  abort_unless(is_string($secret) && strlen($secret) >= 32, 503, 'Staff identity configuration missing.');
  $parts = explode('.', $request->header('X-Staff-Identity', ''));
  abort_unless(count($parts) === 2 && hash_equals(hash_hmac('sha256', $parts[0], $secret), $parts[1]), 401);
  $claims = json_decode(base64_decode(strtr($parts[0], '-_', '+/'), true) ?: '', true);
  abort_unless(is_array($claims) && is_int($claims['exp'] ?? null) && $claims['exp'] >= time() && $claims['exp'] <= time()+60
   && ($claims['method'] ?? '') === $request->method() && ($claims['uri'] ?? '') === $request->getRequestUri()
   && hash_equals(hash('sha256', $request->getContent()), $claims['body'] ?? ''), 401);
  $request->attributes->set('identity', $claims);
  return $next($request);
 }
}
