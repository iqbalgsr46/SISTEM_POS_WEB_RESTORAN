<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class StaffIdentity
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        // Public tracking is a capability granted only by an unguessable public ID.
        // Keep it independent of stale staff sessions; all other lookups require
        // a signed identity and a currently approved account below.
        $publicId = $request->input('id');
        if ($request->isMethod('GET') && $request->is('api/orders')
            && is_string($publicId) && preg_match('/\AORD-[0-7][0-9A-HJKMNP-TV-Z]{25}\z/', $publicId)) {
            return $next($request);
        }

        abort_unless($request->header('X-Staff-Identity'), 401);
        return (new SignedIdentity)->handle($request, function ($request) use ($next, $roles) {
            $identity = $request->attributes->get('identity');
            abort_unless(($identity['purpose'] ?? '') === 'staff', 403);
            $account = \App\Models\StaffAccount::where('google_sub', $identity['sub'] ?? '')->first();
            abort_unless($account && $account->status === 'approved' && in_array($account->role, $roles, true), 403);
            $request->attributes->set('staff', $account);
            return $next($request);
        });
    }
}
