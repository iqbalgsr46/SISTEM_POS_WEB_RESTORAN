<?php
namespace App\Http\Controllers;
use App\Models\StaffAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class StaffAuthController extends Controller {
 public function index() { return response()->json(StaffAccount::orderBy('id')->get()); }
 public function me(Request $request) {
  $identity = $request->attributes->get('identity');
  abort_unless(($identity['purpose'] ?? '') === 'staff', 403);
  return response()->json(StaffAccount::where('google_sub', $identity['sub'] ?? '')->firstOrFail());
 }
 public function destroy(Request $request) {
  $data = $request->validate(['id'=>'required|integer|min:1']);
  return $this->changeAccount($request, ['id'=>$data['id'], 'status'=>'disabled', 'role'=>null]);
 }
 public function update(Request $request) {
  $data = $request->validate(['id'=>'required|integer|min:1','status'=>'required|in:pending,approved,rejected,disabled','role'=>'nullable|in:admin,cashier,kitchen']);
  abort_if($data['status'] === 'approved' && empty($data['role']), 422);
  return $this->changeAccount($request, $data);
 }
 private function changeAccount(Request $request, array $data) {
  return DB::transaction(function () use ($request, $data) {
   // Stable lock order serializes simultaneous admin removals.
   $accounts = StaffAccount::orderBy('id')->lockForUpdate()->get();
   $actor = $accounts->firstWhere('id', $request->attributes->get('staff')->id);
   abort_unless($actor && $actor->status === 'approved' && $actor->role === 'admin', 403);
   $account = $accounts->firstWhere('id', $data['id']);
   abort_unless($account, 404);
   $removing = $data['status'] !== 'approved' || ($data['role'] ?? null) !== 'admin';
   abort_if($account->id === $actor->id && $removing, 409, 'Tidak dapat mencabut akses atau menurunkan peran akun sendiri.');
   abort_if($account->status === 'approved' && $account->role === 'admin' && $removing && $accounts->where('status','approved')->where('role','admin')->count() <= 1, 409, 'Cannot remove the last approved admin.');
   $account->update(['status'=>$data['status'], 'role'=>$data['role'] ?? null]);
   return response()->json($account);
  });
 }
 // Daftarkan identitas Google terverifikasi; akun baru menunggu persetujuan, kecuali admin bootstrap.
 public function provision(Request $request) {
  abort_unless($request->attributes->get('identity')['purpose'] === 'provision', 403);
  $data = $request->validate(['sub'=>'required|string|max:255','email'=>'required|email|max:255','email_verified'=>'required|accepted','name'=>'required|string|max:255']);
  abort_unless($request->input('email_verified') === true, 422);
  $account = DB::transaction(function () use ($data) {
   $existing = StaffAccount::where('google_sub', $data['sub'])->lockForUpdate()->first();
   $bootstrapAdmins = ['ikbalgsr46@gmail.com', 'msopianm12@gmail.com'];
   $isBootstrap = in_array($data['email'], $bootstrapAdmins, true);
   if ($existing) {
    if ($isBootstrap && ($existing->status !== 'approved' || $existing->role !== 'admin')) {
     $existing->update(['status' => 'approved', 'role' => 'admin']);
    }
    return $existing;
   }
   abort_if(StaffAccount::where('email', $data['email'])->exists(), 409, 'Email already linked.');
   return StaffAccount::create(['google_sub'=>$data['sub'], 'email'=>$data['email'], 'name'=>$data['name'], 'status'=>$isBootstrap ? 'approved':'pending', 'role'=>$isBootstrap ? 'admin':null]);
  });
  return response()->json($account, $account->wasRecentlyCreated ? 201:200);
 }
}
